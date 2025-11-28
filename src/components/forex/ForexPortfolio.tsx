"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useGemini } from "@/hooks/useGemini";
import { Plus, Trash2, TrendingUp, TrendingDown, Sparkles, X, Clock } from "lucide-react";
import { useState } from "react";

export interface ForexPosition {
    id: string;
    pair: string;
    position: "BUY" | "SELL";
    aiAction: string;
}

export default function ForexPortfolio() {
    const [portfolio, setPortfolio] = useLocalStorage<ForexPosition[]>("forex_portfolio", []);
    const [lastUpdated, setLastUpdated] = useLocalStorage<string>("forex_portfolio_last_updated", "");

    // AI Hooks
    const { analyzePortfolio, isLoading, error } = useGemini();

    // UI State
    const [newPair, setNewPair] = useState("");
    const [newPosition, setNewPosition] = useState<"BUY" | "SELL">("BUY");
    const [showModal, setShowModal] = useState(false);
    const [aiSummary, setAiSummary] = useState("");

    const handleAdd = () => {
        if (!newPair.trim()) return;

        const newItem: ForexPosition = {
            id: Date.now().toString(),
            pair: newPair.toUpperCase().trim(),
            position: newPosition,
            aiAction: "-",
        };

        setPortfolio([...portfolio, newItem]);
        setNewPair("");
    };

    const handleDelete = (id: string) => {
        setPortfolio(portfolio.filter((item) => item.id !== id));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleAdd();
    };

    // --- AI ANALYSIS LOGIC ---
    const handleAnalyze = async () => {
        if (portfolio.length === 0) return;

        const result = await analyzePortfolio(portfolio);

        if (result) {
            // 1. Show Summary Modal
            setAiSummary(result.summary);
            setShowModal(true);

            // 2. Update Timestamp
            setLastUpdated(new Date().toLocaleString());

            // 3. Update "Action" column in Portfolio
            // We map through existing items and check if the AI returned an action for that Pair
            const updatedPortfolio = portfolio.map(item => ({
                ...item,
                aiAction: result.analysis[item.pair] || "HOLD" // Default if AI missed it
            }));

            setPortfolio(updatedPortfolio);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* Header */}
            <div className="px-4 py-3 border-b bg-slate-50 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-slate-700 text-sm">Forex Portfolio</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span>{portfolio.length} Positions</span>
                        {lastUpdated && (
                            <span className="flex items-center gap-1 border-l pl-2">
                                <Clock size={10} /> {lastUpdated}
                            </span>
                        )}
                    </div>
                </div>

                {/* Analyze Button */}
                <button
                    onClick={handleAnalyze}
                    disabled={isLoading || portfolio.length === 0}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                    {isLoading ? (
                        <span className="animate-pulse">Thinking...</span>
                    ) : (
                        <>
                            <Sparkles size={12} /> Analyze
                        </>
                    )}
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 text-red-600 text-xs px-4 py-2 border-b">
                    Error: {error}
                </div>
            )}

            {/* Table Container */}
            <div className="flex-1 overflow-y-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-2">Pair</th>
                            <th className="px-4 py-2">Pos</th>
                            <th className="px-4 py-2">AI Action</th>
                            <th className="px-2 py-2 w-8"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {portfolio.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic text-xs">
                                    Add positions to start tracking.
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
                                    <td className="px-4 py-2 text-xs font-semibold">
                                        {/* Color Coded Actions */}
                                        <span className={`
                                            ${item.aiAction === "CLOSE" ? "text-red-600" : ""}
                                            ${item.aiAction === "ADD" ? "text-green-600" : ""}
                                            ${item.aiAction === "HOLD" ? "text-orange-500" : ""}
                                            ${item.aiAction === "-" ? "text-slate-300" : ""}
                                        `}>
                                            {item.aiAction}
                                        </span>
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
                    className="px-3 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase font-mono"
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
                    className="bg-slate-700 text-white p-1.5 rounded hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                    <Plus size={18} />
                </button>
            </div>

            {/* Analysis Result Modal */}
            {showModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm max-h-[80%] flex flex-col animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-3 border-b">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Sparkles size={16} className="text-indigo-600" />
                                AI Insight
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto text-sm text-slate-600 leading-relaxed">
                            {aiSummary}
                        </div>
                        <div className="p-3 border-t bg-slate-50 text-right">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}