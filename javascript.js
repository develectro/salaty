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