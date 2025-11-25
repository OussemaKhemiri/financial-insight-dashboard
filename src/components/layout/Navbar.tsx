import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="bg-slate-900 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold tracking-tight text-blue-400">
                    FinInsight<span className="text-white">.AI</span>
                </h1>
                <div className="flex space-x-6 text-sm font-medium">
                    <Link href="/dashboard-stocks" className="hover:text-blue-400 transition-colors">
                        Stocks
                    </Link>
                    <Link href="/dashboard-forex" className="hover:text-blue-400 transition-colors">
                        Forex
                    </Link>
                    <Link href="/settings" className="hover:text-blue-400 transition-colors">
                        Settings
                    </Link>
                </div>
            </div>
        </nav>
    );
}