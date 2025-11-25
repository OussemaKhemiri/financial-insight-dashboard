"use client";

import GridContainer from "@/components/layout/GridContainer";
import { useState } from "react";

export default function TestApiPage() {
    const [rssResult, setRssResult] = useState<string>("Waiting to test...");
    const [scrapeResult, setScrapeResult] = useState<string>("Waiting to test...");
    const [loading, setLoading] = useState(false);

    // TEST 1: Investing.com RSS via Proxy
    // TEST 1: Investing.com RSS via rss2json (The Fix)
    const testRSS = async () => {
        setLoading(true);
        setRssResult("Fetching...");
        try {
            const targetUrl = encodeURIComponent("https://www.investing.com/rss/market_overview.rss");
            // api.rss2json.com is specifically built for this
            const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${targetUrl}`;

            const response = await fetch(proxyUrl);
            const data = await response.json();

            if (data.status === "ok") {
                // rss2json returns a nice 'items' array
                const firstTitle = data.items[0]?.title || "No title found";
                setRssResult(`SUCCESS! \n\nFeed Title: ${data.feed.title} \nTop Story: ${firstTitle}`);
            } else {
                setRssResult(`FAILED: ${data.message || "Unknown error"}`);
            }
        } catch (error: any) {
            setRssResult(`ERROR: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // TEST 2: ForexFactory Scraping via Proxy
    const testScraping = async () => {
        setLoading(true);
        setScrapeResult("Fetching...");
        try {
            // We fetch the calendar page
            const targetUrl = encodeURIComponent("https://www.forexfactory.com/calendar?day=yesterday");
            const proxyUrl = `https://api.allorigins.win/get?url=${targetUrl}&t=${Date.now()}`;

            const response = await fetch(proxyUrl);
            const data = await response.json();

            if (data.contents) {
                // Check if we actually got the HTML containing the table
                const hasTable = data.contents.includes("calendar__table");

                if (hasTable) {
                    setScrapeResult(`SUCCESS! Found 'calendar__table' in HTML. \n\nLength: ${data.contents.length} chars.`);
                } else {
                    setScrapeResult(`WARNING: HTML fetched, but 'calendar__table' not found. They might be blocking bots. \n\nPreview:\n${data.contents.substring(0, 500)}`);
                }
            } else {
                setScrapeResult("FAILED: Proxy returned no content.");
            }
        } catch (error: any) {
            setScrapeResult(`ERROR: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <GridContainer>
            <div className="max-w-4xl mx-auto w-full flex flex-col gap-8 bg-white p-8 rounded-lg shadow">
                <h1 className="text-2xl font-bold">API & Proxy Connectivity Test</h1>
                <p className="text-slate-500">
                    This page tests if we can bypass CORS to reach Investing.com and ForexFactory.
                </p>

                <div className="grid grid-cols-2 gap-8">
                    {/* RSS Section */}
                    <div className="flex flex-col gap-4">
                        <h2 className="font-bold text-lg text-blue-600">Test 1: Investing.com RSS</h2>
                        <button
                            onClick={testRSS}
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "Testing..." : "Run RSS Test"}
                        </button>
                        <textarea
                            readOnly
                            value={rssResult}
                            className="w-full h-64 p-2 text-xs font-mono border rounded bg-slate-50"
                        />
                    </div>

                    {/* Scraping Section */}
                    <div className="flex flex-col gap-4">
                        <h2 className="font-bold text-lg text-green-600">Test 2: ForexFactory Scraping</h2>
                        <button
                            onClick={testScraping}
                            disabled={loading}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? "Testing..." : "Run Scraping Test"}
                        </button>
                        <textarea
                            readOnly
                            value={scrapeResult}
                            className="w-full h-64 p-2 text-xs font-mono border rounded bg-slate-50"
                        />
                    </div>
                </div>
            </div>
        </GridContainer>
    );
}