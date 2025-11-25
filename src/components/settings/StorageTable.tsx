// src/components/settings/StorageTable.tsx
"use client";

import { useState, useEffect } from "react";
import { getAllStorageItems, safelyRemoveStorage, safelySetStorage } from "@/lib/storage";
import { Trash2, Edit2, Check, X } from "lucide-react";

export default function StorageTable() {
    const [items, setItems] = useState<Record<string, any>>({});
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>("");

    // Refresh items on mount and listen for updates
    const refreshItems = () => {
        setItems(getAllStorageItems());
    };

    useEffect(() => {
        refreshItems();

        // Listen for the custom event we dispatched in lib/storage.ts
        const handleStorageUpdate = () => refreshItems();
        window.addEventListener("local-storage-update", handleStorageUpdate);

        return () => window.removeEventListener("local-storage-update", handleStorageUpdate);
    }, []);

    const handleDelete = (key: string) => {
        if (confirm(`Are you sure you want to delete "${key}"?`)) {
            safelyRemoveStorage(key);
        }
    };

    const startEdit = (key: string, value: any) => {
        setEditingKey(key);
        // Pretty print JSON for editing
        setEditValue(typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value));
    };

    const saveEdit = (key: string) => {
        try {
            // Try to parse back to JSON if possible, otherwise string
            let parsedValue;
            try {
                parsedValue = JSON.parse(editValue);
            } catch {
                parsedValue = editValue;
            }
            safelySetStorage(key, parsedValue);
            setEditingKey(null);
        } catch (e) {
            alert("Error saving value");
        }
    };

    return (
        <div className="w-full bg-white border rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b">
                <h3 className="font-bold text-slate-700">Local Storage Inspector</h3>
                <p className="text-xs text-slate-500">View and manage all persisted data.</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3">Key</th>
                            <th className="px-4 py-3">Value</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {Object.entries(items).length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                                    No data found in Local Storage.
                                </td>
                            </tr>
                        ) : (
                            Object.entries(items).map(([key, value]) => (
                                <tr key={key} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-mono text-blue-600 font-medium">{key}</td>
                                    <td className="px-4 py-3 max-w-md">
                                        {editingKey === key ? (
                                            <textarea
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                className="w-full h-24 p-2 border rounded font-mono text-xs focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <div className="truncate font-mono text-slate-500 text-xs" title={JSON.stringify(value)}>
                                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            {editingKey === key ? (
                                                <>
                                                    <button onClick={() => saveEdit(key)} className="text-green-600 hover:bg-green-50 p-1 rounded">
                                                        <Check size={16} />
                                                    </button>
                                                    <button onClick={() => setEditingKey(null)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                                        <X size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => startEdit(key, value)} className="text-blue-500 hover:bg-blue-50 p-1 rounded">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(key)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}