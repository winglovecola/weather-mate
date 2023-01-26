$(function () {

  let timeTableHtml = "";
  let timeBlockClass = "";
  let isCurrentHour = "";



  let currentHour = dayjs().hour();


  let currentDayhtml = dayjs().format('dddd[, ]MMMM D');
  
  let searchedLocation, searchedLat, searchedLng;


  //https://maps.googleapis.com/maps/api/geocode/json?address=new%20york&key=AIzaSyAplY5us4aXATgl9RfT9VTs9SN8qh4Q-4I



  let searchHistoryDataRaw = [];
  let searchHistoryData = [];

  
  //load plan data
  loadPlanData ();


  //load plan data function
  function loadPlanData () {

    planDataRaw = localStorage.getItem("planData");

    
    if (planDataRaw)
    {
      planData = JSON.parse( planDataRaw );

    }
  }


  //save plan data function
  function savePlan () {

    plannerData = {};
    
    $('#planner .description').each(function () {
      
      //console.log ($(this).parent ().attr ('id'));
      //console.log ($(this).val ());
      



      let hourId = $(this).parent ().attr ('id');

      if ($(this).val () != "") //check if textarea is not empty
      {
        plannerData[hourId] = $(this).val ();
      }
      
    });
    


    //save to local storage in browser
    localStorage.setItem("planData", JSON.stringify(plannerData));
    $('#tips').html ("Plans has been saved");



    setTimeout(function() { 
      $('#tips').html ("");
  }, 2000);
    
  }
});



function initGoogleAutocomplete() {
  //option for search cities in United States and Canada
  let options = {
    types: ['(cities)'],
    componentRestrictions: {country: ["us", "ca"]}
   };
  

  let input = document.getElementById('search-place');
  let autocomplete = new google.maps.places.Autocomplete(input, options);
    google.maps.event.addListener(autocomplete, 'place_changed', function () {
      let place = autocomplete.getPlace();

      searchedLocation = place.name;
      searchedLat = place.geometry.location.lat();
      searchedLng = place.geometry.location.lng();

    });
}

function checkWeather () {

  //get open weather api 
  let openWeatherApiUrl = "https://api.openweathermap.org/data/2.5/forecast?lat=" + searchedLat + "&lon=" + searchedLng + "&appid=55c6ad05fb90696b0befe8a67cb935d7";

  fetch(openWeatherApiUrl)
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    console.log('Fetch Response \n-------------');
    console.log(data);

    weatherShow (data);
    saveSearch ();

  });

}

function weatherShow (weatherDataRaw) {
  let html = "";

  weatherDataRaw.list.forEach (function (thisWeather) {


    let weatherDate = dayjs(thisWeather.dt * 1000);

    let weatherDateHour = weatherDate.format ("hA");

    let weatherDateNum = parseInt (weatherDate.format ("D"));
    let todayDateNum = parseInt (dayjs ().format ("D"));
    

    let dateDiff = weatherDateNum - todayDateNum;


    //filter the day that I want
    if (dateDiff == 0) //today
    {
      if (weatherDateHour != "10AM")
        return;

      let today = dayjs ().format ("M-DD-YYYY");
    
      //let dateHtml = weatherDate.format ("YYYY-MM-DD hA");
      //console.log(dateHtml);
      
      let tempF = Math.round (1.8 * (thisWeather.main.temp - 273) + 32, 2);  
      let windMph = Math.round (thisWeather.wind.speed * 2.2369, 2);
      let humidity = thisWeather.main.humidity;

      let weatherNowDiv = "<div><div>" + searchedLocation + " (" + today + ") </div><div>Temp: " + tempF + "&#176;F</div><div>Wind: " + windMph + "MPH</div><div>Humidity: " + humidity + "%</div></div>";

      $("#weather-now-sec").html (weatherNowDiv);
    }
    else if (dateDiff <= 3)
    {
      if (weatherDateHour != "10AM")
        return;

    }
    else //fifth date
    {
      if (weatherDateHour != "10AM" && weatherDateHour != "10PM" )
        return;
    }

    


  });
}


function saveSearch () {


  searchHistoryData.find((obj, key) => {
    if (obj.location == thisLocation) {
        console.log ("key: " + key)

        //remove search from the list if already exist
        searchHistoryData.splice(key, 1);
    }
    
  });

  //added to front of the array list
  searchHistoryData.unshift ({location: searchedLocation, lat: searchedLat, lng, searchedLng});
    

  //save to local storage
  localStorage.setItem("searchHistory", JSON.stringify(plannerData));
}

