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
  
setInterval(updateClock, 1000);
updateClock();
function updateDates() {
    const now = new Date();
    document.getElementById("gregorian-date").innerText = now.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
    
    const hijriDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { year: 'numeric', month: 'long', day: 'numeric' }).format(now);
    document.getElementById("hijri-date").innerText = hijriDate;
}

setInterval(updateClock, 1000);
updateClock();
updateDates();


const urlParams = new URLSearchParams(window.location.search);
        const city = urlParams.get('city') || 'مدينتك';
        document.getElementById('city-name').innerText = city;

        const prayerTimes = {
            fajr: "05:00 AM",
            sunrise: "06:30 AM",
            dhuhr: "12:00 PM",
            asr: "03:30 PM",
            maghrib: "06:00 PM",
            isha: "08:00 PM",
            sunset: "06:10 PM",
            midnight: "12:00 AM",
            lastThird: "03:00 AM"
        };

        document.getElementById("fajr-time").innerText = prayerTimes.fajr;
        document.getElementById("sunrise-time").innerText = prayerTimes.sunrise;
        document.getElementById("dhuhr-time").innerText = prayerTimes.dhuhr;
        document.getElementById("asr-time").innerText = prayerTimes.asr;
        document.getElementById("maghrib-time").innerText = prayerTimes.maghrib;
        document.getElementById("isha-time").innerText = prayerTimes.isha;
        document.getElementById("sunset-time").innerText = prayerTimes.sunset;
        document.getElementById("midnight-time").innerText = prayerTimes.midnight;
        document.getElementById("last-third-time").innerText = prayerTimes.lastThird;