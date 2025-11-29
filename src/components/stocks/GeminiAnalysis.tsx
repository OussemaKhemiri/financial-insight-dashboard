"use client";

import { useState } from "react";
import { useArticleAnalysis } from "@/hooks/useArticleAnalysis";
import { Sparkles, FileText, XCircle, RotateCcw } from "lucide-react";

export default function GeminiAnalysis() {
    const [articleInput, setArticleInput] = useState("");
    const { analyze, analysis, isLoading, error, setAnalysis } = useArticleAnalysis();

    const handleAnalyze = () => {
        if (!articleInput.trim()) return;
        analyze(articleInput);
    };

    const handleClear = () => {
        setArticleInput("");
        setAnalysis(null);
    };

    // --- Parsing Logic ---
    // Takes the raw markdown string and splits it into sections based on "###"
    const parseSections = (text: string) => {
        const parts = text.split("###").filter(part => part.trim() !== "");
        return parts.map(part => {
            const firstNewLine = part.indexOf("\n");
            const title = part.substring(0, firstNewLine).trim();
            const content = part.substring(firstNewLine).trim();
            return { title, content };
        });
    };

    // --- Color Mapping ---
    const getSectionStyle = (title: string) => {
        const t = title.toUpperCase();
        if (t.includes("EXECUTIVE SUMMARY")) return "bg-blue-50 border-blue-200 text-blue-900";
        if (t.includes("SECTOR ANALYSIS")) return "bg-indigo-50 border-indigo-200 text-indigo-900";
        if (t.includes("STOCK") || t.includes("COMPANY")) return "bg-emerald-50 border-emerald-200 text-emerald-900";
        if (t.includes("EVENT")) return "bg-violet-50 border-violet-200 text-violet-900";
        if (t.includes("SENTIMENT")) return "bg-amber-50 border-amber-200 text-amber-900";
        if (t.includes("OPPORTUNITIES")) return "bg-cyan-50 border-cyan-200 text-cyan-900";
        if (t.includes("SUGGESTIONS")) return "bg-rose-50 border-rose-200 text-rose-900";
        return "bg-slate-50 border-slate-200 text-slate-800"; // Fallback
    };

    const sections = analysis ? parseSections(analysis) : [];

    return (
        <div className="flex flex-col h-full bg-white border rounded shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                    <Sparkles size={16} className="text-indigo-600" /> 
                    AI Market Analysis
                </h3>
                {analysis && (
                    <button 
                        onClick={handleClear}
                        className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
                    >
                        <RotateCcw size={12} /> New
                    </button>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-200">
                {!analysis ? (
                    // Input View
                    <div className="h-full flex flex-col">
                        <textarea
                            className="flex-1 w-full p-3 text-sm border rounded resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono bg-slate-50 text-purple-600"
                            placeholder="Paste financial article or news text here..."
                            value={articleInput}
                            onChange={(e) => setArticleInput(e.target.value)}
                        />
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleAnalyze}
                                disabled={isLoading || !articleInput.trim()}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="animate-pulse">Analyzing...</span>
                                ) : (
                                    <>
                                        <FileText size={16} /> Deconstruct Article
                                    </>
                                )}
                            </button>
                        </div>
                        {error && (
                            <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs rounded border border-red-100 flex items-start gap-2">
                                <XCircle size={14} className="mt-0.5 shrink-0" />
                                {error}
                            </div>
                        )}
                    </div>
                ) : (
                    // Results View
                    <div className="space-y-4">
                        {sections.map((section, idx) => (
                            <div 
                                key={idx} 
                                className={`p-4 rounded border text-sm shadow-sm ${getSectionStyle(section.title)}`}
                            >
                                <h4 className="font-bold mb-2 uppercase tracking-wide opacity-80 text-xs">
                                    {section.title.replace(/^\d+\.\s*/, '')} {/* Remove numbering "1. " */}
                                </h4>
                                <div className="whitespace-pre-wrap leading-relaxed opacity-90">
                                    {section.content}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}