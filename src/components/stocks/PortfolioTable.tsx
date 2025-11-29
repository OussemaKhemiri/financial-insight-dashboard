"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { safelyGetStorage } from "@/lib/storage";
import { enrichStockData } from "@/lib/gemini";
import { Plus, Trash2, TrendingUp, TrendingDown, RefreshCw, Loader2, Calendar, PieChart } from "lucide-react";
import { useState } from "react";

export interface StockPosition {
    id: string;
    ticker: string;
    position: "BUY" | "SELL";
    sector: string;
    exDividend: string;
    earnings: string;
    loading: boolean;
}

export default function PortfolioTable() {
    const [portfolio, setPortfolio] = useLocalStorage<StockPosition[]>("stock_portfolio", []);

    const [tickerInput, setTickerInput] = useState("");
    const [positionInput, setPositionInput] = useState<"BUY" | "SELL">("BUY");

    const handleAdd = async () => {
        if (!tickerInput.trim()) return;

        const newItemId = Date.now().toString();
        const cleanTicker = tickerInput.trim().toUpperCase();

        // 1. Create the new item
        const newItem: StockPosition = {
            id: newItemId,
            ticker: cleanTicker,
            position: positionInput,
            sector: "...",
            exDividend: "...",
            earnings: "...",
            loading: true,
        };

        // 2. Add to State/Storage immediately
        const updatedList = [...portfolio, newItem];
        setPortfolio(updatedList);
        setTickerInput("");

        // 3. Fetch Data (Async)
        try {
            const details = await enrichStockData(cleanTicker);

            // 4. FIX: Cast the storage result manually
            const rawStorage = safelyGetStorage("stock_portfolio");
            const currentStorage = (rawStorage as StockPosition[]) || [];

            const finalList = currentStorage.map((item: StockPosition) =>
                item.id === newItemId
                    ? {
                        ...item,
                        sector: details.sector,
                        exDividend: details.exDividend,
                        earnings: details.earnings,
                        loading: false
                    }
                    : item
            );

            // 5. Update with the fresh list
            setPortfolio(finalList);

        } catch (error) {
            // Error handling
            const rawStorage = safelyGetStorage("stock_portfolio");
            const currentStorage = (rawStorage as StockPosition[]) || [];

            const errorList = currentStorage.map((item: StockPosition) =>
                item.id === newItemId
                    ? { ...item, sector: "Error", exDividend: "-", earnings: "-", loading: false }
                    : item
            );
            setPortfolio(errorList);
        }
    };

    const handleDelete = (id: string) => {
        setPortfolio(portfolio.filter((item) => item.id !== id));
    };

    const handleRefreshRow = async (id: string, ticker: string) => {
        // Set loading visually first
        setPortfolio(prev => prev.map(item => item.id === id ? { ...item, loading: true } : item));

        try {
            const details = await enrichStockData(ticker);

            // Read fresh storage
            const rawStorage = safelyGetStorage("stock_portfolio");
            const currentStorage = (rawStorage as StockPosition[]) || [];

            const finalList = currentStorage.map((item: StockPosition) =>
                item.id === id
                    ? { ...item, sector: details.sector, exDividend: details.exDividend, earnings: details.earnings, loading: false }
                    : item
            );

            setPortfolio(finalList);
        } catch (e) {
            // Revert loading on error
            const rawStorage = safelyGetStorage("stock_portfolio");
            const currentStorage = (rawStorage as StockPosition[]) || [];

            setPortfolio(currentStorage.map((item: StockPosition) => item.id === id ? { ...item, loading: false } : item));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleAdd();
    };

    return (
        <div className="flex flex-col h-full bg-white border rounded shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-700 text-sm">Stock Portfolio</h3>
                <span className="text-xs text-slate-400">{portfolio.length} Holdings</span>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-2">Ticker</th>
                            <th className="px-4 py-2">Pos</th>
                            <th className="px-4 py-2">Sector</th>
                            <th className="px-4 py-2">Ex-Div</th>
                            <th className="px-4 py-2">Earnings</th>
                            <th className="px-2 py-2 w-8"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {portfolio.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic text-xs">
                                    No stocks in portfolio. Add one below.
                                </td>
                            </tr>
                        ) : (
                            portfolio.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 group">
                                    <td className="px-4 py-2 font-mono font-bold text-slate-700">
                                        {item.ticker}
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
                                    <td className="px-4 py-2 text-xs text-slate-600">
                                        <div className="flex items-center gap-1.5">
                                            {item.loading ? <Loader2 size={12} className="animate-spin text-indigo-500" /> : <PieChart size={12} className="text-slate-300" />}
                                            <span className="truncate max-w-[100px]" title={item.sector}>{item.sector}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 text-xs text-slate-600">
                                        <div className="flex items-center gap-1.5">
                                            {item.loading ? <Loader2 size={12} className="animate-spin text-indigo-500" /> : <Calendar size={12} className="text-slate-300" />}
                                            {item.exDividend}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 text-xs text-slate-600">
                                        <div className="flex items-center gap-1.5">
                                            {item.loading ? <Loader2 size={12} className="animate-spin text-indigo-500" /> : <Calendar size={12} className="text-slate-300" />}
                                            {item.earnings}
                                        </div>
                                    </td>
                                    <td className="px-2 py-2 text-right flex items-center justify-end gap-1">
                                        <button
                                            onClick={() => handleRefreshRow(item.id, item.ticker)}
                                            className="text-slate-300 hover:text-blue-500 p-1"
                                            title="Retry AI Fetch"
                                        >
                                            <RefreshCw size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-slate-300 hover:text-red-500 p-1"
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
                    placeholder="Ticker (e.g. NVDA)"
                    value={tickerInput}
                    onChange={(e) => setTickerInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="px-3 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase font-mono text-orange-600"
                />

                <select
                    value={positionInput}
                    onChange={(e) => setPositionInput(e.target.value as "BUY" | "SELL")}
                    className={`px-2 py-1.5 text-sm border rounded focus:outline-none font-bold ${positionInput === "BUY" ? "text-green-600" : "text-red-600"
                        }`}
                >
                    <option value="BUY" className="text-green-600">BUY</option>
                    <option value="SELL" className="text-red-600">SELL</option>
                </select>

                <button
                    onClick={handleAdd}
                    disabled={!tickerInput.trim()}
                    className="bg-indigo-600 text-white p-1.5 rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                    <Plus size={18} />
                </button>
            </div>
        </div>
    );
}