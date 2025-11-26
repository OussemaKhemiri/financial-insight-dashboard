"use client";

import { useForexData } from "@/hooks/useForexData";
import { LineChart, Line, YAxis, ReferenceLine, ResponsiveContainer } from "recharts";
import { RefreshCw } from "lucide-react";

export default function StrengthCharts() {
    const { history, loading, fetchAndCalculate, lastFetch } = useForexData();
    const currencies = ["AUD", "CAD", "CHF", "CNY", "EUR", "GBP", "JPY", "NZD", "USD"];

    // Helper to format data for Recharts: [0.1, 0.2, 0.3] -> [{val: 0.1}, {val: 0.2}...]
    const getChartData = (currency: string) => {
        const points = history[currency] || [0, 0, 0];
        return points.map((val, i) => ({ i, val }));
    };

    // Helper to get color based on latest value
    const getColor = (currency: string) => {
        const points = history[currency] || [0];
        const last = points[points.length - 1];
        if (last > 0.1) return "#22c55e"; // Green
        if (last < -0.1) return "#ef4444"; // Red
        return "#94a3b8"; // Grey
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b bg-slate-50">
                <div>
                    <h3 className="font-bold text-slate-700 text-xs">Currency Strength</h3>
                    <p className="text-[10px] text-slate-400">Range: -1 to 1 (Yesterday's Impact)</p>
                </div>
                <button
                    onClick={fetchAndCalculate}
                    disabled={loading}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all disabled:opacity-50"
                    title="Scrape & Recalculate"
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Grid of 9 Charts */}
            <div className="flex-1 p-2 overflow-y-auto">
                <div className="grid grid-cols-3 gap-2 h-full">
                    {currencies.map(currency => (
                        <div key={currency} className="flex flex-col border rounded p-1 shadow-sm bg-white min-h-[60px]">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[10px] font-bold text-slate-600">{currency}</span>
                                <span className={`text-[10px] font-mono ${getColor(currency) === "#22c55e" ? "text-green-600" : getColor(currency) === "#ef4444" ? "text-red-600" : "text-slate-400"}`}>
                                    {(history[currency]?.[2] || 0).toFixed(2)}
                                </span>
                            </div>

                            <div className="flex-1 w-full min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={getChartData(currency)}>
                                        {/* Hidden Axis to enforce -1 to 1 domain */}
                                        <YAxis domain={[-1, 1]} hide />
                                        <ReferenceLine y={0} stroke="#e2e8f0" strokeDasharray="3 3" />
                                        <Line
                                            type="monotone"
                                            dataKey="val"
                                            stroke={getColor(currency)}
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}