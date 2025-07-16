// Wait for the DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('city-input');
    const searchButton = document.getElementById('search-button');

    // --- Event Listeners ---
    // Attach event listeners in JS, not in HTML
    searchButton.addEventListener('click', updateLocation);
    cityInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission if it's in a form
            updateLocation();
        }
    });

    // --- Initialization ---
    updateDates(); // Set dates immediately
    updateClock(); // Set clock immediately
    setInterval(updateClock, 60000); // Update clock every second for live ticking
});

// Keep track of the last checked day to refresh data automatically at midnight
let lastCheckedDay = new Date().getDate();

/**
 * Fetches location data for the entered city and then triggers prayer time fetching.
 */
async function updateLocation() {
    const cityInput = document.getElementById('city-input');
    const cityNameElement = document.getElementById('city-name');
    const searchButton = document.getElementById('search-button');
    const city = cityInput.value.trim();
    
    // Assuming 'translations' is a global object available from language.js
    const lang = document.documentElement.lang || 'ar';

    if (!city) {
        // Use the UI for feedback instead of a blocking alert()
        cityNameElement.innerText = translations[lang].city_input_alert;
        return;
    }

    // --- Set UI to Loading State ---
    cityInput.disabled = true;
    searchButton.disabled = true;
    searchButton.classList.add('loading');
    cityNameElement.innerText = translations[lang].city_search_loading.replace('{city}', city);
    // ---

    const geocodeAPI = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&accept-language=ar,en&limit=1`;

    try {
        const response = await fetch(geocodeAPI);
        if (!response.ok) {
            throw new Error('Network response was not ok for geocoding');
        }
        const data = await response.json();

        if (data && data.length > 0) {
            const location = data[0];
            const lat = location.lat;
            const lon = location.lon;

            // Store location details in sessionStorage to persist across the session
            sessionStorage.setItem('userLat', lat);
            sessionStorage.setItem('userLng', lon);
            sessionStorage.setItem('userCityName', location.display_name); // Also store the name

            cityNameElement.innerText = location.display_name;
            
            // IMPORTANT: This function is in geolocation.js.
            // The timezone bug you reported is likely in how this function *displays* the times.
            // Ensure it does not use `new Date(timeString)` which can cause incorrect conversions.
            await getLocationTiming(lat, lon); 
        } else {
            cityNameElement.innerText = translations[lang].city_not_found.replace('{city}', city);
        }
    } catch (error) {
        console.error('Error fetching location data:', error);
        cityNameElement.innerText = translations[lang].city_search_error;
    } finally {
        // --- Restore UI from Loading State ---
        cityInput.disabled = false;
        searchButton.disabled = false;
        searchButton.classList.remove('loading');
    }
}

/**
 * Updates the live clock and triggers a daily refresh of prayer times if the day changes.
 */
function updateClock() {
    const now = new Date();
    const currentDay = now.getDate();

    // Check if the day has changed (e.g., it's past midnight)
    if (currentDay !== lastCheckedDay) {
        console.log("New day detected. Refreshing dates and prayer times.");
        lastCheckedDay = currentDay;

        // Refresh the Hijri and Gregorian dates
        updateDates();

        // Refresh prayer times using the location stored in the session
        const lat = sessionStorage.getItem('userLat');
        const lon = sessionStorage.getItem('userLng');
        if (lat && lon) {
            // This function is assumed to be in geolocation.js
            getLocationTiming(parseFloat(lat), parseFloat(lon));
        }
    }

    // Update the clock display elements
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // The hour '0' should be '12'
  
    document.getElementById('hours').innerText = String(hours).padStart(2, '0');
    document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
    document.getElementById('seconds').innerText = String(now.getSeconds()).padStart(2, '0');
}

/**
 * Updates the Gregorian and Hijri date displays in the UI.
 */
function updateDates() {
    const now = new
 
Date();
    // Using 'ar-EG' for Gregorian is a good default for Arabic numerals and format.
    document.getElementById("gregorian-date").innerText = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    
    // The 'u-ca-islamic' extension is the correct way to get the Hijri calendar.
    const hijriDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { year: 'numeric', month: 'long', day: 'numeric' }).format(now);
    document.getElementById("hijri-date").innerText = hijriDate;
}