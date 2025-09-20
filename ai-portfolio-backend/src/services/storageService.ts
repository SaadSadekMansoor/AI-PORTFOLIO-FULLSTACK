import dotenv from 'dotenv';
dotenv.config();

const TTL_SECONDS = process.env.STORAGE_TTL_SECONDS
  ? Number(process.env.STORAGE_TTL_SECONDS)
  : 3600;

type StoredItem = {
  status: 'pending' | 'ready' | 'failed';
  html?: string;
  assets?: Record<string, string>;
  metadata?: any;
};

const inMemoryStore = new Map<string, { item: StoredItem; expiresAt: number }>();

export const storage = {
  async storePending(id: string, payload: any) {
    const item: StoredItem = { status: 'pending', metadata: payload };
    inMemoryStore.set(id, { item, expiresAt: Date.now() + TTL_SECONDS * 1000 });
  },

  async storeFailed(id: string, payload: any) {
    const item: StoredItem = { status: 'failed', metadata: payload };
    inMemoryStore.set(id, { item, expiresAt: Date.now() + TTL_SECONDS * 1000 });
  },

  async storeResult(id: string, payload: StoredItem) {
    inMemoryStore.set(id, { item: payload, expiresAt: Date.now() + TTL_SECONDS * 1000 });
  },

  async get(id: string): Promise<StoredItem | null> {
    const found = inMemoryStore.get(id);
    if (!found) return null;
    if (Date.now() > found.expiresAt) {
      inMemoryStore.delete(id);
      return null;
    }
    return found.item;
  },
};
