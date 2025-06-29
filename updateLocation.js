async function updateLocation() {
    const cityInput = document.getElementById('city-input');
    const cityNameElement = document.getElementById('city-name');
    const searchButton = document.getElementById('search-button');
    const city = cityInput.value.trim();

    const lang = document.documentElement.lang || 'ar';

    if (!city) {
        alert(translations[lang].city_input_alert);
        return;
    }

    // --- Start Loading State ---
    cityInput.disabled = true;
    searchButton.disabled = true;
    searchButton.classList.add('loading');
    cityNameElement.innerText = translations[lang].city_search_loading.replace('{city}', city);
    // --- End Loading State ---

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

            // Store the new location in sessionStorage to persist it across reloads
            sessionStorage.setItem('userLat', lat);
            sessionStorage.setItem('userLng', lon);

            cityNameElement.innerText = location.display_name;
            await getLocationTiming(lat, lon); // This function is in geolocation.js
        } else {
            cityNameElement.innerText = translations[lang].city_not_found.replace('{city}', city);
        }
    } catch (error) {
        console.error('Error fetching location data:', error);
        cityNameElement.innerText = translations[lang].city_search_error;
    } finally {
        // --- Restore UI ---
        cityInput.disabled = false;
        searchButton.disabled = false;
        searchButton.classList.remove('loading');
    }
}

let lastCheckedDay = new Date().getDate(); // Keep track of the current day

function updateClock() {
    // Get the current time
    const now = new Date();
    const currentDay = now.getDate();

    // Check if the day has changed (e.g., it's past midnight)
    if (currentDay !== lastCheckedDay) {
        console.log("New day detected. Refreshing dates and prayer times.");
        lastCheckedDay = currentDay;

        // Refresh the Hijri and Gregorian dates
        updateDates();

        // Refresh prayer times using the stored location
        const lat = sessionStorage.getItem('userLat');
        const lon = sessionStorage.getItem('userLng');
        if (lat && lon) {
            getLocationTiming(parseFloat(lat), parseFloat(lon));
        }
    }

    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
  
    // Update the content of the specific span elements.
    document.getElementById('hours').innerText = String(hours).padStart(2, '0');
    document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
    document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
    document.getElementById('ampm').innerText = ampm;
}

function updateDates() {
    const now = new Date();
    document.getElementById("gregorian-date").innerText = now.toLocaleDateString('ar-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    const hijriDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { year: 'numeric', month: 'long', day: 'numeric' }).format(now);
    document.getElementById("hijri-date").innerText = hijriDate;
}

// Initialize and set intervals
updateClock();
updateDates();
setInterval(updateClock, 1000);

// Add event listener for the Enter key on the city input field
document.getElementById('city-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        updateLocation();
    }
});