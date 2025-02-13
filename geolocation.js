// Check if geolocation is supported by the browser
if ("geolocation" in navigator) {
    // Prompt user for permission to access their location
    navigator.geolocation.getCurrentPosition(
      // Success callback function
      (position) => {
        // Get the user's latitude and longitude coordinates
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
  
        // Do something with the location data, e.g. display on a map
        console.log(`Latitude: ${lat}, longitude: ${lng}`);

        //Request API data
        getLocationTiming(lat,lng);
       
    },
      // Error callback function
      (error) => {
        // Handle errors, e.g. user denied location sharing permissions
        console.error("Error getting user location:", error);
        alert("You can Enter location manually")
        return timeString;
      }
    );
  } else {
    // Geolocation is not supported by the browser
    console.error("Geolocation is not supported by this browser.");
  }


 
  
//Request sunrise-sunset API

  // Make a GET request
  function getLocationTiming(lat, lon){
    const sunriseAPI = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&date=today&tzid=Africa/Khartoum`;
    //Debug
    console.log(sunriseAPI)
    fetch(sunriseAPI)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        return response.json();
      })
      .then(data =>{

        //Debug
        console.log("this is the response:")
        console.log(data);
        console.log("Sunrise: " + data.results.sunrise);
        console.log("Sunset: " + data.results.sunset);
        console.log("Fajr Azan: ", data.results.astronomical_twilight_begin)

        // fajrTimeFixed = data.results.astronomical_twilight_begin.slice(0,-2);
        // sunsetFixed = data.results.sunset.slice(0,-2);

        fajrTimeFixed = data.results.astronomical_twilight_begin;
        sunsetFixed = data.results.sunset;
        console.log(fajrTimeFixed + " Fixed")

        
        const realMidnight = calculateRealMidnight(fajrTimeFixed,sunsetFixed);
        const lastThirdStart = calculateLastThirdOfNight(fajrTimeFixed,sunsetFixed);

        console.log("Real Midnight Time:", realMidnight);
        console.log("Last Third Start Time:", lastThirdStart);

        renderData(data.results.sunrise,data.results.sunset,realMidnight,lastThirdStart);


      }

      )
      .catch(error => {
        console.error('Error:', error);
      });
  }

 // Calculate the real midnight time
  function calculateRealMidnight(twilightTime, sunsetTime) {
    // Helper function to convert 12-hour time to minutes since midnight
    function toMinutes(time) {
        const [timePart, modifier] = time.split(" ");
        let [hours, minutes, seconds] = timePart.split(":").map(Number);
        if (modifier === "PM" && hours !== 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;
        return hours * 60 + minutes + seconds / 60;
    }

    // Helper function to convert minutes since midnight to 12-hour time
    function to12HourTime(minutes) {
        let hours = Math.floor(minutes / 60) % 24;
        const mins = Math.floor(minutes % 60);
        const secs = Math.round((minutes % 1) * 60);
        const modifier = hours >= 12 ? "AM" : "PM"; // I reversed this to get true AM/PM
        if (hours > 12) hours -= 12;
        if (hours === 0) hours = 12;
        return `${hours}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")} ${modifier}`;
    }

    // Convert input times to minutes
    const twilightMinutes = toMinutes(twilightTime);
    const sunsetMinutes = toMinutes(sunsetTime);

    // Calculate the difference between twilight and sunset
    const difference = twilightMinutes - sunsetMinutes;

    // Add half of the difference to the sunset time
    const realMidnightMinutes = sunsetMinutes + difference / 2;

    // Convert back to 12-hour format
    return to12HourTime(realMidnightMinutes);
}


// Calculate the start of the last third of the night
function calculateLastThirdOfNight(sunsetTime, fajrTime) {
    // Helper function to convert 12-hour time to minutes since midnight
    function toMinutes(time) {
        const [timePart, modifier] = time.split(" ");
        let [hours, minutes, seconds] = timePart.split(":").map(Number);
        if (modifier === "PM" && hours !== 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;
        return hours * 60 + minutes + seconds / 60;
    }

    // Helper function to convert minutes since midnight to 12-hour time
    function to12HourTime(minutes) {
        let hours = Math.floor(minutes / 60) % 24;
        const mins = Math.floor(minutes % 60);
        const secs = Math.round((minutes % 1) * 60);
        const modifier = hours >= 12 ? "PM" : "AM";
        if (hours > 12) hours -= 12;
        if (hours === 0) hours = 12;
        return `${hours}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")} ${modifier}`;
    }

    // Convert input times to minutes
    const sunsetMinutes = toMinutes(sunsetTime);
    const fajrMinutes = toMinutes(fajrTime);

    // Calculate the total duration of the night
    const nightDuration = fajrMinutes - sunsetMinutes;

    // Calculate the start of the last third of the night
    const lastThirdStartMinutes = fajrMinutes - (nightDuration / 3);

    // Convert back to 12-hour format
    return to12HourTime(lastThirdStartMinutes);
}

// // Example usage
// const sunsetTime = "5:35:55 PM";
// const fajrTime = "4:45:00 AM";
// const lastThirdStart = calculateLastThirdOfNight(sunsetTime, fajrTime); //reverse parameters for true calculation
// console.log("بداية الثلث الأخير من الليل:", lastThirdStart);


//Render Data
function renderData(sunrise,sunset,midnight,lastThirdStart){
    //Render data to the DOM
    document.getElementById("sunrise").innerHTML = sunrise;
    document.getElementById("sunset").innerHTML = sunset;
    document.getElementById("midnight").innerHTML = midnight;
    document.getElementById("lastThirdStart").innerHTML = lastThirdStart;
}

