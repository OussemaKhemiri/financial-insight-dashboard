// src/hooks/useEarningsAnalysis.ts
import { useState } from 'react';
import { analyzeEarnings, EarningsInput } from '@/lib/gemini';

export function useEarningsAnalysis() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<any | null>(null);

    const runAnalysis = async (data: EarningsInput) => {
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const output = await analyzeEarnings(data);
            setResult(output);
        } catch (err: any) {
            setError(err.message || "Analysis failed.");
        } finally {
            setIsLoading(false);
        }
    };

    const clearResult = () => {
        setResult(null);
        setError(null);
    };

    return { runAnalysis, result, isLoading, error, clearResult };
}