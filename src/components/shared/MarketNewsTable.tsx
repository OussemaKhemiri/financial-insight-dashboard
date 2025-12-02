"use client";

import { useMarketNews, NewsItem } from "@/hooks/useMarketNews";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { RefreshCw, ExternalLink, Highlighter, Plus, X, Check, Clock } from "lucide-react";
import { useState } from "react";

// Define the structure for a keyword
interface Keyword {
    text: string;
    color: string; // Hex code
}

// Predefined pastel colors for highlighting
const COLOR_PALETTE = [
    { name: "Yellow", hex: "#fef08a" }, // yellow-200
    { name: "Green", hex: "#bbf7d0" },  // green-200
    { name: "Blue", hex: "#bfdbfe" },    // blue-200
    { name: "Red", hex: "#fecaca" },     // red-200
    { name: "Purple", hex: "#e9d5ff" },  // purple-200
    { name: "Orange", hex: "#fed7aa" },  // orange-200
];

export default function MarketNewsTable() {
    const { data, loading, refreshNews, lastUpdated } = useMarketNews();
    const categories = ["forex", "markets", "world", "stocks", "commodities", "crypto"];

    const [keywords, setKeywords] = useLocalStorage<Keyword[]>("news_highlights_v2", []);
    const [inputVal, setInputVal] = useState("");
    const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0].hex);

    // --- KEYWORD LOGIC ---
    const handleAddKeyword = () => {
        if (!inputVal.trim()) return;
        const text = inputVal.trim().toLowerCase();
        if (!keywords.some(k => k.text === text)) {
            setKeywords([...keywords, { text, color: selectedColor }]);
        }
        setInputVal("");
    };

    const handleRemoveKeyword = (textToRemove: string) => {
        setKeywords(keywords.filter(k => k.text !== textToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleAddKeyword();
    };

    // --- HIGHLIGHT LOGIC ---
    const highlightText = (text: string) => {
        if (keywords.length === 0) return text;
        const safeKeywords = keywords.map(k => k.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const regex = new RegExp(`(${safeKeywords.join("|")})`, "gi");
        const parts = text.split(regex);

        return parts.map((part, i) => {
            const match = keywords.find(k => k.text === part.toLowerCase());
            return match ? (
                <span key={i} style={{ backgroundColor: match.color }} className="text-slate-900 font-bold px-1 rounded-sm border border-black/5 shadow-sm">
                    {part}
                </span>
            ) : part;
        });
    };

    // --- DATE HELPERS ---

    // 1. Check if date is today (returns boolean)
    const isDateToday = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            const now = new Date();
            return date.toDateString() === now.toDateString();
        } catch {
            return false;
        }
    };

    // 2. Format date nicely
    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            const isToday = isDateToday(dateStr); // Re-use the check
            return isToday
                ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        } catch {
            return "";
        }
    };

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* Header Section (Unchanged) */}
            <div className="border-b bg-slate-50 flex flex-col gap-2 p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-700">Live Market News</h3>
                        {loading && <span className="text-xs text-blue-500 animate-pulse">Updating...</span>}
                    </div>
                    <div className="flex items-center gap-3">
                        {lastUpdated && <span className="text-xs text-slate-400">{lastUpdated.toLocaleTimeString()}</span>}
                        <button onClick={refreshNews} disabled={loading} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded transition-all">
                            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center bg-white border rounded p-1 shadow-sm gap-2">
                        <Highlighter size={14} className="text-slate-400 ml-1" />
                        <input
                            type="text"
                            value={inputVal}
                            onChange={(e) => setInputVal(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Highlight (e.g. CPI)..."
                            className="text-xs outline-none w-32 text-slate-700 placeholder:text-slate-400"
                        />
                        <div className="flex items-center gap-1 border-l pl-2">
                            {COLOR_PALETTE.map((c) => (
                                <button
                                    key={c.hex}
                                    onClick={() => setSelectedColor(c.hex)}
                                    style={{ backgroundColor: c.hex }}
                                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${selectedColor === c.hex ? 'ring-1 ring-offset-1 ring-slate-400 scale-110' : ''}`}
                                >
                                    {selectedColor === c.hex && <Check size={8} className="text-black/50" />}
                                </button>
                            ))}
                        </div>
                        <button onClick={handleAddKeyword} disabled={!inputVal.trim()} className="text-indigo-600 hover:text-indigo-800 disabled:opacity-50 ml-1">
                            <Plus size={16} />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {keywords.map(k => (
                            <span key={k.text} style={{ backgroundColor: k.color }} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-slate-800 text-[10px] font-bold border border-black/5 shadow-sm">
                                {k.text.toUpperCase()}
                                <button onClick={() => handleRemoveKeyword(k.text)} className="hover:text-red-600 opacity-60 hover:opacity-100">
                                    <X size={10} />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* The Grid */}
            <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
                        {categories.map((cat) => (
                            <div key={cat} className="flex flex-col gap-2 min-w-0">
                                <h4 className="font-bold uppercase text-xs tracking-wider text-slate-500 border-b pb-2 mb-1 sticky top-0 bg-white z-10">
                                    {cat}
                                </h4>
                                <div className="flex flex-col gap-2">
                                    {data[cat]?.length === 0 ? (
                                        <p className="text-xs text-slate-400 italic">No news available.</p>
                                    ) : (
                                        data[cat].map((item: NewsItem, idx: number) => {
                                            // Check if this specific item is from today
                                            const isToday = isDateToday(item.pubDate);

                                            return (
                                                <article
                                                    key={`${item.link}-${idx}`}
                                                    className={`
                                                        group flex flex-col gap-1 p-2 rounded-md border transition-all
                                                        ${isToday
                                                            ? "bg-emerald-50/60 border-emerald-100" // STYLE FOR TODAY
                                                            : "bg-white border-transparent hover:bg-slate-50" // STYLE FOR OLDER
                                                        }
                                                    `}
                                                >
                                                    <div className="flex justify-between items-start gap-2">
                                                        <a
                                                            href={item.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-medium text-slate-700 hover:text-blue-600 leading-tight line-clamp-3 group-hover:underline"
                                                        >
                                                            {highlightText(item.title)}
                                                        </a>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <div className="flex items-center gap-1">
                                                            {/* Add a tiny indicator icon if it is today */}
                                                            {isToday && <Clock size={10} className="text-emerald-500" />}
                                                            <span className={`text-[10px] font-mono ${isToday ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                                                                {formatDate(item.pubDate)}
                                                            </span>
                                                        </div>
                                                        <ExternalLink size={10} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                    {/* Removed the separator line since we now use cards/boxes */}
                                                </article>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
} 