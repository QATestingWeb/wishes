import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Storage layer.
 *
 * The MVP ships with a local-disk driver so it runs anywhere with zero setup
 * (a VPS, Docker, Railway, Render, Fly with a volume). Every read/write goes
 * through the two small interfaces below, so moving to object storage
 * (S3 / Cloudflare R2) and a database (Postgres) means swapping these
 * implementations — no page or API code changes.
 */

export interface BlobStore {
  put(key: string, data: Buffer): Promise<void>;
  get(key: string): Promise<Buffer | null>;
  delete(key: string): Promise<void>;
  list(): Promise<{ key: string; modifiedAt: number }[]>;
}

export interface JsonStore {
  read<T>(collection: string, id: string): Promise<T | null>;
  write<T>(collection: string, id: string, value: T): Promise<void>;
  delete(collection: string, id: string): Promise<void>;
  list(collection: string): Promise<string[]>;
  /** Serialises read-modify-write cycles on one record. */
  update<T>(collection: string, id: string, fn: (current: T | null) => T | null): Promise<T | null>;
}

const SAFE = /^[a-zA-Z0-9_-]{1,80}$/;
function assertSafe(...parts: string[]) {
  for (const p of parts) if (!SAFE.test(p)) throw new Error(`Unsafe storage key: ${p}`);
}

function dataDir() {
  return path.resolve(
    /* turbopackIgnore: true */ process.env.DATA_DIR || path.join(/* turbopackIgnore: true */ process.cwd(), ".data"),
  );
}

async function atomicWrite(file: string, data: Buffer | string) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, data);
  await fs.rename(tmp, file);
}

const locks = new Map<string, Promise<unknown>>();
async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(key) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  locks.set(key, next.catch(() => undefined));
  try {
    return await next;
  } finally {
    if (locks.get(key) === next) locks.delete(key);
  }
}

class LocalBlobStore implements BlobStore {
  private dir() {
    return path.join(dataDir(), "photos");
  }
  private file(key: string) {
    assertSafe(key);
    return path.join(this.dir(), `${key}.webp`);
  }
  async put(key: string, data: Buffer) {
    await atomicWrite(this.file(key), data);
  }
  async get(key: string) {
    try {
      return await fs.readFile(this.file(key));
    } catch {
      return null;
    }
  }
  async delete(key: string) {
    await fs.rm(this.file(key), { force: true });
  }
  async list() {
    try {
      const names = await fs.readdir(this.dir());
      const out: { key: string; modifiedAt: number }[] = [];
      for (const n of names) {
        if (!n.endsWith(".webp")) continue;
        const st = await fs.stat(path.join(this.dir(), n));
        out.push({ key: n.slice(0, -5), modifiedAt: st.mtimeMs });
      }
      return out;
    } catch {
      return [];
    }
  }
}

class LocalJsonStore implements JsonStore {
  private file(collection: string, id: string) {
    assertSafe(collection, id);
    return path.join(dataDir(), collection, `${id}.json`);
  }
  async read<T>(collection: string, id: string): Promise<T | null> {
    try {
      return JSON.parse(await fs.readFile(this.file(collection, id), "utf8")) as T;
    } catch {
      return null;
    }
  }
  async write<T>(collection: string, id: string, value: T) {
    await atomicWrite(this.file(collection, id), JSON.stringify(value, null, 2));
  }
  async delete(collection: string, id: string) {
    await fs.rm(this.file(collection, id), { force: true });
  }
  async list(collection: string) {
    assertSafe(collection);
    try {
      const names = await fs.readdir(path.join(dataDir(), collection));
      return names.filter((n) => n.endsWith(".json")).map((n) => n.slice(0, -5));
    } catch {
      return [];
    }
  }
  async update<T>(collection: string, id: string, fn: (current: T | null) => T | null) {
    return withLock(`${collection}/${id}`, async () => {
      const current = await this.read<T>(collection, id);
      const next = fn(current);
      if (next === null) await this.delete(collection, id);
      else await this.write(collection, id, next);
      return next;
    });
  }
}

export const blobs: BlobStore = new LocalBlobStore();
export const db: JsonStore = new LocalJsonStore();
