
# 📈 Financial Insight Dashboard

A powerful, **Serverless Client-Side SPA** for financial analytics, powered by **Next.js** and **Google Gemini AI**. 

This project operates entirely in the browser without a traditional backend database. It persists data via `localStorage`, fetches real-time market data through CORS proxies, and leverages AI for deep financial analysis.

## ✨ Key Features

### 🌍 Forex Dashboard
*   **Currency Strength Meter:** Real-time relative strength calculation by scraping ForexFactory calendar events via proxy. Includes intelligent "Backfill" logic to calculate missing historical data.
*   **Fair Value Gap:** Mathematical modeling using Yahoo Finance API data + Gaussian Bell Curve logic.
*   **AI Portfolio Tracker:** Manage positions with Gemini-powered "Hold/Accumulate/Close" recommendations.

### 🏢 Stocks Dashboard
*   **Smart Portfolio:** Add tickers (e.g., "NVDA") and watch the app automatically enrich data (Sector, Ex-Dividend, Earnings Date) using AI.
*   **Market News:** Real-time RSS feeds (Investing.com) with **keyword highlighting** and color-coding.
*   **Earnings Analyzer:** Paste raw financial text (Income Statement, Balance Sheet) to generate a professional "Buy/Sell/Hold" thesis.
*   **Article Deconstructor:** Paste news articles to get a structured executive summary, sentiment analysis, and trading scenarios.

### ⚙️ Architecture
*   **Zero Backend:** No Node.js server, no SQL/NoSQL database.
*   **Persistence:** Custom `useLocalStorage` hook acts as the database.
*   **AI Integration:** Direct Client-to-API calls to Google Gemini 2.0 Flash (supports Google Search Grounding).
*   **Networking:** Bypasses CORS restrictions using `corsproxy.io` and `rss2json`.

---

## 📸 Screenshots

| **Stocks Dashboard** | **Forex Dashboard** |
|:---:|:---:|
| ![Stocks Interface](stocks.png) | ![Forex Interface](forex.png) |
| *Portfolio Tracking & Article Analysis* | *Strength Meter & Fair Value Calc* |

| **Market News** | **Settings** |
|:---:|:---:|
| ![News Interface](news.png) | ![Settings Interface](settings.png) |
| *RSS Feeds with Keyword Highlighting* | *API Key Management* |

---

## 🛠️ Tech Stack

*   **Framework:** Next.js 14 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS + Lucide React Icons
*   **AI Provider:** Google Gemini API (Generative Language Client)
*   **State Management:** React Hooks + LocalStorage
*   **Data Fetching:** Native `fetch` with CORS Proxies

---

## 🚀 Getting Started

### Prerequisites
*   Node.js 18+ installed.
*   A free [Google Gemini API Key](https://aistudio.google.com/).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/OussemaKhemiri/financial-insight-dashboard.git
    cd financial-insight-dashboard
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open the app:**
    Visit `http://localhost:3000` in your browser.

### Configuration
Since there is no backend, you **do not** need a `.env` file for the API key.
1.  Navigate to the **Settings** tab in the UI.
2.  Paste your **Gemini API Key**.
3.  The key is saved securely in your browser's `localStorage`.

---

## 📂 Project Structure

```bash
my-financial-dashboard/
├── public/                     # Static assets (favicons, images, logos)
├── .env.local                  # (Optional) Environment variables
├── next.config.js              # Next.js config
├── package.json                # Dependencies
├── tailwind.config.js          # Tailwind CSS config
├── tsconfig.json               # TypeScript config
│
└── src/                        # Source Code
    ├── app/                    # Next.js App Router
    │   ├── layout.tsx          # Global Root Layout (includes <Navbar>)
    │   ├── page.tsx            # Home (Redirects to /dashboard-stocks)
    │   ├── globals.css         # Global Tailwind imports & custom CSS
    │   │
    │   ├── dashboard-stocks/   # Route: /dashboard-stocks
    │   │   └── page.tsx        # Server Component: Renders <StockGrid>
    │   │
    │   ├── dashboard-forex/    # Route: /dashboard-forex
    │   │   └── page.tsx        # Server Component: Renders <ForexGrid>
    │   │
    │   └── settings/           # Route: /settings
    │       └── page.tsx        # Renders Settings components
    │
    ├── components/             # UI Components
    │   ├── layout/             # Structural elements
    │   │   ├── Navbar.tsx      # Top Navigation Bar
    │   │   └── GridContainer.tsx # Reusable wrapper for grid layouts
    │   │
    │   ├── shared/             # Reused across pages
    │   │   ├── MarketNewsTable.tsx # RSS Feed Table (Bottom of dashboards)
    │   │   ├── NotesEditor.tsx     # Reusable Text Area for notes
    │   │   └── Modal.tsx           # (Optional) Reusable Modal for analyses
    │   │
    │   ├── stocks/             # Stock-specific UI
    │   │   ├── StockGrid.tsx       # The Layout Grid specific to Stocks page
    │   │   ├── PortfolioTable.tsx  # The Stock List with AI enrichment
    │   │   ├── GeminiAnalysis.tsx  # Article Analysis (Text Input -> Analysis)
    │   │   └── EarningsAnalysis.tsx # Financial Data Input -> Analysis
    │   │
    │   ├── forex/              # Forex-specific UI
    │   │   ├── ForexGrid.tsx       # The Layout Grid specific to Forex page
    │   │   ├── ForexPortfolio.tsx  # AI Watchlist for pairs
    │   │   ├── StrengthCharts.tsx  # The Relative Strength Visualization
    │   │   ├── FairValueCalc.tsx   # Bell Curve Calculator
    │   │   └── CalendarEmbed.tsx   # Investing.com Economic Calendar
    │   │
    │   └── settings/           # Settings UI
    │       ├── ApiKeyInput.tsx     # Input field for Gemini Key
    │       └── StorageTable.tsx    # Raw LocalStorage Viewer/Editor
    │
    ├── hooks/                  # React Hooks (State & Logic)
    │   ├── useLocalStorage.ts      # Core persistence hook
    │   ├── useGemini.ts            # General AI Loading/Error state handler
    │   ├── useMarketNews.ts        # RSS Fetching & Caching logic
    │   ├── useForexData.ts         # Scraper, Backfill logic & History state
    │   ├── useArticleAnalysis.ts   # Logic for GeminiAnalysis component
    │   ├── useEarningsAnalysis.ts  # Logic for EarningsAnalysis component
    │   └── useFairValue.ts         # Math logic wrapper for Fair Value
    │
    └── lib/                    # Pure Logic (No React State)
        ├── storage.ts              # Safe LocalStorage accessors (get/set)
        ├── gemini.ts               # API calls & Prompts (Stock, Article, Earnings)
        ├── scraping.ts             # ForexFactory HTML parsing logic
        ├── math-forex.ts           # Math formulas (Strength, Bell Curve)
        └── constants.ts            # Proxy URLs, Feed URLs, default configs
```

## ⚠️ Disclaimer

This application is for **informational and educational purposes only**. The analysis provided by the AI and the calculations (Fair Value, Strength Meter) should not be considered as professional financial advice. Always do your own research before trading.

