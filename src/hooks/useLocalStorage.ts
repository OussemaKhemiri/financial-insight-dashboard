// src/hooks/useLocalStorage.ts
import { useState, useEffect } from "react";
import { safelyGetStorage, safelySetStorage } from "@/lib/storage";

export function useLocalStorage<T>(key: string, initialValue: T) {
    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState<T>(() => {
        const item = safelyGetStorage(key);
        return item !== null ? item : initialValue;
    });

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
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