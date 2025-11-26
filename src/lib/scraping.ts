// src/lib/scraping.ts
import { calculateEventScore, calculateTrendScore } from "./math-forex";

export interface ForexEvent {
    currency: string;
    weight: number;
    direction: number;
    actual: string;
    forecast: string;
}

// Map class names to weights
const IMPACT_MAP: Record<string, number> = {
    "red": 1.0,  // High
    "ora": 0.5,  // Medium
    "yel": 0.25, // Low
    "gray": 0.1  // Non-economic (holidays etc)
};

export function parseForexFactoryHTML(htmlString: string): ForexEvent[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    // Select all event rows (they have data-event-id attribute)
    const rows = doc.querySelectorAll("tr[data-event-id]");
    const events: ForexEvent[] = [];

    rows.forEach((row) => {
        // 1. Currency
        const currencyEl = row.querySelector(".calendar__currency");
        const currency = currencyEl?.textContent?.trim() || "";
        if (!currency) return;

        // 2. Impact Weight
        const impactEl = row.querySelector(".calendar__impact span");
        let weight = 0;
        if (impactEl) {
            const className = impactEl.className;
            if (className.includes("red")) weight = IMPACT_MAP["red"];
            else if (className.includes("ora")) weight = IMPACT_MAP["ora"];
            else if (className.includes("yel")) weight = IMPACT_MAP["yel"];
        }

        // 3. Actual & Forecast
        const actualEl = row.querySelector(".calendar__actual");
        const forecastEl = row.querySelector(".calendar__forecast");
        const actualText = actualEl?.textContent?.trim() || "";
        const forecastText = forecastEl?.textContent?.trim() || "";

        // 4. Direction (Better/Worse)
        // Look for class inside the 'actual' cell
        let direction = 0;
        if (actualEl) {
            if (actualEl.innerHTML.includes("better")) direction = 1;
            else if (actualEl.innerHTML.includes("worse")) direction = -1;
        }

        events.push({
            currency,
            weight,
            direction,
            actual: actualText,
            forecast: forecastText
        });
    });

    return events;
}

/**
 * Takes the previous scores map and a list of new events,
 * runs the math, and returns the updated scores.
 */
export function processEventsForScores(
    currentScores: Record<string, number>,
    events: ForexEvent[]
): Record<string, number> {
    const newScores = { ...currentScores };

    events.forEach(event => {
        if (!newScores[event.currency]) newScores[event.currency] = 0; // Init if missing

        // 1. Math Step 1
        const eventScore = calculateEventScore(
            event.weight,
            event.direction,
            event.actual,
            event.forecast
        );

        // 2. Math Step 2 (Accumulate)
        // We update the score immediately for every event found
        newScores[event.currency] = calculateTrendScore(newScores[event.currency], eventScore);
    });

    return newScores;
}