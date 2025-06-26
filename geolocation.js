window.prayerTimes = {}; // To store times globally

function initializeLocation() {
    const storedLat = sessionStorage.getItem('userLat');
    const storedLng = sessionStorage.getItem('userLng');
    const searchButton = document.getElementById('search-button');
    const cityInput = document.getElementById('city-input');

    // This function will be async to handle all API calls
    const run = async () => {
        // Disable controls during initial load
        if (searchButton) searchButton.disabled = true;
        if (cityInput) cityInput.disabled = true;

        try {
            if (storedLat && storedLng) {
                console.log("Using stored location from sessionStorage.");
                const lat = parseFloat(storedLat);
                const lng = parseFloat(storedLng);
                await Promise.all([getLocationTiming(lat, lng), getCityName(lat, lng)]);
            } else {
                console.log("Requesting new location.");
                if ("geolocation" in navigator) {
                    const position = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
                    });

                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    console.log(`New location obtained: Latitude: ${lat}, longitude: ${lng}`);

                    sessionStorage.setItem('userLat', lat);
                    sessionStorage.setItem('userLng', lng);

                    await Promise.all([getLocationTiming(lat, lng), getCityName(lat, lng)]);
                } else {
                    console.error("Geolocation is not supported by this browser.");
                    alert("Geolocation is not supported by this browser. Please enter a location manually.");
                }
            }
        } catch (error) {
            console.error("Error during initial location fetch:", error);
            const cityNameElement = document.getElementById('city-name');
            if (cityNameElement) {
                cityNameElement.innerText = "Could not get location. Please search manually.";
            }
        } finally {
            // Re-enable controls after all initial loading is done
            if (searchButton) searchButton.disabled = false;
            if (cityInput) cityInput.disabled = false;
        }
    };

    run();
}

// Run the initialization function when the script loads
initializeLocation();

//Request sunrise-sunset API

// Make a GET request
async function getLocationTiming(lat, lon) {
    // Set loading state on time buttons
    const timeButtonIds = ['sunrise', 'sunset', 'midnight', 'lastThirdStart'];
    const timeButtons = timeButtonIds.map(id => document.getElementById(id)).filter(Boolean);

    // Add loading class to show spinner and maintain size
    timeButtons.forEach(btn => btn.classList.add('loading'));

    // --- Parallel API Calls ---

    // Promise to get the timezone, with a fallback to the browser's timezone.
    const timezonePromise = fetch(`https://timeapi.io/api/TimeZone/coordinate?latitude=${lat}&longitude=${lon}`)
        .then(res => {
            if (!res.ok) throw new Error('Timezone API request failed.');
            return res.json();
        })
        .then(data => {
            if (!data.timeZone) throw new Error('Timezone identifier not found in API response.');
            console.log(`Timezone found for ${lat},${lon}: ${data.timeZone}`);
            return data.timeZone;
        })
        .catch(error => {
            console.warn(`Could not fetch timezone for coordinates. Falling back to browser's timezone. Error: ${error.message}`);
            return Intl.DateTimeFormat().resolvedOptions().timeZone;
        });

    // Promise to get sunrise/sunset times in ISO format (UTC).
    // Using formatted=0 returns ISO 8601 strings, which are more reliable to parse.
    const sunriseUTCPromise = fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&date=today&formatted=0`)
        .then(res => {
            if (!res.ok) throw new Error('Network response was not ok for sunrise-sunset API');
            return res.json();
        })
        .then(data => {
            if (data.status !== 'OK') throw new Error(`Sunrise-sunset API returned status: ${data.status}`);
            return data.results;
        });

    try {
        // Wait for both promises to resolve.
        const [locationTimezone, utcTimes] = await Promise.all([timezonePromise, sunriseUTCPromise]);

        // Helper function to convert ISO UTC times to a local 12-hour time string.
        const convertToLocalTime = (isoString) => {
            const date = new Date(isoString);
            const options = {
                hour: 'numeric',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
                timeZone: locationTimezone,
            };
            // Use 'en-US' locale to ensure the AM/PM format required by your time calculation utilities.
            return new Intl.DateTimeFormat('en-US', options).format(date);
        };

        const sunrise = convertToLocalTime(utcTimes.sunrise);
        const sunset = convertToLocalTime(utcTimes.sunset);
        const astronomical_twilight_begin = convertToLocalTime(utcTimes.astronomical_twilight_begin);

        const realMidnight = calculateRealMidnight(astronomical_twilight_begin, sunset);
        const lastThirdStart = calculateLastThirdOfNight(sunset, astronomical_twilight_begin);

        window.prayerTimes = { sunrise, sunset, midnight: realMidnight, lastThirdStart };

        renderData(sunrise, sunset, realMidnight, lastThirdStart);
    } catch (error) {
        console.error('Error fetching or processing sunrise-sunset data:', error);
        timeButtons.forEach(btn => {
            btn.innerText = 'Error';
        });
    } finally {
        // Always remove loading spinner
        timeButtons.forEach(btn => btn.classList.remove('loading'));
    }
}

//Render Data
function renderData(sunrise, sunset, midnight, lastThirdStart) {
    const lang = document.documentElement.lang || 'ar';
    const labels = translations[lang];

    document.getElementById("sunrise").innerText = `${sunrise} : ${labels.sunrise}`;
    document.getElementById("sunset").innerText = `${sunset} : ${labels.sunset}`;
    document.getElementById("midnight").innerText = `${midnight} : ${labels.midnight}`;
    document.getElementById("lastThirdStart").innerText = `${lastThirdStart} : ${labels.last_third}`;
}

async function getCityName(lat, lon) {
    const reverseGeocodeAPI = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=ar,en`;
    const cityNameElement = document.getElementById('city-name');

    try {
        const response = await fetch(reverseGeocodeAPI);
        if (!response.ok) {
            throw new Error('Network response was not ok for reverse geocoding');
        }
        const data = await response.json();
        console.log("Reverse geocoding data:", data);
        const city = data.address.city || data.address.town || data.address.village || "Unknown Location";
        const country = data.address.country || "";
        if (cityNameElement) {
            cityNameElement.innerText = `${city}, ${country}`;
        }
    } catch (error) {
        console.error('Error fetching city name:', error);
        if (cityNameElement) {
            cityNameElement.innerText = "Could not determine city name";
        }
    }
}
