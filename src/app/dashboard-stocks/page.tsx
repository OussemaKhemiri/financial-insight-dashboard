import GridContainer from "@/components/layout/GridContainer";
import StockGrid from "@/components/stocks/StockGrid";

// Temporary Placeholder Component
// We will replace these with real components (NotesEditor, PortfolioTable, etc.) in the next steps
const Placeholder = ({ title, color, desc }: { title: string; color: string; desc?: string }) => (
    <div className={`w-full h-full flex flex-col items-center justify-center ${color} p-4 text-center`}>
        <h2 className="font-bold text-slate-800 text-lg">{title}</h2>
        {desc && <p className="text-sm text-slate-600 mt-2 max-w-md">{desc}</p>}
    </div>
);

export default function StocksDashboardPage() {
    return (
        <GridContainer>
            <StockGrid
                // UP LEFT: User Notes
                upLeft={
                    <Placeholder
                        title="UP LEFT: Stock Notes"
                        color="bg-yellow-100"
                        desc="Rich text area to save thoughts to localStorage."
                    />
                }

                // UP RIGHT: Gemini Article Analysis
                upRight={
                    <Placeholder
                        title="UP RIGHT: Article Analysis (Gemini)"
                        color="bg-blue-100"
                        desc="Paste article -> Inject Portfolio -> AI Analysis."
                    />
                }

                // DOWN LEFT: Portfolio Table
                downLeft={
                    <Placeholder
                        title="DOWN LEFT: Portfolio"
                        color="bg-green-100"
                        desc="Table: Ticker, Earnings Prev/Next, Action."
                    />
                }

                // DOWN RIGHT: Gemini Earnings Analysis
                downRight={
                    <Placeholder
                        title="DOWN RIGHT: Earnings Analysis (Gemini)"
                        color="bg-purple-100"
                        desc="Paste earnings report -> Inject Portfolio -> AI Analysis."
                    />
                }

                // BOTTOM: Full Screen News Section
                bottomSection={
                    <Placeholder
                        title="BOTTOM: News & Market Data"
                        color="bg-slate-200"
                        desc="Tabs: NewsAPI Search & Investing.com RSS Table."
                    />
                }
            />
        </GridContainer>
    );
}