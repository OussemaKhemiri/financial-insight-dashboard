// src/hooks/useGemini.ts
import { useState } from 'react';
import { analyzePortfolioWithGemini } from '@/lib/gemini';

export function useGemini() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const analyzePortfolio = async (portfolio: any[]) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await analyzePortfolioWithGemini(portfolio);
            return data;
        } catch (err: any) {
            setError(err.message || "Something went wrong with Gemini analysis.");
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { analyzePortfolio, isLoading, error };
}