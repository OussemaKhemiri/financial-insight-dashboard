"use client";

import { useMarketNews, NewsItem } from "@/hooks/useMarketNews";
import { RefreshCw, ExternalLink } from "lucide-react";

export default function MarketNewsTable() {
    const { data, loading, refreshNews, lastUpdated } = useMarketNews();
    const categories = ["forex", "markets", "world", "stocks", "commodities", "crypto"];

    // Helper to format date nicely (e.g., "14:30" or "Nov 25")
    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const isToday = date.toDateString() === now.toDateString();

            return isToday
                ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        } catch {
            return "";
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">

            {/* Header Bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b bg-slate-50">
                <div className="flex items-center gap-4">
                    <h3 className="font-bold text-slate-700">Live Market News (Investing.com RSS)</h3>
                    {loading && <span className="text-xs text-blue-500 animate-pulse">Updating feeds...</span>}
                </div>
                <div className="flex items-center gap-4">
                    {lastUpdated && (
                        <span className="text-xs text-slate-400">
                            Updated: {lastUpdated.toLocaleTimeString()}
                        </span>
                    )}
                    <button
                        onClick={refreshNews}
                        disabled={loading}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all disabled:opacity-50"
                        title="Force Refresh"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* The 6-Column Grid */}
            <div className="flex-1 overflow-hidden">
                {/* We use a scrollable container for the content */}
                <div className="h-full overflow-y-auto p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">

                        {categories.map((cat) => (
                            <div key={cat} className="flex flex-col gap-2 min-w-0">
                                {/* Column Header */}
                                <h4 className="font-bold uppercase text-xs tracking-wider text-slate-500 border-b pb-2 mb-1 sticky top-0 bg-white z-10">
                                    {cat}
                                </h4>

                                {/* News List */}
                                <div className="flex flex-col gap-3">
                                    {data[cat]?.length === 0 ? (
                                        <p className="text-xs text-slate-400 italic">No news available.</p>
                                    ) : (
                                        data[cat].map((item: NewsItem, idx: number) => (
                                            <article key={`${item.link}-${idx}`} className="group flex flex-col gap-1">
                                                <div className="flex justify-between items-start gap-2">
                                                    <a
                                                        href={item.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm font-medium text-slate-700 hover:text-blue-600 leading-tight line-clamp-3 group-hover:underline"
                                                    >
                                                        {item.title}
                                                    </a>
                                                </div>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-[10px] text-slate-400 font-mono">
                                                        {formatDate(item.pubDate)}
                                                    </span>
                                                    <ExternalLink size={10} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <div className="h-px bg-slate-100 mt-1" />
                                            </article>
                                        ))
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