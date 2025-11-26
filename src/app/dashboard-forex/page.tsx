import GridContainer from "@/components/layout/GridContainer";
import ForexGrid from "@/components/forex/ForexGrid";
import NotesEditor from "@/components/shared/NotesEditor";
import MarketNewsTable from "@/components/shared/MarketNewsTable";
import CalendarEmbed from "@/components/forex/CalendarEmbed";

// Helper component for placeholders
const Placeholder = ({ title, color }: { title: string; color: string }) => (
    <div className={`w-full h-full flex flex-col items-center justify-center ${color} p-4`}>
        <h2 className="font-bold text-slate-700">{title}</h2>
        <p className="text-xs text-slate-500 mt-2">Component Placeholder</p>
    </div>
);

export default function ForexDashboardPage() {
    return (
        <GridContainer>
            <ForexGrid
                upLeft={
                    <NotesEditor
                        storageKey="forex_notes"
                        title="Forex Strategy Notes"
                    />
                }
                upRight={<CalendarEmbed />}
                downLeftPortfolio={
                    <Placeholder title="DL (Left): Portfolio" color="bg-blue-50" />
                }
                downLeftCharts={
                    <Placeholder title="DL (Right): Strength Charts" color="bg-indigo-50" />
                }
                downRight={
                    <Placeholder title="DOWN RIGHT: Fair Value Calc" color="bg-purple-50" />
                }
                bottomSection={<MarketNewsTable />}
            />
        </GridContainer>
    );
}