// src/hooks/useForexData.ts
import { useState, useCallback, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { parseForexFactoryHTML, processEventsForScores } from "@/lib/scraping";
import { safelyGetStorage } from "@/lib/storage";

const CURRENCIES = ["USD", "EUR", "CAD", "GBP", "JPY", "NZD", "CHF", "AUD", "CNY"];

export type StrengthHistory = Record<string, number[]>;

export function useForexData() {
    const initialHistory: StrengthHistory = CURRENCIES.reduce((acc, curr) => {
        acc[curr] = [0, 0, 0];
        return acc;
    }, {} as StrengthHistory);

    const [history, setHistory] = useLocalStorage<StrengthHistory>("forex_strength_history", initialHistory);
    const [loading, setLoading] = useState(false);

    // We track the date, but we rely on disk storage for logic
    const [lastFetch, setLastFetch] = useLocalStorage<string>("forex_last_fetch_date", "");

    const fetchAndCalculate = useCallback(async () => {
        if (loading) return;
        setLoading(true);
        try {
            // 1. Fetch Data
            const targetUrl = encodeURIComponent("https://www.forexfactory.com/calendar?day=yesterday");
            const proxyUrl = `https://corsproxy.io/?${targetUrl}`;

            const res = await fetch(proxyUrl);
            if (!res.ok) throw new Error(`Proxy Error: ${res.status}`);

            const htmlContent = await res.text();
            if (!htmlContent || htmlContent.length < 500) throw new Error("Invalid HTML");

            const events = parseForexFactoryHTML(htmlContent);
            console.log(`Parsed ${events.length} events from ForexFactory.`);

            if (events.length === 0) return;

            // 2. Load State from Disk
            const savedHistory = safelyGetStorage("forex_strength_history") as StrengthHistory | null;
            const currentHistory = savedHistory || initialHistory;
            const storedDate = safelyGetStorage("forex_last_fetch_date");

            const today = new Date().toLocaleDateString();
            const isSameDayUpdate = storedDate === today;

            // 3. Determine "Base Scores" for Calculation
            const baseScores: Record<string, number> = {};

            CURRENCIES.forEach(c => {
                const points = currentHistory[c] || [0, 0, 0];

                if (isSameDayUpdate) {
                    // LOGIC A: RE-CALCULATING TODAY
                    // If we already ran today, the last point is "Today's Score".
                    // We want to re-calculate it starting from "Yesterday's Score" (Index - 2).
                    // [Day1, Day2, Day3(Today)] -> We base math on Day2.
                    baseScores[c] = points.length >= 2 ? points[points.length - 2] : 0;
                } else {
                    // LOGIC B: NEW DAY
                    // It's a new day. The last point is "Yesterday's Score".
                    // [Day1, Day2, Day3] -> We base math on Day3 to create Day4.
                    baseScores[c] = points[points.length - 1] || 0;
                }
            });

            // 4. Run Math
            const updatedScores = processEventsForScores(baseScores, events);

            // 5. Update History
            const newHistory = { ...currentHistory };
            CURRENCIES.forEach(c => {
                const points = newHistory[c] || [0, 0, 0];
                const newScore = updatedScores[c];

                if (isSameDayUpdate) {
                    // OVERWRITE the last point
                    // [A, B, OldC] -> [A, B, NewC]
                    const updatedPoints = [...points];
                    updatedPoints[updatedPoints.length - 1] = newScore;
                    newHistory[c] = updatedPoints;
                } else {
                    // APPEND new point (FIFO)
                    // [A, B, C] -> [B, C, D]
                    const newPoints = [...points, newScore].slice(-3);
                    newHistory[c] = newPoints;
                }
            });

            // 6. Save
            setHistory(newHistory);
            setLastFetch(today);
            console.log(`[Forex Logic] Update Complete. SameDay=${isSameDayUpdate}`);

        } catch (err) {
            console.error("Forex Scrape Error:", err);
        } finally {
            setLoading(false);
        }
    }, [setHistory, setLastFetch, loading]);

    // Auto-Refresh Logic
    useEffect(() => {
        if (typeof window === "undefined") return;

        const today = new Date().toLocaleDateString();

        // Read raw to bypass React state timing
        const rawStoredDate = window.localStorage.getItem("forex_last_fetch_date");
        let storedDate = "";
        if (rawStoredDate) {
            try { storedDate = JSON.parse(rawStoredDate); } catch (e) { }
        }

        if (storedDate !== today) {
            console.log(`[Auto-Refresh] Stored: "${storedDate}" vs Today: "${today}". Updating...`);
            fetchAndCalculate();
        }
    }, [fetchAndCalculate]);

    return { history, loading, fetchAndCalculate, lastFetch };
}