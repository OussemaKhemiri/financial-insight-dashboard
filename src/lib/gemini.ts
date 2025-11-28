// src/lib/gemini.ts

const getApiKey = () => {
    if (typeof window !== "undefined") {
        const stored = localStorage.getItem("gemini_api_key");
        if (!stored) return "";

        let cleanKey = stored.trim();
        if (cleanKey.startsWith('"') && cleanKey.endsWith('"')) {
            cleanKey = cleanKey.slice(1, -1);
        }
        return cleanKey;
    }
    return "";
};

export async function analyzePortfolioWithGemini(portfolioData: any[]) {
    const apiKey = getApiKey();

    if (!apiKey) throw new Error("Missing Gemini API Key. Please set it in Settings.");

    const promptText = `
  You are a professional Forex Analyst. 
  Here is the your current portfolio: ${JSON.stringify(portfolioData)}.
  
  TASK:
  1. Search the web for the latest news, sentiment, and technical levels for these specific pairs.
  2. For each pair, decide on an ACTION: "HOLD", "ADD", or "CLOSE".
  3. Provide a short "General Insight" summary of the portfolio exposure.
  
  IMPORTANT: 
  Return ONLY the raw JSON string. Do not use Markdown formatting (no \`\`\`json). 
  Do not add any conversational text before or after the JSON.
  
  OUTPUT FORMAT:
  {
      "summary": "Concise summary of market sentiment.",
      "analysis": {
          "PAIR_NAME": "ACTION" 
      }
  }
  `;

    const model = "gemini-2.0-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const payload = {
        contents: [
            {
                parts: [
                    { text: promptText }
                ]
            }
        ],
        tools: [
            {
                googleSearch: {}
            }
        ]
        // REMOVED: generationConfig (JSON Mode) to allow Search Grounding to work
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Gemini API Error:", errorData);
            throw new Error(errorData.error?.message || "Gemini API Request failed");
        }

        const data = await response.json();
        let textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) {
            throw new Error("No content returned from AI.");
        }

        // --- MANUAL CLEANUP ---
        // Since we can't force JSON mode, the AI might wrap it in ```json ... ```
        // We strip that out manually.
        textResponse = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();

        // Find the first '{' and last '}' to ensure we only get the JSON object
        const firstBrace = textResponse.indexOf('{');
        const lastBrace = textResponse.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1) {
            textResponse = textResponse.substring(firstBrace, lastBrace + 1);
        }

        return JSON.parse(textResponse);

    } catch (error: any) {
        console.error("Gemini Fetch Error:", error);
        throw new Error(error.message || "Failed to analyze portfolio.");
    }
}