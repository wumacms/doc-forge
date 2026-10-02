/**
 * 键值持久层：优先 IndexedDB（容量大，适合存放 PDF base64 等二进制内容），
 * IndexedDB 不可用 / 失败时自动降级到 localStorage。
 * 偏好设置体量小，直接走 localStorage（next-themes 本身也用它存主题）。
 */

const DB_NAME = "docforge";
const STORE = "kv";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB 不可用"));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB 打开失败"));
    req.onblocked = () => reject(new Error("IndexedDB 被旧连接阻塞"));
  });
}

let dbPromise: Promise<IDBDatabase> | null = null;
function getDb(): Promise<IDBDatabase> {
  if (!dbPromise) dbPromise = openDb();
  return dbPromise;
}

async function idbGet<T>(key: string): Promise<T | null> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () =>
      resolve(req.result === undefined ? null : (req.result as T));
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key: string, value: unknown): Promise<void> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

/** 读取工作区数据；IDB 失败时回退 localStorage 同名键 */
export async function kvGet<T>(key: string): Promise<T | null> {
  try {
    return await idbGet<T>(key);
  } catch {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }
}

/** 写入工作区数据；IDB 失败时回退 localStorage */
export async function kvSet(key: string, value: unknown): Promise<void> {
  try {
    await idbSet(key, value);
  } catch {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("[DocForge] 持久化失败（存储可能已满）：", e);
    }
  }
}
