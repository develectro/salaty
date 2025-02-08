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
      }
    );
  } else {
    // Geolocation is not supported by the browser
    console.error("Geolocation is not supported by this browser.");
  }

  console.log("added");


 
  
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
      .then(data => {
        console.log("this is the response:")
        console.log(data);
        console.log("Sunrise: " + data.results.sunrise);
        console.log("Sunset: " + data.results.sunset);

      })
      .catch(error => {
        console.error('Error:', error);
      });
  }


  //Calculations of Midnight and last third of the night:
  
  function calculateActualMidnight(sunset, sunrise) {
    // Convert sunset and sunrise to Date objects
    const sunsetDate = new Date(`1970-01-01T${sunset}Z`);
    const sunriseDate = new Date(`1970-01-01T${sunrise}Z`);
  
    // Calculate the difference in milliseconds
    const diff = sunriseDate - sunsetDate;
  
    // Calculate the actual midnight
    const actualMidnightDate = new Date(sunsetDate.getTime() + diff / 2);
  
    // Format the actual midnight time
    const hours = actualMidnightDate.getUTCHours().toString().padStart(2, '0');
    const minutes = actualMidnightDate.getUTCMinutes().toString().padStart(2, '0');
    const seconds = actualMidnightDate.getUTCSeconds().toString().padStart(2, '0');
  
    return `${hours}:${minutes}:${seconds}`;
  }