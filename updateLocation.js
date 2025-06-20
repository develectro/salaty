function updateLocation() {
    const cityInput = document.getElementById('city-input');
    const cityNameElement = document.getElementById('city-name');
    const city = cityInput.value.trim();

    if (!city) {
        alert('الرجاء إدخال اسم المدينة');
        return;
    }

    cityNameElement.innerText = `... جاري البحث عن ${city}`;

    const geocodeAPI = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&accept-language=ar,en&limit=1`;

    fetch(geocodeAPI)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok for geocoding');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.length > 0) {
                const location = data[0];
                const lat = location.lat;
                const lon = location.lon;
                
                cityNameElement.innerText = location.display_name;
                getLocationTiming(lat, lon); // This function is in geolocation.js
            } else {
                cityNameElement.innerText = `لم يتم العثور على مدينة باسم "${city}"`;
            }
        })
        .catch(error => {
            console.error('Error fetching location data:', error);
            cityNameElement.innerText = 'حدث خطأ أثناء البحث عن المدينة';
        });
}

function updateClock() {
    const now = new Date();
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true, 
        numberingSystem: 'latn' 
    };
    const timeString = now.toLocaleTimeString('en-US', options); 
    document.getElementById("clock").innerText = timeString;
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