"use client";

import { useState } from "react";
import { useFairValue } from "@/hooks/useFairValue";
import { Search, Activity, AlertTriangle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export default function FairValueCalc() {
    const [input, setInput] = useState("");
    const { calculate, loading, data, error } = useFairValue();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (input) calculate(input);
    };

    // Helper to determine Zone Color
    const getZoneStatus = () => {
        if (!data) return null;
        const p = data.prices.current;
        if (p > data.stats.sd2_upper) return { text: "EXTREME OVERBOUGHT", color: "text-red-600", bg: "bg-red-50" };
        if (p < data.stats.sd2_lower) return { text: "EXTREME OVERSOLD", color: "text-green-600", bg: "bg-green-50" };
        if (p > data.stats.sd1_upper) return { text: "OVERVALUED", color: "text-orange-500", bg: "bg-orange-50" };
        if (p < data.stats.sd1_lower) return { text: "UNDERVALUED", color: "text-emerald-500", bg: "bg-emerald-50" };
        return { text: "FAIR VALUE ZONE", color: "text-slate-500", bg: "bg-slate-50" };
    };

    const status = getZoneStatus();

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header / Input */}
            <div className="p-3 border-b bg-slate-50">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                        <Activity size={16} className="text-purple-600" />
                        Fair Value Model
                    </h3>
                </div>
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value.toUpperCase())}
                        placeholder="EURUSD..."
                        className="w-full text-xs p-2 border rounded font-mono uppercase focus:ring-2 focus:ring-purple-500 outline-none text-purple-600"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700 disabled:opacity-50"
                    >
                        {loading ? <Activity size={16} className="animate-spin" /> : <Search size={16} />}
                    </button>
                </form>
                {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 relative">
                {!data ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                        <Activity size={48} strokeWidth={1} />
                        <p className="text-xs">Enter a pair to calculate distribution</p>
                    </div>
                ) : (
                    <div className="flex flex-col h-full gap-4">

                        {/* Status Banner (Updated: Single Line Layout) */}
                        <div className={`p-2 rounded border flex items-center justify-between text-xs ${status?.bg}`}>

                            {/* Left Side: Status + Prices */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`font-bold whitespace-nowrap ${status?.color}`}>
                                    {status?.text}
                                </span>

                                <span className="text-slate-300 hidden sm:inline">|</span>

                                <span className="text-slate-500 whitespace-nowrap">
                                    Cur: <span className="font-mono font-bold text-slate-700">{data.prices.current}</span>
                                </span>

                                <span className="text-slate-500 whitespace-nowrap">
                                    Fair: <span className="font-mono font-bold text-purple-600">{data.fairValue.toFixed(4)}</span>
                                </span>
                            </div>

                            {/* Right Side: Net Score */}
                            <div className="flex items-center gap-1 whitespace-nowrap pl-2 border-l border-slate-200 ml-2">
                                <span className="text-slate-400">Score:</span>
                                <span className={`font-bold ${data.scores.net > 0 ? "text-green-600" : "text-red-600"}`}>
                                    {data.scores.net > 0 ? "+" : ""}{data.scores.net.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="flex-1 w-full min-h-[150px] text-orange-600">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.curveData}>
                                    <defs>
                                        <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="price"
                                        type="number"
                                        domain={['auto', 'auto']}
                                        tickFormatter={(val) => val.toFixed(4)}
                                        fontSize={10}
                                        tick={{ fill: '#94a3b8' }}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ fontSize: '10px' }}
                                        labelFormatter={(label) => `Price: ${Number(label).toFixed(4)}`}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="density"
                                        stroke="#9333ea"
                                        fillOpacity={1}
                                        fill="url(#colorDensity)"
                                    />

                                    {/* Reference Lines for Zones */}
                                    <ReferenceLine x={data.fairValue} stroke="#9333ea" strokeDasharray="3 3" label={{ position: 'top', value: 'Fair', fontSize: 10, fill: '#9333ea' }} />
                                    <ReferenceLine x={data.stats.sd1_upper} stroke="#fbbf24" strokeDasharray="3 3" />
                                    <ReferenceLine x={data.stats.sd1_lower} stroke="#fbbf24" strokeDasharray="3 3" />

                                    {/* CURRENT PRICE INDICATOR */}
                                    <ReferenceLine x={data.prices.current} stroke="#ef4444" strokeWidth={2} label={{ position: 'insideTopLeft', value: 'Current', fontSize: 10, fill: '#ef4444' }} />

                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div className="bg-slate-50 p-2 rounded">
                                <span className="text-slate-400 block">Anchor (Prev Close)</span>
                                <span className="font-mono text-slate-700">{data.prices.anchor}</span>
                            </div>
                            <div className="bg-slate-50 p-2 rounded">
                                <span className="text-slate-400 block">Volatility (ATR)</span>
                                <span className="font-mono text-slate-700">{data.stats.atr}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}