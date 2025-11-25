// src/lib/storage.ts

export const safelyGetStorage = (key: string): any | null => {
    if (typeof window === "undefined") return null;
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error);
        return null;
    }
};

export const safelySetStorage = (key: string, value: any): void => {
    if (typeof window === "undefined") return;
    try {
        const serialized = JSON.stringify(value);
        window.localStorage.setItem(key, serialized);
        // Dispatch a custom event so other components know storage changed
        window.dispatchEvent(new Event("local-storage-update"));
    } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
    }
};

export const safelyRemoveStorage = (key: string): void => {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.removeItem(key);
        window.dispatchEvent(new Event("local-storage-update"));
    } catch (error) {
        console.warn(`Error removing localStorage key "${key}":`, error);
    }
};

export const getAllStorageItems = (): Record<string, any> => {
    if (typeof window === "undefined") return {};
    const items: Record<string, any> = {};
    for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) {
            items[key] = safelyGetStorage(key);
        }
    }
    return items;
};