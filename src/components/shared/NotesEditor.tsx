"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { StickyNote } from "lucide-react";

interface NotesEditorProps {
    storageKey: string; // "stock_notes" vs "forex_notes"
    title?: string;
}

export default function NotesEditor({ storageKey, title = "Notes" }: NotesEditorProps) {
    // Directly bind state to Local Storage
    const [notes, setNotes] = useLocalStorage<string>(storageKey, "");

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2 text-slate-700">
                    <StickyNote size={18} className="text-yellow-500" />
                    <h3 className="font-semibold text-sm">{title}</h3>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                    Auto-saving
                </span>
            </div>

            {/* Text Area */}
            <textarea
                className="flex-1 w-full p-4 resize-none focus:outline-none text-slate-700 text-sm font-mono leading-relaxed placeholder:text-slate-300"
                placeholder={`Write your ${title.toLowerCase()} here...`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                spellCheck={false}
            />
        </div>
    );
}