import { ReactNode } from "react";

interface ForexGridProps {
    upLeft: ReactNode;
    upRight: ReactNode;
    downLeftPortfolio: ReactNode;
    downLeftCharts: ReactNode;
    downRight: ReactNode;
    bottomSection: ReactNode;
}

export default function ForexGrid({
    upLeft,
    upRight,
    downLeftPortfolio,
    downLeftCharts,
    downRight,
    bottomSection,
}: ForexGridProps) {
    return (
        <div className="flex flex-col gap-8">
            {/* --- SCREEN 1: The Forex Dashboard Grid --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 grid-rows-2 gap-4 h-[calc(100vh-96px)]">

                {/* UP LEFT */}
                <div className="border rounded-lg shadow-sm overflow-hidden relative bg-white">
                    {upLeft}
                </div>

                {/* UP RIGHT */}
                <div className="border rounded-lg shadow-sm overflow-hidden relative bg-white">
                    {upRight}
                </div>

                {/* DOWN LEFT: SPLIT */}
                <div className="grid grid-cols-2 gap-2">
                    {/* Sub-Left */}
                    <div className="border rounded-lg shadow-sm overflow-hidden relative bg-white">
                        {downLeftPortfolio}
                    </div>
                    {/* Sub-Right */}
                    <div className="border rounded-lg shadow-sm overflow-hidden relative bg-white">
                        {downLeftCharts}
                    </div>
                </div>

                {/* DOWN RIGHT */}
                <div className="border rounded-lg shadow-sm overflow-hidden relative bg-white">
                    {downRight}
                </div>
            </div>

            {/* --- SCREEN 2: The News Section --- */}
            <div className="min-h-screen border rounded-lg shadow-sm overflow-hidden relative bg-white">
                {bottomSection}
            </div>
        </div>
    );
}