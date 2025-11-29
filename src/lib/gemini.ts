
export interface EarningsInput {
    ticker: string;
    price: string;
    description: string;
    valuation: string;
    income: string;
    balance: string;
    cashFlow: string;
}


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


export async function enrichStockData(ticker: string) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("Missing Gemini API Key.");

    const promptText = `
  You are a financial data assistant. Search the web for the latest details on stock ticker: "${ticker}".
  
  TASK:
  Find the following 3 data points:
  1. **Sector** (e.g. Technology, Healthcare)
  2. **Next Ex-Dividend Date** (YYYY-MM-DD or "N/A" if it doesn't pay dividends)
  3. **Next Earnings Report Date** (YYYY-MM-DD, estimated is fine)

  IMPORTANT:
  Return ONLY raw JSON. No Markdown. No text.
  
  JSON FORMAT:
  {
      "sector": "Sector Name",
      "exDividend": "YYYY-MM-DD",
      "earnings": "YYYY-MM-DD"
  }
  `;

    const model = "gemini-2.0-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ parts: [{ text: promptText }] }],
        // UPDATED: Using the simpler syntax you requested
        tools: [
            {
                googleSearch: {}
            }
        ]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            // LOG THE REAL ERROR to the console
            const errorBody = await response.json();
            console.error("Gemini API Error Detail:", errorBody);
            throw new Error(errorBody.error?.message || "Gemini API Request failed");
        }

        const data = await response.json();
        let textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) throw new Error("No content returned.");

        // Cleanup JSON (Strip markdown if present)
        textResponse = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();

        // Robust parsing: extract valid JSON substring
        const firstBrace = textResponse.indexOf('{');
        const lastBrace = textResponse.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            textResponse = textResponse.substring(firstBrace, lastBrace + 1);
        }

        return JSON.parse(textResponse);

    } catch (error) {
        console.error("Stock Enrich Error:", error);
        // Return fallback data so the UI doesn't crash
        return { sector: "Unknown", exDividend: "-", earnings: "-" };
    }
}



export async function analyzeEarnings(inputs: EarningsInput) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("Missing Gemini API Key.");

    const promptText = `
  System Role: You are a strict Value Investor and Financial Analyst.
  
  Input Data:
  - Ticker: ${inputs.ticker}
  - Current Price: ${inputs.price}
  - Company Profile: ${inputs.description}
  - Valuation Measures: ${inputs.valuation}
  - Income Statement: ${inputs.income}
  - Balance Sheet: ${inputs.balance}
  - Cash Flow: ${inputs.cashFlow}

  Task: Analyze this company and provide a rating (BUY, SELL, or HOLD).
  
  Step-by-Step Logic:
  1. Sector Check: Identify industry risks based on Description.
  2. Financial Health Score: Check Balance Sheet (Debt vs Cash).
  3. Quality of Earnings: Check Cash Flow (Operations vs Debt/Dilution).
  4. Valuation Check: Compare P/E, P/S to growth. Cheap or Expensive?

  IMPORTANT: Return ONLY raw JSON. No Markdown.
  
  JSON FORMAT:
  {
    "verdict": "BUY | SELL | HOLD",
    "oneLiner": "A single sentence summary.",
    "bullishPoints": ["Point 1", "Point 2", "Point 3"],
    "bearishPoints": ["Risk 1", "Risk 2", "Risk 3"],
    "keyMetrics": "Brief text highlighting the most critical numbers found."
  }
  `;

    const model = "gemini-2.0-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ parts: [{ text: promptText }] }],
        // No search tool needed here, we are analyzing provided text
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || "Gemini Analysis Failed");
        }

        const data = await response.json();
        let textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) throw new Error("No analysis returned.");

        // Cleanup JSON
        textResponse = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        const firstBrace = textResponse.indexOf('{');
        const lastBrace = textResponse.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            textResponse = textResponse.substring(firstBrace, lastBrace + 1);
        }

        return JSON.parse(textResponse);

    } catch (error: any) {
        console.error("Earnings Analysis Error:", error);
        throw new Error(error.message || "Failed to generate analysis.");
    }
}