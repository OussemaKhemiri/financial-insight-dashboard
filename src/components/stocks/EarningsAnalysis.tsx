"use client";

import { useState } from "react";
import { useEarningsAnalysis } from "@/hooks/useEarningsAnalysis";
import { EarningsInput } from "@/lib/gemini";
import {
    ClipboardList,
    BarChart3,
    Calculator,
    RotateCcw,
    CheckCircle2,
    AlertTriangle,
    ThumbsUp,
    ThumbsDown,
    MinusCircle,
    Target,
    Activity,
    TrendingUp,
    Tag,
    AlertOctagon,
    DollarSign
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
        if (val.includes("BUY")) return "bg-emerald-50 text-emerald-800 border-emerald-200";
        if (val.includes("SELL")) return "bg-rose-50 text-rose-800 border-rose-200";
        return "bg-amber-50 text-amber-800 border-amber-200";
    };

    const getVerdictIcon = (v: string) => {
        const val = v?.toUpperCase() || "";
        if (val.includes("BUY")) return <ThumbsUp size={20} className="text-emerald-600" />;
        if (val.includes("SELL")) return <ThumbsDown size={20} className="text-rose-600" />;
        return <MinusCircle size={20} className="text-amber-600" />;
    };

    const getScoreColor = (score: number) => {
        if (score >= 75) return "text-emerald-600 bg-emerald-100";
        if (score >= 50) return "text-amber-600 bg-amber-100";
        return "text-rose-600 bg-rose-100";
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
                        className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
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
                                    className="w-full text-sm border rounded p-2 focus:ring-2 focus:ring-indigo-500 outline-none uppercase font-mono text-slate-900 font-bold"
                                    value={inputs.ticker}
                                    onChange={(e) => handleInputChange("ticker", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Current Price</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 150.00"
                                    className="w-full text-sm border rounded p-2 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                                    value={inputs.price}
                                    onChange={(e) => handleInputChange("price", e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">Company Profile</label>
                            <textarea
                                placeholder="Paste 'Business Description' here..."
                                className="w-full text-xs border rounded p-2 h-20 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-700"
                                value={inputs.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                            />
                        </div>

                        {/* Valuation */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">Valuation Measures</label>
                            <textarea
                                placeholder="Paste Valuation table (P/E, Market Cap, etc)..."
                                className="w-full text-xs border rounded p-2 h-20 focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono text-slate-700"
                                value={inputs.valuation}
                                onChange={(e) => handleInputChange("valuation", e.target.value)}
                            />
                        </div>

                        {/* Financials Tabs */}
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Income Statement</label>
                                <textarea
                                    className="w-full text-xs border rounded p-2 h-16 focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono text-slate-700"
                                    value={inputs.income}
                                    onChange={(e) => handleInputChange("income", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Balance Sheet</label>
                                <textarea
                                    className="w-full text-xs border rounded p-2 h-16 focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono text-slate-700"
                                    value={inputs.balance}
                                    onChange={(e) => handleInputChange("balance", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Cash Flow</label>
                                <textarea
                                    className="w-full text-xs border rounded p-2 h-16 focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono text-slate-700"
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
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded shadow-md flex justify-center items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="animate-pulse">Analyzing Fundamentals...</span>
                                ) : (
                                    <>
                                        <BarChart3 size={18} /> Generate Investment Thesis
                                    </>
                                )}
                            </button>
                        </div>

                        {error && (
                            <div className="text-xs text-red-600 bg-red-50 p-3 rounded border border-red-100 flex items-center gap-2">
                                <AlertTriangle size={14} /> {error}
                            </div>
                        )}
                    </div>
                )}

                {/* 2. RESULT DASHBOARD */}
                {result && (
                    <div className="space-y-5 animate-in slide-in-from-bottom-4 duration-500 pb-4">

                        {/* A. Top Verdict Card */}
                        <div className={`p-4 rounded-lg border shadow-sm relative overflow-hidden ${getVerdictColor(result.verdict)}`}>
                            <div className="flex justify-between items-start z-10 relative">
                                <div className="flex-1 pr-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className="text-2xl font-black tracking-tight">{result.verdict}</h2>
                                        {getVerdictIcon(result.verdict)}
                                    </div>
                                    <p className="text-sm font-medium opacity-90 leading-snug">
                                        {result.oneLiner}
                                    </p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className={`text-xl font-bold px-3 py-1 rounded-full shadow-sm ${getScoreColor(result.healthScore)}`}>
                                        {result.healthScore}/100
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-60">Health Score</span>
                                </div>
                            </div>
                        </div>

                        {/* B. Strategic Context (Category & Stage) */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-50 p-3 rounded border border-slate-200 flex flex-col justify-center">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <Tag size={10} /> Classification
                                </div>
                                <div className="font-semibold text-slate-800 text-sm leading-tight">
                                    {result.category}
                                </div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded border border-slate-200 flex flex-col justify-center">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <TrendingUp size={10} /> Market Cycle
                                </div>
                                <div className="font-semibold text-slate-800 text-sm leading-tight">
                                    {result.marketStage}
                                </div>
                            </div>
                        </div>

                        {/* C. Valuation & Price Targets (NEW) */}
                        {result.priceTargets && (
                            <div className="bg-white rounded-lg border border-indigo-100 shadow-sm overflow-hidden">
                                <div className="bg-indigo-50/50 px-4 py-2 border-b border-indigo-100 flex items-center gap-2">
                                    <Target size={14} className="text-indigo-600" />
                                    <h4 className="font-bold text-indigo-900 text-xs">Price Targets & Valuation</h4>
                                </div>
                                <div className="grid grid-cols-3 divide-x divide-indigo-50">
                                    {/* Intrinsic */}
                                    <div className="p-3 text-center">
                                        <div className="text-[10px] text-slate-500 mb-1">Intrinsic Value</div>
                                        <div className="text-sm font-bold text-slate-800">
                                            {typeof result.priceTargets.intrinsicValue === 'number'
                                                ? `$${result.priceTargets.intrinsicValue}`
                                                : result.priceTargets.intrinsicValue}
                                        </div>
                                    </div>
                                    {/* Buy Zone */}
                                    <div className="p-3 text-center bg-emerald-50/30">
                                        <div className="text-[10px] text-emerald-600 font-bold mb-1">Buy Below</div>
                                        <div className="text-sm font-bold text-emerald-700">
                                            {typeof result.priceTargets.buyBelow === 'number'
                                                ? `$${result.priceTargets.buyBelow}`
                                                : result.priceTargets.buyBelow}
                                        </div>
                                    </div>
                                    {/* Danger Zone */}
                                    <div className="p-3 text-center bg-rose-50/30">
                                        <div className="text-[10px] text-rose-600 font-bold mb-1 flex justify-center items-center gap-1">
                                            <AlertOctagon size={10} /> Volatility Risk
                                        </div>
                                        <div className="text-sm font-bold text-rose-700">
                                            {typeof result.priceTargets.volatilityWarning === 'number'
                                                ? `$${result.priceTargets.volatilityWarning}`
                                                : result.priceTargets.volatilityWarning}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* D. Thesis Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Bullish */}
                            <div className="bg-emerald-50/50 p-4 rounded border border-emerald-100">
                                <h4 className="font-bold text-emerald-800 text-xs flex items-center gap-2 mb-3 uppercase tracking-wider">
                                    <CheckCircle2 size={14} /> Bullish Thesis
                                </h4>
                                <ul className="space-y-2">
                                    {result.bullishPoints.map((p: string, i: number) => (
                                        <li key={i} className="text-xs text-emerald-900 leading-relaxed flex items-start gap-2">
                                            <span className="mt-1.5 block w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Bearish */}
                            <div className="bg-rose-50/50 p-4 rounded border border-rose-100">
                                <h4 className="font-bold text-rose-800 text-xs flex items-center gap-2 mb-3 uppercase tracking-wider">
                                    <AlertTriangle size={14} /> Bearish Risks
                                </h4>
                                <ul className="space-y-2">
                                    {result.bearishPoints.map((p: string, i: number) => (
                                        <li key={i} className="text-xs text-rose-900 leading-relaxed flex items-start gap-2">
                                            <span className="mt-1.5 block w-1 h-1 rounded-full bg-rose-400 shrink-0" />
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* E. Metrics Section */}
                        <div className="bg-slate-50 p-4 rounded border border-slate-200">
                            <h4 className="font-bold text-slate-700 text-xs mb-2 flex items-center gap-2 uppercase tracking-wider">
                                <Activity size={14} /> Critical Metrics
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line font-mono">
                                {result.keyMetrics}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}