"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

export interface ForexPosition {
    id: string;
    pair: string;
    position: "BUY" | "SELL";
    aiAction: string; // The "Action" column filled by Gemini later
}

export default function ForexPortfolio() {
    const [portfolio, setPortfolio] = useLocalStorage<ForexPosition[]>("forex_portfolio", []);

    // Local state for the input form
    const [newPair, setNewPair] = useState("");
    const [newPosition, setNewPosition] = useState<"BUY" | "SELL">("BUY");

    const handleAdd = () => {
        if (!newPair.trim()) return;

        const newItem: ForexPosition = {
            id: Date.now().toString(),
            pair: newPair.toUpperCase().trim(),
            position: newPosition,
            aiAction: "Pending AI", // Default state as requested
        };

        setPortfolio([...portfolio, newItem]);
        setNewPair(""); // Reset input
    };

    const handleDelete = (id: string) => {
        setPortfolio(portfolio.filter((item) => item.id !== id));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleAdd();
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="px-4 py-3 border-b bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-700 text-sm">Forex Portfolio</h3>
                <span className="text-xs text-slate-400">{portfolio.length} Active Positions</span>
            </div>

            {/* Table Container - Scrollable */}
            <div className="flex-1 overflow-y-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-2">Pair</th>
                            <th className="px-4 py-2">Position</th>
                            <th className="px-4 py-2">Action (AI)</th>
                            <th className="px-2 py-2 w-8"></th> 
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {portfolio.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic text-xs">
                                    No positions added yet.
                                </td>
                            </tr>
                        ) : (
                            portfolio.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 group">
                                    <td className="px-4 py-2 font-mono font-medium text-slate-700">
                                        {item.pair}
                                    </td>
                                    <td className="px-4 py-2">
                                        <span
                                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${item.position === "BUY"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {item.position === "BUY" ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                            {item.position}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-xs text-slate-400 italic">
                                        {/* This is the column Gemini will eventually update */}
                                        {item.aiAction}
                                    </td>
                                    <td className="px-2 py-2 text-right">
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Input Footer */}
            <div className="border-t p-2 bg-slate-50 grid grid-cols-[1fr_auto_auto] gap-2 items-center">
                <input
                    type="text"
                    placeholder="Pair (e.g. EURUSD)"
                    value={newPair}
                    onChange={(e) => setNewPair(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="px-3 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono"
                />

                <select
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value as "BUY" | "SELL")}
                    className={`px-2 py-1.5 text-sm border rounded focus:outline-none font-bold ${newPosition === "BUY" ? "text-green-600" : "text-red-600"
                        }`}
                >
                    <option value="BUY" className="text-green-600">BUY</option>
                    <option value="SELL" className="text-red-600">SELL</option>
                </select>

                <button
                    onClick={handleAdd}
                    disabled={!newPair.trim()}
                    className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    <Plus size={18} />
                </button>
            </div>
        </div>
    );
}