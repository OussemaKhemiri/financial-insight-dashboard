import { useState, useEffect, useCallback } from "react";
import { safelyGetStorage, safelySetStorage } from "@/lib/storage";

// --- Configuration ---
const MAX_ITEMS_PER_COLUMN = 50;
const STORAGE_KEY = "market_news_cache";

// The Feed Map provided by user
const FEED_URLS: Record<string, string[]> = {
    forex: [
        "https://www.investing.com/rss/forex.rss",
        "https://www.investing.com/rss/news_1.rss",
    ],
    markets: [
        "https://www.investing.com/rss/market_overview.rss",
        "https://www.investing.com/rss/bonds.rss",
        "https://www.investing.com/rss/290.rss",
        "https://www.investing.com/rss/121899.rss",
        "https://www.investing.com/rss/news_95.rss",
        "https://www.investing.com/rss/news_285.rss",
    ],
    world: [
        "https://www.investing.com/rss/news.rss",
        "https://www.investing.com/rss/news_287.rss",
        "https://www.investing.com/rss/news_14.rss",
        "https://www.investing.com/rss/286.rss",
    ],
    stocks: [
        "https://www.investing.com/rss/stock.rss",
        "https://www.investing.com/rss/investing_news.rss",
        "https://www.investing.com/rss/news_25.rss",
        "https://www.investing.com/rss/news_1065.rss",
        "https://www.investing.com/rss/news_1063.rss",
        "https://www.investing.com/rss/news_1061.rss",
        "https://www.investing.com/rss/news_356.rss",
    ],
    commodities: [
        "https://www.investing.com/rss/commodities.rss",
        "https://www.investing.com/rss/news_11.rss",
    ],
    crypto: [
        "https://www.investing.com/rss/302.rss",
        "https://www.investing.com/rss/news_301.rss",
    ],
};

// Types
export interface NewsItem {
    title: string;
    link: string;
    pubDate: string; // ISO string
    guid?: string;
}

export type NewsData = Record<string, NewsItem[]>;

export function useMarketNews() {
    const [data, setData] = useState<NewsData>({
        forex: [], markets: [], world: [], stocks: [], commodities: [], crypto: []
    });
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Helper: Fetch a single RSS URL via Proxy
    const fetchSingleFeed = async (rssUrl: string): Promise<NewsItem[]> => {
        try {
            const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
            const res = await fetch(proxyUrl);
            const json = await res.json();

            if (json.status === "ok" && Array.isArray(json.items)) {
                return json.items.map((item: any) => ({
                    title: item.title,
                    link: item.link,
                    pubDate: item.pubDate,
                    guid: item.guid || item.link
                }));
            }
            return [];
        } catch (err) {
            console.warn(`Failed to fetch RSS: ${rssUrl}`, err);
            return [];
        }
    };

    const refreshNews = useCallback(async () => {
        setLoading(true);

        // 1. Load existing cache first to display immediately
        const cached = safelyGetStorage(STORAGE_KEY);
        if (cached) {
            setData(cached);
        }

        const newData: NewsData = { ...cached }; // Start with old data

        // 2. Iterate through categories
        const categories = Object.keys(FEED_URLS);

        // We process categories in parallel
        await Promise.all(categories.map(async (category) => {
            const urls = FEED_URLS[category];

            // Fetch all feeds for this category in parallel
            const results = await Promise.allSettled(urls.map(url => fetchSingleFeed(url)));

            let incomingItems: NewsItem[] = [];
            results.forEach(res => {
                if (res.status === "fulfilled") {
                    incomingItems.push(...res.value);
                }
            });

            // 3. Merge Strategy:
            // Get old items for this category
            const oldItems = cached?.[category] || [];

            // Combine: Incoming + Old
            const combined = [...incomingItems, ...oldItems];

            // Deduplicate by LINK (Keep the first occurrence found)
            const seen = new Set();
            const uniqueItems = combined.filter(item => {
                const duplicate = seen.has(item.link);
                seen.add(item.link);
                return !duplicate;
            });

            // Sort by Date (Newest First)
            uniqueItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

            // Slice to Cap (Max 50)
            newData[category] = uniqueItems.slice(0, MAX_ITEMS_PER_COLUMN);
        }));

        // 4. Save & Update
        safelySetStorage(STORAGE_KEY, newData);
        setData(newData);
        setLastUpdated(new Date());
        setLoading(false);
    }, []);

    // Initial Load
    useEffect(() => {
        refreshNews();
    }, [refreshNews]);

    return { data, loading, refreshNews, lastUpdated };
}