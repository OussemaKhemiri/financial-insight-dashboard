"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Save } from "lucide-react";
import { useState } from "react";

interface ModelNameInputProps {
    storageKey?: string;
    label?: string;
    placeholder?: string;
}

export default function ModelNameInput({
    storageKey = "gemini_model_name",
    label = "Gemini Model Name",
    placeholder = "gemini-2.5-flash-live",
}: ModelNameInputProps) {
    const [model, setModel] = useLocalStorage<string>(storageKey, "");
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
        // The hook saves on change; this only shows a visual "Saved" cue.
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div className="flex flex-col gap-2 p-4 bg-white border rounded-lg shadow-sm">
            <label className="text-sm font-semibold text-slate-700">{label}</label>
            <div className="flex gap-2">
                <input
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder={placeholder}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
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