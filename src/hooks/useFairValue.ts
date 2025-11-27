import { useState } from "react";
import { useForexData } from "./useForexData";
import { calculatePairScore, calculateFairValue, generateNormalDistribution } from "@/lib/math-forex";

// Static ATR (Daily) approximations
const ATR_LOOKUP: Record<string, number> = {
    "EURUSD": 0.0070, "GBPUSD": 0.0090, "USDJPY": 0.90, "AUDUSD": 0.0065,
    "USDCAD": 0.0075, "NZDUSD": 0.0060, "USDCHF": 0.0065, "EURGBP": 0.0050,
    "EURJPY": 1.10, "GBPJPY": 1.40, "XAUUSD": 25.00, "BTCUSD": 1500.00
};

export function useFairValue() {
    const { history } = useForexData();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const calculate = async (pairInput: string) => {
        setLoading(true);
        setError(null);
        setData(null);

        try {
            const pair = pairInput.toUpperCase().trim();
            if (pair.length !== 6) throw new Error("Enter a valid 6-letter pair (e.g. EURUSD)");

            const base = pair.substring(0, 3);
            const quote = pair.substring(3, 6);

            // 1. Get Scores
            const basePoints = history[base] || [0];
            const quotePoints = history[quote] || [0];
            const baseScore = basePoints[basePoints.length - 1] || 0;
            const quoteScore = quotePoints[quotePoints.length - 1] || 0;

            // 2. Fetch Price Data
            const symbol = `${pair}=X`;
            const targetUrl = encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2d`);
            const proxyUrl = `https://corsproxy.io/?${targetUrl}`;

            const res = await fetch(proxyUrl);
            if (!res.ok) throw new Error("Failed to fetch price data");

            const json = await res.json();
            const result = json.chart?.result?.[0];

            if (!result || !result.meta) throw new Error("Pair not found");

            const meta = result.meta;
            const currentPrice = meta.regularMarketPrice;

            // FIX: Robust Anchor Price Strategy
            // 1. Try 'previousClose'
            // 2. Try 'chartPreviousClose'
            // 3. Fallback to 'regularMarketPrice' (Current) if history is missing to prevent NaN
            const anchorPrice = meta.previousClose || meta.chartPreviousClose || currentPrice;

            if (!anchorPrice || !currentPrice) {
                throw new Error("Invalid price data received from API");
            }

            // 3. Get ATR
            const defaultATR = pair.includes("JPY") ? 1.00 : 0.0080;
            const atr = ATR_LOOKUP[pair] || defaultATR;

            // 4. Run Calculations
            const pairScore = calculatePairScore(baseScore, quoteScore);

            // We pass 0.01 (1%) as the Volatility Factor (News Sensitivity)
            const fairValue = calculateFairValue(anchorPrice, pairScore, 0.01);

            // Standard Deviation Bands
            const sd1_upper = fairValue + atr;
            const sd1_lower = fairValue - atr;
            const sd2_upper = fairValue + (2 * atr);
            const sd2_lower = fairValue - (2 * atr);

            // Bell Curve Data
            const curveData = generateNormalDistribution(fairValue, atr);

            setData({
                pair,
                prices: { current: currentPrice, anchor: anchorPrice },
                scores: { base: baseScore, quote: quoteScore, net: pairScore },
                fairValue,
                stats: { atr, sd1_upper, sd1_lower, sd2_upper, sd2_lower },
                curveData
            });

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Calculation failed");
        } finally {
            setLoading(false);
        }
    };

    return { calculate, loading, data, error };
}