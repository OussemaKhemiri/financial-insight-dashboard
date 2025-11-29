// src/hooks/useArticleAnalysis.ts
import { useState } from 'react';
import { analyzeFinanceArticle } from '@/lib/gemini';

export function useArticleAnalysis() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<string | null>(null);

    const analyze = async (text: string) => {
        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            const result = await analyzeFinanceArticle(text);
            setAnalysis(result);
        } catch (err: any) {
            setError(err.message || "Failed to analyze article.");
        } finally {
            setIsLoading(false);
        }
    };

    return { analyze, analysis, isLoading, error, setAnalysis };
}