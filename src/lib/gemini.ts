

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
  Here is your current portfolio: ${JSON.stringify(portfolioData)}.
  
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

    const model = "gemini-2.0-flash-lite";
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



export async function analyzeFinanceArticle(articleText: string) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("Missing Gemini API Key. Please set it in Settings.");

    const promptText = `
You are a top-tier financial analyst and strategic advisor. You have access to Google Search. 
Your purpose is to deconstruct financial news with depth, foresight, and critical rigor of this article :
"${articleText}"

You MUST return the response using **EXACTLY** this format with "###" separators. Do not change the headers.

Provide : 
### 1. EXECUTIVE SUMMARY
Brief overview of the article's main points 

### 2. SECTOR ANALYSIS
- Primary sector(s) involved (Technology, Healthcare, Finance, Energy, etc.) 
- Secondary sectors affected - Industry trends mentioned  

### 3. STOCK/COMPANY IMPACT 
- Specific companies mentioned 
- Potentially affected stocks (directly or indirectly) 

### 4. EVENT ANALYSIS 
- Generate 3 Plausible Scenarios: Base these on the article's content with assigned probability 
- Identify 1-2 similar events from market history and what happened then in terms of impact. 

### 5. SENTIMENT ANALYSIS
- Overall tone: 🐂 Bullish / 🐻 Bearish / ⚖️ Neutral 
- Confidence level in the sentiment 
- Key factors driving the sentiment 

### 6. TRADING OPPORTUNITIES
- Risk factors to consider 
- Time horizon (short-term/long-term) 

### 7. TRADING SUGGESTIONS
- Specific actions (Buy/Hold/Sell/Avoid)(stock names if applicable)
- Alternative investments to consider 

Focus on actionable financial insights and market-moving information.
`;

    const model = "gemini-2.0-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ parts: [{ text: promptText }] }],
        tools: [
            {
                googleSearch: {}
            }
        ]
        // Note: No responseMimeType here, we want plain text to support Search Grounding
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
            throw new Error(errorData.error?.message || "Gemini Article Analysis failed");
        }

        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) throw new Error("No analysis returned from AI.");

        return textResponse;

    } catch (error: any) {
        console.error("Gemini Article Error:", error);
        throw new Error(error.message || "Failed to analyze article.");
    }
}