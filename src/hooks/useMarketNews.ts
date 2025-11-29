import { useState, useEffect, useCallback } from "react";
import { safelyGetStorage, safelySetStorage } from "@/lib/storage";

// --- Configuration ---
const MAX_ITEMS_PER_COLUMN = 50;
const STORAGE_KEY = "market_news_cache";
const TIMESTAMP_KEY = "market_news_last_fetch"; // New key to track time
const CACHE_DURATION = 30 * 60 * 1000; // 5 Minutes in milliseconds

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

export interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
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

    // The heavy lifting function (fetching from API)
    const fetchFreshData = useCallback(async (currentCache: NewsData) => {
        setLoading(true);
        const newData: NewsData = { ...currentCache };
        const categories = Object.keys(FEED_URLS);

        await Promise.all(categories.map(async (category) => {
            const urls = FEED_URLS[category];
            const results = await Promise.allSettled(urls.map(url => fetchSingleFeed(url)));

            let incomingItems: NewsItem[] = [];
            results.forEach(res => {
                if (res.status === "fulfilled") incomingItems.push(...res.value);
            });

            // Merge with old items
            const oldItems = currentCache?.[category] || [];
            const combined = [...incomingItems, ...oldItems];

            // Deduplicate
            const seen = new Set();
            const uniqueItems = combined.filter(item => {
                const duplicate = seen.has(item.link);
                seen.add(item.link);
                return !duplicate;
            });

            // Sort & Slice
            uniqueItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
            newData[category] = uniqueItems.slice(0, MAX_ITEMS_PER_COLUMN);
        }));

        // Save Data AND Timestamp
        safelySetStorage(STORAGE_KEY, newData);
        safelySetStorage(TIMESTAMP_KEY, Date.now().toString());

        setData(newData);
        setLastUpdated(new Date());
        setLoading(false);
    }, []);

    // Exposed function for the manual "Refresh" button
    // This forces a fetch regardless of time
    const refreshNews = useCallback(() => {
        const cached = safelyGetStorage(STORAGE_KEY) || {};
        fetchFreshData(cached);
    }, [fetchFreshData]);

    // Initial Load Logic
    useEffect(() => {
        // 1. Load data from local storage immediately
        const cachedData = safelyGetStorage(STORAGE_KEY);
        const lastFetchTime = safelyGetStorage(TIMESTAMP_KEY);

        if (cachedData) {
            setData(cachedData);
            if (lastFetchTime) {
                setLastUpdated(new Date(parseInt(lastFetchTime)));
            }
        }

        // 2. Check if we actually need to fetch (is data older than 5 mins?)
        const now = Date.now();
        const lastTime = lastFetchTime ? parseInt(lastFetchTime) : 0;
        const isStale = (now - lastTime) > CACHE_DURATION;

        // 3. If no data exists OR data is old, fetch new.
        // Otherwise, stop loading because we already set the cached data above.
        if (!cachedData || isStale) {
            fetchFreshData(cachedData || {});
        } else {
            setLoading(false);
        }
    }, [fetchFreshData]);

    return { data, loading, refreshNews, lastUpdated };
}