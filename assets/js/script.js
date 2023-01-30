let searchedLocation, searchedLat, searchedLng;

let timeTableHtml = "";
let timeBlockClass = "";
let isCurrentHour = "";

let weatherNowHtml = "";
let weatherForcastHtml = "";


let currentHour = dayjs().hour();


let currentDayhtml = dayjs().format('dddd[, ]MMMM D');


let searchHistoryDataRaw = [];
var searchHistoryData = [];

let searchedLocationData = {};


//reset local storage for testing
//localStorage.removeItem ("search-history");


let input, options, autocomplete;

function initGoogleAutocomplete() {

  //https://maps.googleapis.com/maps/api/geocode/json?address=new%20york&key=AIzaSyAplY5us4aXATgl9RfT9VTs9SN8qh4Q-4I


  //option for search cities in United States and Canada
  options = {
    types: ['(cities)'],
    componentRestrictions: {country: ["us", "ca"]}
   };
  

  input = document.getElementById('search-input');


  autocomplete = new google.maps.places.Autocomplete(input, options);
    google.maps.event.addListener(autocomplete, 'place_changed', function () {
      let place = autocomplete.getPlace();


      if (place.geometry)
      {

        searchedLocation = place.name;
        searchedLat = place.geometry.location.lat();
        searchedLng = place.geometry.location.lng();

        let adrAddress = place.adr_address; 

        
        //"<span class="locality">Truckee</span>, <span class="region">CA</span> <span class="postal-code">96161</span>, <span class="country-name">USA</span>"
        //console.log (adrAddress);
        
      
        searchedLocationData.location = searchedLocation;
        searchedLocationData.region = strExtract (adrAddress, "class=\"region\">", "</span>");
        searchedLocationData.countryName = strExtract (adrAddress, "class=\"country-name\">", "</span>");
        searchedLocationData.lat = searchedLat;
        searchedLocationData.lng = searchedLng;


        console.log ("searchedLocationData", searchedLocationData);
        saveSearch (searchedLocationData);

        checkWeather (searchedLat, searchedLng);
      }
  });
}




$("#search-input").on("keyup", function(e) {
  if(e.keyCode == 13) { //press enter
    geocodeSearch("first-suggestion", "");
  }
});

function geocodeSearch(placeName, placeAddress) {
  
  if (placeName == "first-suggestion")
  {
    let $firstResult = $('.pac-item:first').children();
    
    placeName = $firstResult[1].textContent;
    placeAddress = $firstResult[2].textContent;
  }


  var searchTerm = placeName + " " + placeAddress;



  $("#search-input").val(searchTerm);



  let geocoder = new google.maps.Geocoder();
  geocoder.geocode({"address":searchTerm}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) 
      {
    console.log (results[0]);
        searchedLocation = placeName;
        searchedLat = results[0].geometry.location.lat();
        searchedLng = results[0].geometry.location.lng();
  

        //console.log (placeAddress)
        searchedLocationData.location = searchedLocation;
        searchedLocationData.region = placeAddress.substring (0, placeAddress.indexOf (",")).trim();
        searchedLocationData.countryName = placeAddress.substring (placeAddress.indexOf (",") + 1).trim();
        searchedLocationData.lat = searchedLat;
        searchedLocationData.lng = searchedLng;
  
        //remove focus on search input
        input.blur();

        saveSearch (searchedLocationData);
  
        checkWeather (searchedLat, searchedLng);
      }
  });
}




  //load plan data
  loadSearchedLocationData ();


  function renderSearchedLocation () {
    
    if (searchHistoryData)
    {
      let weatherSearchHistoryHtml = "";


      //console.log ("searchHistoryDataRaw", searchHistoryData.length)
      searchHistoryData.forEach (function (thisWeatherData) {

        

        let sdata = thisWeatherData.location + " " + thisWeatherData.region + ", " +  thisWeatherData.countryName;

        weatherSearchHistoryHtml += "<div class='weather-history-tab' location='" + thisWeatherData.location + "' lat='" + thisWeatherData.lat + "' lng='" + thisWeatherData.lng + "' sdata='" + sdata + "'><b>" + thisWeatherData.location + "</b> " + thisWeatherData.region + ", " +  thisWeatherData.countryName + " </div>";
      });
      

      $('#weather-search-history').html ("<br><br><br><br>Search History:<br><br>" + weatherSearchHistoryHtml);


      $( ".weather-history-tab" ).on("click", function() {
        

        document.getElementById('search-input').value = $(this).attr ("sdata");
      
        searchedLocation = $(this).attr ("location");

        checkWeather ($(this).attr ("lat"), $(this).attr ("lng"));

      });
    }

  }


  //load plan data function
  function loadSearchedLocationData () {

    searchHistoryDataRaw = localStorage.getItem("search-history");
    
    
    if (searchHistoryDataRaw)
    {
      searchHistoryData = JSON.parse(searchHistoryDataRaw);

      renderSearchedLocation ();
    }
  }




function strExtract (str, beginningStr, EndingStr) {

  let extractedStr = str.substring(str.indexOf (beginningStr) + beginningStr.length);

  extractedStr = extractedStr.substring(0, extractedStr.indexOf (EndingStr));

  return extractedStr;
}

function checkWeather (lat, lng) {

  //get open weather api 
  let openWeatherApiUrl = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lng + "&appid=55c6ad05fb90696b0befe8a67cb935d7";

  if (lat != undefined && lng != undefined)
  {
    fetch(openWeatherApiUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      //console.log('Fetch Response \n-------------');
      //console.log(data);
  
      weatherShow (data);
  
    });

  }



}  



function weatherShow (weatherDataRaw) {


  $("html, body").animate({ scrollTop: 0 }, 300);
  $("#weather-now-sec").show ();
  $("#weather-forcast-sec").show ();

  
  weatherNowHtml = "";
  weatherForcastHtml = "";

  let listCount = 0;
  let dateDiffBegin = null;


  weatherDataRaw.list.forEach (function (thisWeather) {


    let weatherDate = dayjs(thisWeather.dt * 1000);

    let weatherDateHour = weatherDate.format ("hA");

    let weatherDateNum = parseInt (weatherDate.format ("D"));
    let todayDateNum = parseInt (dayjs ().format ("D"));
    
    


    let dateDiff = weatherDateNum - todayDateNum;
    if (dateDiffBegin === null)
      dateDiffBegin = dateDiff;


    //console.log ("dateDiff:" + dateDiff, weatherDate.format ("M/DD/YYYY"));
    //filter the day that I want
    
    
    

    listCount++;

    //console.log ("test: " + dateDiff + "==" +  dateDiffBegin);
    if (dateDiff == dateDiffBegin) //today
    {
      if (listCount > 1)
        return;
    }
    else if (dateDiff <= 3 + dateDiffBegin)
    {
      
      
      if (weatherDateHour != "10AM")
        return;

    }
    else //fifth date
    {
      if (weatherDateHour != "10AM" && weatherDateHour != "10PM" )
        return;
    }

    
    let today = dayjs ().format ("M/DD/YYYY");
    
    //let dateHtml = weatherDate.format ("YYYY-MM-DD hA");
    //console.log(dateHtml);
    
    let tempF = Math.round (1.8 * (thisWeather.main.temp - 273) + 32, 2);  
    let windMph = Math.round (thisWeather.wind.speed * 2.2369, 2);
    let humidity = thisWeather.main.humidity;

    let weatherIcon = "<img class='weather-icon' src='http://openweathermap.org/img/wn/" + thisWeather.weather[0].icon + "@2x.png'> ";
    
    
    if (listCount == 1) //always use the first weather data from the array as the weatherNowHtml
    {
          
      weatherNowHtml = "<div id='weather-now-div'>\
        <div class='location-div'>" + searchedLocation + " (" + today + ")</div>\
        <div class='icon-div'>" + weatherIcon + thisWeather.weather[0].description + "</div>\
        <div class='info-div'>\
          <div class='temp-div'>Temp: " + tempF + "&#176;F</div>\
          <div class='wind-div'>Wind: " + windMph + "MPH</div>\
          <div class='humidity-div'>Humidity: " + humidity + "%</div>\
        </div>\
      </div>";


    }
    else if (dateDiff <= 3 + dateDiffBegin)
    {
      
      let forcastDate = weatherDate.format ("M/DD/YYYY");


      let weatherForcastDiv = "<div id='weather-forcast-div'>\
        <div class='date-div'>" + forcastDate + "</div>\
        <div class='icon-div'>" + weatherIcon + thisWeather.weather[0].description + "</div>\
        <div class='info-div'>\
          <div class='temp-div'>Temp: " + tempF + "&#176;F</div>\
          <div class='wind-div'>Wind: " + windMph + "MPH</div>\
          <div class='humidity-div'>Humidity: " + humidity + "%</div>\
        </div>\
      </div>";

      weatherForcastHtml += weatherForcastDiv;   

    }
    else //fifth date
    {
      if (weatherDateHour == "10AM")
      {
        var forcastDate = weatherDate.format ("M/DD/YYYY");
      }
      else
      {
        //since open weather only has 5 day of forcast, thus need to make up an extra day
        var forcastDate = dayjs((thisWeather.dt + 86400) * 1000).format ("M/DD/YYYY");
      }

      let weatherForcastDiv = "<div id='weather-forcast-div'>\
        <div class='date-div'>" + forcastDate + "</div>\
        <div class='icon-div'>" + weatherIcon + thisWeather.weather[0].description + "</div>\
        <div class='info-div'>\
          <div class='temp-div'>Temp: " + tempF + "&#176;F</div>\
          <div class='wind-div'>Wind: " + windMph + "MPH</div>\
          <div class='humidity-div'>Humidity: " + humidity + "%</div>\
        </div>\
      </div>";
  
      weatherForcastHtml += weatherForcastDiv;   

    }


    
  });

  $("#weather-now-sec").html (weatherNowHtml);


  $("#weather-forcast-sec").html ("<div class='title-div'>5-Day Forcast</div>" + weatherForcastHtml);
}


function saveSearch (thisSearchedLocationData) {


  Object.keys(searchHistoryData).forEach (function (key) {
    
    
    if (searchHistoryData[key] && searchedLocationData)
    {
      //console.log ("key", searchHistoryData[key].location + " == " + thisSearchedLocationData.location, key)

      if (searchHistoryData[key].location == thisSearchedLocationData.location)
      {     
        searchHistoryData.splice (key, 1);

        return;
      }
    }
  });




 

  
  //added to front of the array list
  console.log (searchHistoryData)
  //searchHistoryData.push (thisSearchedLocationData);

  console.log ("length:" + searchHistoryData.length)

  //must make a new copy of the object in order to prevent error
  const clone = Object.assign({}, thisSearchedLocationData); //structuredClone(thisSearchedLocationData);

  searchHistoryData.unshift (clone);

  if (searchHistoryData.length > 10) //only limit to 15 search history to be saved
  {
    searchHistoryData.pop ();
  }

  //save to local storage
  localStorage.setItem("search-history", JSON.stringify(searchHistoryData));

  renderSearchedLocation ();
}

