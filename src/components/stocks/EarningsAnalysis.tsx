"use client";

import { useState } from "react";
import { useEarningsAnalysis } from "@/hooks/useEarningsAnalysis";
import { EarningsInput } from "@/lib/gemini";
import {
    ClipboardList,
    BarChart3,
    Calculator,
    ArrowRight,
    RotateCcw,
    CheckCircle2,
    AlertTriangle,
    ThumbsUp,
    ThumbsDown,
    MinusCircle
} from "lucide-react";

export default function EarningsAnalysis() {
    // Form State
    const [inputs, setInputs] = useState<EarningsInput>({
        ticker: "",
        price: "",
        description: "",
        valuation: "",
        income: "",
        balance: "",
        cashFlow: ""
    });

    const { runAnalysis, result, isLoading, error, clearResult } = useEarningsAnalysis();

    const handleInputChange = (field: keyof EarningsInput, value: string) => {
        setInputs(prev => ({ ...prev, [field]: value }));
    };

    const isFormValid = inputs.ticker && inputs.description && inputs.valuation;

    // --- RENDER HELPERS ---
    const getVerdictColor = (v: string) => {
        const val = v?.toUpperCase() || "";
        if (val.includes("BUY")) return "bg-green-100 text-green-700 border-green-200";
        if (val.includes("SELL")) return "bg-red-100 text-red-700 border-red-200";
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    };

    const getVerdictIcon = (v: string) => {
        const val = v?.toUpperCase() || "";
        if (val.includes("BUY")) return <ThumbsUp size={24} />;
        if (val.includes("SELL")) return <ThumbsDown size={24} />;
        return <MinusCircle size={24} />;
    };

    return (
        <div className="flex flex-col h-full bg-white border rounded shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                    <Calculator size={16} className="text-indigo-600" />
                    Earnings & Value Analyzer
                </h3>
                {result && (
                    <button
                        onClick={clearResult}
                        className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                    >
                        <RotateCcw size={12} /> New Analysis
                    </button>
                )}
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-200">

                {/* 1. INPUT FORM (Hidden if result exists) */}
                {!result && (
                    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                        <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded border border-blue-100">
                            Copy/Paste data from Yahoo Finance or StockAnalysis.com into the fields below.
                        </div>

                        {/* Row 1: Basics */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Ticker</label>
                                <input
                                    type="text"
                                    placeholder="e.g. AAPL"
                                    className="w-full text-sm border rounded p-2 focus:ring-2 focus:ring-indigo-500 outline-none uppercase font-mono"
                                    value={inputs.ticker}
                                    onChange={(e) => handleInputChange("ticker", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Current Price</label>
                                <input
                                    type="text"
                                    placeholder="e.g. $150.00"
                                    className="w-full text-sm border rounded p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={inputs.price}
                                    onChange={(e) => handleInputChange("price", e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">Company Profile (Description)</label>
                            <textarea
                                placeholder="Paste 'Business Description' here..."
                                className="w-full text-xs border rounded p-2 h-20 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                value={inputs.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                            />
                        </div>

                        {/* Valuation */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">Valuation Measures (P/E, Market Cap, etc)</label>
                            <textarea
                                placeholder="Paste Valuation table data here..."
                                className="w-full text-xs border rounded p-2 h-20 focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono"
                                value={inputs.valuation}
                                onChange={(e) => handleInputChange("valuation", e.target.value)}
                            />
                        </div>

                        {/* Financials Tabs (Visual grouping) */}
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Income Statement (Revenue, Net Income)</label>
                                <textarea
                                    className="w-full text-xs border rounded p-2 h-16 focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono"
                                    value={inputs.income}
                                    onChange={(e) => handleInputChange("income", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Balance Sheet (Assets, Liabilities)</label>
                                <textarea
                                    className="w-full text-xs border rounded p-2 h-16 focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono"
                                    value={inputs.balance}
                                    onChange={(e) => handleInputChange("balance", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Cash Flow (Operating, Free Cash Flow)</label>
                                <textarea
                                    className="w-full text-xs border rounded p-2 h-16 focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono"
                                    value={inputs.cashFlow}
                                    onChange={(e) => handleInputChange("cashFlow", e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="pt-2">
                            <button
                                onClick={() => runAnalysis(inputs)}
                                disabled={isLoading || !isFormValid}
                                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded shadow-md flex justify-center items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="animate-pulse">Analyzing Financials...</span>
                                ) : (
                                    <>
                                        <BarChart3 size={18} /> Generate Analysis
                                    </>
                                )}
                            </button>
                        </div>

                        {error && (
                            <div className="text-xs text-red-600 bg-red-50 p-3 rounded border border-red-100">
                                {error}
                            </div>
                        )}
                    </div>
                )}

                {/* 2. RESULT DASHBOARD */}
                {result && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">

                        {/* Verdict Card */}
                        <div className={`p-4 rounded-lg border-l-4 shadow-sm ${getVerdictColor(result.verdict)} bg-white border border-slate-100`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight">{result.verdict}</h2>
                                    <p className="text-sm opacity-80 mt-1 font-medium">{result.oneLiner}</p>
                                </div>
                                <div className="opacity-80">
                                    {getVerdictIcon(result.verdict)}
                                </div>
                            </div>
                        </div>

                        {/* Points Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Bullish */}
                            <div className="bg-emerald-50/50 p-4 rounded border border-emerald-100">
                                <h4 className="font-bold text-emerald-800 text-sm flex items-center gap-2 mb-3">
                                    <CheckCircle2 size={16} /> Bullish Thesis
                                </h4>
                                <ul className="space-y-2">
                                    {result.bullishPoints.map((p: string, i: number) => (
                                        <li key={i} className="text-xs text-emerald-900 leading-relaxed flex items-start gap-2">
                                            <span className="mt-1 block w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Bearish */}
                            <div className="bg-red-50/50 p-4 rounded border border-red-100">
                                <h4 className="font-bold text-red-800 text-sm flex items-center gap-2 mb-3">
                                    <AlertTriangle size={16} /> Bearish Risks
                                </h4>
                                <ul className="space-y-2">
                                    {result.bearishPoints.map((p: string, i: number) => (
                                        <li key={i} className="text-xs text-red-900 leading-relaxed flex items-start gap-2">
                                            <span className="mt-1 block w-1 h-1 rounded-full bg-red-400 shrink-0" />
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Metrics Section */}
                        <div className="bg-slate-50 p-4 rounded border border-slate-200">
                            <h4 className="font-bold text-slate-700 text-sm mb-2 flex items-center gap-2">
                                <ClipboardList size={16} /> Key Metrics
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                                {result.keyMetrics}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}