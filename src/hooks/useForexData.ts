import { useState, useCallback, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { parseForexFactoryHTML, processEventsForScores } from "@/lib/scraping";
import { safelyGetStorage } from "@/lib/storage";

const CURRENCIES = ["USD", "EUR", "CAD", "GBP", "JPY", "NZD", "CHF", "AUD", "CNY"];

export type StrengthHistory = Record<string, number[]>;

// --- DATE HELPERS ---
const formatForexDate = (date: Date) => {
    const month = date.toLocaleString('en-US', { month: 'short' }).toLowerCase();
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}${day}.${year}`;
};

const toLocaleString = (date: Date) => date.toLocaleDateString();

export function useForexData() {
    // Initial state: 3 zeros for every currency
    const initialHistory: StrengthHistory = CURRENCIES.reduce((acc, curr) => {
        acc[curr] = [0, 0, 0];
        return acc;
    }, {} as StrengthHistory);

    const [history, setHistory] = useLocalStorage<StrengthHistory>("forex_strength_history", initialHistory);
    const [lastFetch, setLastFetch] = useLocalStorage<string>("forex_last_fetch_date", "");

    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");

    const fetchAndCalculate = useCallback(async () => {
        if (loading) return;
        setLoading(true);
        setStatusMessage("Initializing...");

        try {
            // 1. Determine Date Gap
            const today = new Date();

            // FIX: Removed <string> generic, used casting instead
            const storedDateStr = safelyGetStorage("forex_last_fetch_date") as string;

            // Default to 3 days ago if never run
            let lastRunDate = storedDateStr ? new Date(storedDateStr) : new Date(Date.now() - 3 * 86400000);

            // "Yesterday" is the target for the latest completed trading day
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            // Normalize times to midnight
            lastRunDate.setHours(0, 0, 0, 0);
            yesterday.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);

            // Calculate days missed
            const diffTime = yesterday.getTime() - lastRunDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            console.log(`[Forex Logic] Last Run: ${toLocaleString(lastRunDate)}. Target: ${toLocaleString(yesterday)}. Gap: ${diffDays} days.`);

            // 2. Load Current History
            let currentHistory = (safelyGetStorage("forex_strength_history") as StrengthHistory) || initialHistory;

            if (diffDays <= 0) {
                // Already up to date
                setStatusMessage("Updating latest...");
                await processSingleDay(yesterday, currentHistory, true);
            }
            else {
                // Backfill needed
                const daysToProcess = Math.min(diffDays, 7);
                let runnerDate = new Date(lastRunDate);

                for (let i = 0; i < daysToProcess; i++) {
                    runnerDate.setDate(runnerDate.getDate() + 1);
                    const dateStr = toLocaleString(runnerDate);
                    setStatusMessage(`Catching up: ${dateStr}...`);

                    currentHistory = await processSingleDay(runnerDate, currentHistory, false);
                    await new Promise(r => setTimeout(r, 500));
                }
            }

            setHistory(currentHistory);
            setLastFetch(toLocaleString(today));
            setStatusMessage("Updated");

        } catch (err) {
            console.error("Forex Scrape Error:", err);
            setStatusMessage("Error updating.");
        } finally {
            setLoading(false);
            setTimeout(() => setStatusMessage(""), 3000);
        }
    }, [loading, setHistory, setLastFetch, initialHistory]);

    // --- CORE LOGIC: Process One Specific Day ---
    const processSingleDay = async (targetDate: Date, historyState: StrengthHistory, isUpdate: boolean): Promise<StrengthHistory> => {
        const ffDateParam = formatForexDate(targetDate);
        const targetUrl = encodeURIComponent(`https://www.forexfactory.com/calendar?day=${ffDateParam}`);
        const proxyUrl = `https://corsproxy.io/?${targetUrl}`;

        console.log(`Fetching: ${ffDateParam} (${isUpdate ? "Update" : "Append"})`);

        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error(`Proxy Error: ${res.status}`);
        const html = await res.text();
        const events = parseForexFactoryHTML(html);

        const baseScores: Record<string, number> = {};
        CURRENCIES.forEach(c => {
            const points = historyState[c] || [0, 0, 0];
            if (isUpdate) {
                // Recalculating last point: Base is Index-2
                baseScores[c] = points.length >= 2 ? points[points.length - 2] : 0;
            } else {
                // New day: Base is last point
                baseScores[c] = points[points.length - 1] || 0;
            }
        });

        const updatedScores = processEventsForScores(baseScores, events);
        const newHistory = { ...historyState };

        CURRENCIES.forEach(c => {
            const points = newHistory[c] || [0, 0, 0];
            const newScore = updatedScores[c];

            if (isUpdate) {
                // Overwrite last point
                const updatedPoints = [...points];
                updatedPoints[updatedPoints.length - 1] = newScore;
                newHistory[c] = updatedPoints;
            } else {
                // Append new and ROTATE (Keep only last 3)
                // [A, B, C] + D -> [B, C, D]
                const newPoints = [...points, newScore].slice(-3);
                newHistory[c] = newPoints;
            }
        });

        return newHistory;
    };

    // Auto-Refresh on Mount
    useEffect(() => {
        if (typeof window === "undefined") return;

        const today = new Date().toLocaleDateString();
        const storedDate = safelyGetStorage("forex_last_fetch_date") as string;

        if (storedDate !== today) {
            fetchAndCalculate();
        }
    }, [fetchAndCalculate]);

    return { history, loading, fetchAndCalculate, lastFetch, statusMessage };
}