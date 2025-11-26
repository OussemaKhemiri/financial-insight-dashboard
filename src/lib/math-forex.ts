// src/lib/math-forex.ts

/**
 * Parses numeric strings like "10.5K", "1.2%", "-5" into raw numbers.
 */
export function parseEconomicNumber(val: string): number | null {
    if (!val) return null;
    let clean = val.trim().replace(/,/g, ""); // Remove commas

    const multipliers: Record<string, number> = {
        'K': 1000,
        'M': 1000000,
        'B': 1000000000,
        '%': 0.01 // Treat percent as small decimal or just strip? Usually just strip for magnitude comparison
    };

    // Check last character for multiplier
    const lastChar = clean.slice(-1).toUpperCase();
    let multiplier = 1;

    if (multipliers[lastChar]) {
        multiplier = multipliers[lastChar];
        clean = clean.slice(0, -1);
    } else if (lastChar === '%') {
        clean = clean.slice(0, -1); // Just strip %, don't scale down, relative magnitude works better on raw numbers usually
    }

    const num = parseFloat(clean);
    return isNaN(num) ? null : num * multiplier;
}

/**
 * Step 1: Calculate the "Event Score"
 * Score = tanh(2 * Weight * Direction * (1 + Magnitude))
 */
export function calculateEventScore(
    weight: number,   // 1.0 (High), 0.5 (Med), 0.25 (Low)
    direction: number, // 1 (Better), -1 (Worse), 0 (None)
    actualStr: string,
    forecastStr: string
): number {
    if (direction === 0) return 0; // No impact if neutral

    const actual = parseEconomicNumber(actualStr);
    const forecast = parseEconomicNumber(forecastStr);

    // Magnitude Logic
    let magnitude = 0;
    if (actual !== null && forecast !== null && forecast !== 0) { // Avoid division by zero
        // Formula: |Actual - Forecast| / (|Forecast| + 0.1)
        // Added 0.1 to denominator to prevent explosion on small numbers
        magnitude = Math.abs(actual - forecast) / (Math.abs(forecast) + 0.1);
    }

    // Cap Magnitude at 2.0
    if (magnitude > 2.0) magnitude = 2.0;

    // Sensitivity Factor
    const sensitivity = 2;

    // tanh( 2 * weight * direction * (1 + magnitude) )
    return Math.tanh(sensitivity * weight * direction * (1 + magnitude));
}

/**
 * Step 2: Calculate the "Current Score" (Rubber Band Trend)
 * New = Old + Speed * (Event - Old)
 */
export function calculateTrendScore(oldScore: number, eventScore: number, speed: number = 0.2): number {
    return oldScore + speed * (eventScore - oldScore);
}