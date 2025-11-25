// src/components/settings/ApiKeyInput.tsx
"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Eye, EyeOff, Save } from "lucide-react";
import { useState } from "react";

interface ApiKeyInputProps {
    storageKey: string;
    label: string;
    placeholder?: string;
}

export default function ApiKeyInput({ storageKey, label, placeholder }: ApiKeyInputProps) {
    const [key, setKey] = useLocalStorage<string>(storageKey, "");
    const [isVisible, setIsVisible] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
        // The hook automatically saves on change, but we add a manual visual cue
        // setKey is called on onChange, so here we just show "Saved!"
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div className="flex flex-col gap-2 p-4 bg-white border rounded-lg shadow-sm">
            <label className="text-sm font-semibold text-slate-700">{label}</label>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <input
                        type={isVisible ? "text" : "password"}
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder={placeholder}
                        className="w-full p-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                    <button
                        onClick={() => setIsVisible(!isVisible)}
                        className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                    >
                        {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
                <button
                    onClick={handleSave}
                    className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${isSaved ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                >
                    {isSaved ? "Saved" : <Save size={16} />}
                </button>
            </div>
        </div>
    );
}