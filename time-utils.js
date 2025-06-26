// --- Private Helper Functions ---

// Helper function to convert 12-hour time (e.g., "5:30:00 PM") to minutes since midnight.
function toMinutes(time) {
    const [timePart, modifier] = time.split(" ");
    let [hours, minutes, seconds] = timePart.split(":").map(Number);
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0; // Midnight case
    return hours * 60 + minutes + (seconds || 0) / 60;
}

// Helper function to convert minutes since midnight back to a 12-hour time string.
function to12HourTime(minutes) {
    minutes = (minutes + 24 * 60) % (24 * 60); // Handle wrapping past midnight
    let hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.round((minutes % 1) * 60);
    const modifier = hours >= 12 ? "PM" : "AM";
    
    hours = hours % 12;
    if (hours === 0) hours = 12; // 0 hour should be 12 AM/PM

    return `${hours}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")} ${modifier}`;
}

// --- Public Calculation Functions ---

/**
 * Calculates the real midnight time, which is the midpoint between sunset and the next day's Fajr.
 * @param {string} fajrTime - The time of Fajr (e.g., "4:45:00 AM").
 * @param {string} sunsetTime - The time of sunset (e.g., "5:35:55 PM").
 * @returns {string} The calculated real midnight time in 12-hour format.
 */
function calculateRealMidnight(fajrTime, sunsetTime) {
    const fajrMinutes = toMinutes(fajrTime);
    const sunsetMinutes = toMinutes(sunsetTime);

    let nightDuration;
    // If fajr is earlier in the day than sunset, it means it's for the next day.
    if (fajrMinutes <= sunsetMinutes) {
        nightDuration = (fajrMinutes + 24 * 60) - sunsetMinutes;
    } else {
        nightDuration = fajrMinutes - sunsetMinutes;
    }

    const realMidnightMinutes = sunsetMinutes + nightDuration / 2;
    return to12HourTime(realMidnightMinutes);
}

/**
 * Calculates the start of the last third of the night.
 * @param {string} sunsetTime - The time of sunset (e.g., "5:35:55 PM").
 * @param {string} fajrTime - The time of Fajr (e.g., "4:45:00 AM").
 * @returns {string} The calculated start time of the last third of the night in 12-hour format.
 */
function calculateLastThirdOfNight(sunsetTime, fajrTime) {
    const sunsetMinutes = toMinutes(sunsetTime);
    const fajrMinutes = toMinutes(fajrTime);

    let nightDuration = (fajrMinutes <= sunsetMinutes) ? (fajrMinutes + 24 * 60) - sunsetMinutes : fajrMinutes - sunsetMinutes;
    const lastThirdStartMinutes = sunsetMinutes + (nightDuration * 2 / 3);
    return to12HourTime(lastThirdStartMinutes);
}