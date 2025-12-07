
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

const getModelName = () => {
    if (typeof window !== "undefined") {
        const stored = localStorage.getItem("gemini_model_name");
        if (!stored) return "gemini-2.5-flash-live";

        let model = stored.trim();
        // Remove surrounding quotes if present
        if (model.startsWith('"') && model.endsWith('"')) {
            model = model.slice(1, -1);
        }
        return model;
    }
    // Server-side fallback
    return "gemini-2.5-flash-live";
};
///////////////////////////FOREX ANALYSIS WITH SEARCH GROUNDING///////////////////////////
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

    const model = getModelName();
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


////////////////////////////FINANCE ARTICLE ANALYSIS WITH SEARCH GROUNDING///////////////////////////
export async function analyzeFinanceArticle(articleText: string) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("Missing Gemini API Key. Please set it in Settings.");

    const promptText = `
You are a top-tier financial analyst and strategic advisor. You have access to Google Search. 
Your purpose is to deconstruct financial news with depth, foresight, and critical rigor of this article :
"${articleText}"

NEGATIVE CONSTRAINTS:
- Do NOT say "Okay", "Here is the analysis", or "I will do that".
- Do NOT add any introductory text.
- START IMMEDIATELY with "### 1. EXECUTIVE SUMMARY".

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

    const model = getModelName();
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

///////////////////////////STOCK DATA ENRICHMENT WITH SEARCH GROUNDING///////////////////////////
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

    const model = getModelName();
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


////////////////////////////EARNINGS ANALYSIS WITHOUT SEARCH GROUNDING///////////////////////////
export async function analyzeEarnings(inputs: EarningsInput) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("Missing Gemini API Key.");

    const promptText = `
  System Role: You are a seasoned Portfolio Manager and Value Investor (CFA Charterholder). You combine fundamental analysis with market cycle psychology.

  Input Data:
  - Ticker: ${inputs.ticker}
  - Current Price: ${inputs.price}
  - Company Profile: ${inputs.description}
  - Valuation Measures: ${inputs.valuation}
  - Income Statement: ${inputs.income}
  - Balance Sheet: ${inputs.balance}
  - Cash Flow: ${inputs.cashFlow}

  Task: Perform a deep-dive analysis to determine the stock's Investment Grade, Market Stage, and Strategic Categories.
  Note: If TTM data contains '--' or is missing, use the most recent Full Year column (e.g., 12/31/2024) for your analysis, but mention this in the 'bearishPoints' as a data latency risk.
  ---------------------------------------------------
  ANALYSIS FRAMEWORK:
  
  1. CATEGORY IDENTIFICATION (Choose ONE best fit):
     - "Market Leader": Dominant market share, huge cap, stable margins.
     - "Top Competitor": Strong #2 or #3 player, fighting for share.
     - "Institutional Favorite": High quality, steady growth, widely held.
     - "Turnaround": Recent poor performance but clear signs of operational fixing.
     - "Cyclical": Performance tied heavily to economic macro-cycles (Commodities, Autos).
     - "Laggard": Losing market share, deteriorating fundamentals, "Value Trap".

  2. MARKET CYCLE STAGE (Estimate based on Valuation & Growth Momentum):
     - "Stage 1 (Neglect/Consolidation)": Low P/E, flat price, boring news, but solid floor.
     - "Stage 2 (Advancing/Accumulation)": Rising growth, expanding P/E, positive momentum.
     - "Stage 3 (Topping/Distribution)": Growth slowing, very high P/E, insiders selling, peak optimism.
     - "Stage 4 (Declining/Capitulation)": Missing earnings, compressing P/E, bad news piling up.

  3. PRICING LOGIC:
     - "Intrinsic Value": Calculate the true worth based on DCF or Historical Multiples.
     - "Buy Below": A price offering a Margin of Safety (usually 10-20% below Intrinsic).
     - "Volatility Flag": A price level so low that it implies the thesis is broken (e.g., if it drops 30% from here without news, it's not a bargain, it's a bankruptcy risk).

  ---------------------------------------------------
  OUTPUT INSTRUCTIONS:
  Return ONLY raw JSON. No Markdown formatting.
  
  JSON FORMAT:
  {
    "verdict": "BUY | SELL | HOLD",
    "category": "One of the 6 categories above",
    "marketStage": "One of the 4 stages above",
    "healthScore": 0 to 100 (Integer),
    "oneLiner": "A sharp, professional summary of the situation.",
    "priceTargets": {
       "current": ${inputs.price},
       "intrinsicValue": "Estimated Fair Value (Number)",
       "buyBelow": "Target Entry Price (Number)",
       "volatilityWarning": "The price level where the 'Value Thesis' breaks (Number)"
    },
    "bullishPoints": ["Point 1", "Point 2", "Point 3"],
    "bearishPoints": ["Risk 1", "Risk 2", "Risk 3"],
    "keyMetrics": "Brief text highlighting critical numbers (e.g. 'Debt/EBITDA is 4x')."
  }
`;

    const model = getModelName();
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