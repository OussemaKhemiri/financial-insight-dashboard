import { ReactNode } from "react";

interface StockGridProps {
    upLeft: ReactNode;
    upRight: ReactNode;
    downLeft: ReactNode;
    downRight: ReactNode;
    bottomSection: ReactNode;
}

export default function StockGrid({
    upLeft,
    upRight,
    downLeft,
    downRight,
    bottomSection,
}: StockGridProps) {
    return (
        <div className="flex flex-col gap-8">
            {/* --- SCREEN 1: The Dashboard Grid --- */}
            {/* Height = Viewport - Navbar - Margins */}
            <div className="grid grid-cols-1 lg:grid-cols-2 grid-rows-2 gap-4 h-[calc(100vh-96px)]">

                {/* UP LEFT */}
                <div className="border rounded-lg shadow-sm overflow-hidden relative bg-white">
                    {upLeft}
                </div>

                {/* UP RIGHT */}
                <div className="border rounded-lg shadow-sm overflow-hidden relative bg-white">
                    {upRight}
                </div>

                {/* DOWN LEFT */}
                <div className="border rounded-lg shadow-sm overflow-hidden relative bg-white">
                    {downLeft}
                </div>

                {/* DOWN RIGHT */}
                <div className="border rounded-lg shadow-sm overflow-hidden relative bg-white">
                    {downRight}
                </div>
            </div>

            {/* --- SCREEN 2: The News Section --- */}
            {/* Forces a scroll to see this full section */}
            <div className="min-h-screen border rounded-lg shadow-sm overflow-hidden relative bg-white">
                {bottomSection}
            </div>
        </div>
    );
}