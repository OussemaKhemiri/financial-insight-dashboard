export default function CalendarEmbed() {
    return (
        <div className="w-full h-full flex flex-col bg-white overflow-hidden">
            {/* Header */}
            <div className="px-4 py-2 border-b bg-slate-50 text-xs font-bold text-slate-700 uppercase tracking-wider">
                Economic Calendar
            </div>

            {/* Iframe Container */}
            <div className="flex-2 w-full relative">
                <iframe
                    src="https://sslecal2.investing.com?ecoDayBackground=%23162633&innerBorderColor=%237800b8&borderColor=%23000000&ecoDayFontColor=%23ffffff&columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&features=datepicker,timezone,timeselector,filters&countries=25,32,6,37,72,22,17,39,14,10,35,43,56,36,110,11,26,12,4,5&calType=week&timeZone=16&lang=1"
                    className="absolute inset-0 w-full h-full border-0"
                    title="Investing.com Economic Calendar"
                    allowtransparency="true"
                />
            </div>

            {/* Attribution Footer */}
            <div className="bg-slate-50 border-t p-1 text-center">
                <span className="text-[10px] text-slate-500">
                    Real Time Economic Calendar provided by{" "}
                    <a
                        href="https://www.investing.com/"
                        target="_blank"
                        rel="nofollow noreferrer"
                        className="text-blue-600 font-bold hover:underline"
                    >
                        Investing.com
                    </a>
                </span>
            </div>
        </div>
    );
}