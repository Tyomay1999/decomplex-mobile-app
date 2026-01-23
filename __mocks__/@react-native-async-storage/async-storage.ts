type StoredValue = string;

const store = new Map<string, StoredValue>();

async function setItem(key: string, value: string): Promise<void> {
    store.set(key, value);
}

async function getItem(key: string): Promise<string | null> {
    return store.has(key) ? store.get(key)! : null;
}

async function removeItem(key: string): Promise<void> {
    store.delete(key);
}

async function clear(): Promise<void> {
    store.clear();
}

const AsyncStorage = {
    setItem,
    getItem,
    removeItem,
    clear,
};

export default AsyncStorage;