// src/hooks/useForexData.ts
import { useState, useCallback, useEffect } from "react"; // Added useEffect
import { useLocalStorage } from "./useLocalStorage";
import { parseForexFactoryHTML, processEventsForScores } from "@/lib/scraping";

const CURRENCIES = ["USD", "EUR", "CAD", "GBP", "JPY", "NZD", "CHF", "AUD", "CNY"];

export type StrengthHistory = Record<string, number[]>;

export function useForexData() {
    const initialHistory: StrengthHistory = CURRENCIES.reduce((acc, curr) => {
        acc[curr] = [0, 0, 0];
        return acc;
    }, {} as StrengthHistory);

    const [history, setHistory] = useLocalStorage<StrengthHistory>("forex_strength_history", initialHistory);
    const [loading, setLoading] = useState(false);

    // Stores the date string of the last successful update (e.g. "11/25/2025")
    const [lastFetch, setLastFetch] = useLocalStorage<string>("forex_last_fetch_date", "");

    const fetchAndCalculate = useCallback(async () => {
        if (loading) return; // Prevent double firing
        setLoading(true);
        try {
            const targetUrl = encodeURIComponent("https://www.forexfactory.com/calendar?day=yesterday");
            const proxyUrl = `https://corsproxy.io/?${targetUrl}`;

            const res = await fetch(proxyUrl);
            if (!res.ok) throw new Error(`Proxy Error: ${res.status}`);

            const htmlContent = await res.text();

            if (!htmlContent || htmlContent.length < 500) {
                throw new Error("Received empty or invalid HTML");
            }

            const events = parseForexFactoryHTML(htmlContent);
            console.log(`Parsed ${events.length} events from ForexFactory.`);

            if (events.length === 0) return;

            // Calculation Logic
            const currentScores: Record<string, number> = {};
            CURRENCIES.forEach(c => {
                const points = history[c] || [0];
                currentScores[c] = points[points.length - 1];
            });

            const updatedScores = processEventsForScores(currentScores, events);

            // FIFO Update
            const newHistory = { ...history };
            CURRENCIES.forEach(c => {
                const oldPoints = newHistory[c] || [0, 0, 0];
                const newScore = updatedScores[c];
                const newPoints = [...oldPoints, newScore].slice(-3);
                newHistory[c] = newPoints;
            });

            setHistory(newHistory);

            // Mark today as the day we updated
            setLastFetch(new Date().toLocaleDateString());

        } catch (err) {
            console.error("Forex Scrape Error:", err);
        } finally {
            setLoading(false);
        }
    }, [history, setHistory, setLastFetch, loading]); // Added loading to deps

    // --- NEW: Auto-Refresh Logic ---
    useEffect(() => {
        // Check if we already updated today
        const today = new Date().toLocaleDateString();

        // If the saved date is NOT today, run the update
        if (lastFetch !== today) {
            console.log(`Data is from ${lastFetch || "never"}. Auto-refreshing for ${today}...`);
            fetchAndCalculate();
        }
    }, [lastFetch, fetchAndCalculate]);

    return { history, loading, fetchAndCalculate, lastFetch };
}