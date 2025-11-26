// src/hooks/useLocalStorage.ts
import { useState, useEffect } from "react";
import { safelyGetStorage, safelySetStorage } from "@/lib/storage";

export function useLocalStorage<T>(key: string, initialValue: T) {
    // 1. Always start with 'initialValue' so Server HTML matches Client HTML exactly.
    // This prevents the "Hydration failed" error.
    const [storedValue, setStoredValue] = useState<T>(initialValue);

    // 2. After the component mounts (Client-side only), load the real data.
    useEffect(() => {
        const item = safelyGetStorage(key);
        if (item !== null) {
            setStoredValue(item);
        }
    }, [key]);

    // 3. Wrapper to set state and local storage simultaneously
    const setValue = (value: T | ((val: T) => T)) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;

            // Save state
            setStoredValue(valueToStore);

            // Save to local storage
            safelySetStorage(key, valueToStore);
        } catch (error) {
            console.log(error);
        }
    };

    return [storedValue, setValue] as const;
}