async function updateLocation() {
    const cityInput = document.getElementById('city-input');
    const cityNameElement = document.getElementById('city-name');
    const searchButton = document.getElementById('search-button');
    const city = cityInput.value.trim();

    if (!city) {
        alert('الرجاء إدخال اسم المدينة');
        return;
    }

    // --- Start Loading State ---
    cityInput.disabled = true;
    searchButton.disabled = true;
    searchButton.classList.add('loading');
    cityNameElement.innerText = `... جاري البحث عن ${city}`;
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
            cityNameElement.innerText = `لم يتم العثور على مدينة باسم "${city}"`;
        }
    } catch (error) {
        console.error('Error fetching location data:', error);
        cityNameElement.innerText = 'حدث خطأ أثناء البحث عن المدينة';
    } finally {
        // --- Restore UI ---
        cityInput.disabled = false;
        searchButton.disabled = false;
        searchButton.classList.remove('loading');
    }
}

function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours || 12; // Convert hour '0' to '12'

    // Get elements
    const hoursElement = document.getElementById('clock-hours');
    const minutesElement = document.getElementById('clock-minutes');
    const secondsElement = document.getElementById('clock-seconds');
    const ampmElement = document.getElementById('clock-ampm');
    const colonElements = document.querySelectorAll('#clock .colon');

    // Update time parts if they exist
    if (hoursElement && minutesElement && secondsElement && ampmElement) {
        hoursElement.innerText = String(hours).padStart(2, '0');
        minutesElement.innerText = String(minutes).padStart(2, '0');
        secondsElement.innerText = String(seconds).padStart(2, '0');
        ampmElement.innerText = ampm;
    }

    // Blink the colons using opacity for a smooth fade effect
    const opacity = seconds % 2 === 0 ? 1 : 0;
    colonElements.forEach(colon => {
        colon.style.opacity = opacity;
    });
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