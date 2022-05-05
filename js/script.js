//OpenWeather API Key
let apiKey = '9b9bc44cc70f3fd327b277e80a6e788b';

//Toggle sidebar
document.addEventListener('click', (e) => {
  if (e.target == document.querySelector('.menu')) {
    document.querySelector('.sidebar-nav').classList.toggle('hide');
  }
});


//Switch between Imperial and Metric
let switchUnits = document.querySelector('#toggle');
let units;
let tempSymbol;
let speedSymbol;
let unitToggle = () => {
  if (switchUnits.checked) {
    units = 'metric';
    tempSymbol = '<i class="wi wi-celsius unit"></i>';
    speedSymbol = 'm/s';
  } else {
    units = 'imperial';
    tempSymbol = '<i class="wi wi-fahrenheit unit"></i>';
    speedSymbol = 'mph';
  }
};

switchUnits.addEventListener('change', () => {
  unitToggle();
  getWeather();
});

//Refresh Data
document.addEventListener('click', (e) => {
  if (e.target == document.querySelector('.refresh')) {
    getWeather();
  }
});

//Search box setup
let autocomplete;
let searchLocation = () => {
  let input = document.querySelector('#search');
  let options = {
    types: ['(regions)'],
    fields: ['geometry.location', 'vicinity'],
  };
  autocomplete = new google.maps.places.Autocomplete(input, options);
  getCityGoogle();
};

let lat;
let lon;

//Use current location
let getCurrentLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      lat = position.coords.latitude;
      lon = position.coords.longitude;

      getCityBrowser();
    });
  } else {
    alert('geolocation not supported or denied');
  }
};

document.addEventListener('click', (e) => {
  if (e.target == document.querySelector('.location')) {
    getCurrentLocation();
  }
});

//Search for cities
let getCityBrowser = () => {
  fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
  )
    .then((res) => res.json())
    .then((city) => {
      document.querySelector('.normal-fc .city').innerHTML = city.locality;
      unitToggle();
      getWeather();
    });
};

let getCityGoogle = () => {
  google.maps.event.addListener(autocomplete, 'place_changed', () => {
    result = autocomplete.getPlace();
    lat = result.geometry.location.lat();
    lon = result.geometry.location.lng();
    document.querySelector('.normal-fc .city').innerHTML = result.vicinity;
    unitToggle();
    getWeather();
  });
};

//Get weather from One Call API
let getWeather = () => {
  fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=${units}&exclude=alerts,minutely&appid=${apiKey}`
  )
    .then((res) => res.json())
    .then((weather) => {
      let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      let months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];

      //Current
      let d = new Date();
      let now = new Date(weather.current.dt * 1000);
      document.querySelector('.date').innerHTML = `${days[now.getDay()]} - ${
        months[now.getMonth()]
      } ${now.getDate()}, ${now.getFullYear()}`;
      document.querySelector('.time').innerHTML = d.toLocaleTimeString([], {
        timeZone: weather.timezone,
        hour: 'numeric',
        minute: '2-digit',
      });
      document.querySelector('.normal-fc .temp').innerHTML = `${Math.round(
        weather.current.temp
      )}${tempSymbol}`;
      document.querySelector('.high-low .low').innerHTML = Math.round(weather.daily[0].temp.min);
      document.querySelector('.high-low .high').innerHTML = Math.round(weather.daily[0].temp.max);

      //Extra
      document.querySelector('.wind .text').innerHTML = `${Math.round(
        weather.current.wind_speed
      )} ${speedSymbol}`;
      if (weather.daily[0].rain) {
        document.querySelector('.precip .text').innerHTML = weather.daily[0].rain;
      } else {
        document.querySelector('.precip .text').innerHTML = '0';
      }
      document.querySelector('.humidity .text').innerHTML = weather.current.humidity;
      document.querySelector('.uv .text').innerHTML = weather.current.uvi;

      //Hourly
      let sunrise = new Date(weather.current.sunrise * 1000);
      let sunset = new Date(weather.current.sunset * 1000);
      document.querySelector('.rise-time').innerHTML = sunrise.toLocaleTimeString([], {
        timeZone: weather.timezone,
        hour: 'numeric',
        minute: '2-digit',
      });
      document.querySelector('.set-time').innerHTML = sunset.toLocaleTimeString([], {
        timeZone: weather.timezone,
        hour: 'numeric',
        minute: '2-digit',
      });
      let hourlyF = '';
      weather.hourly.forEach((hour) => {
        hourlyF += `
        <div class="hour">
          <p class = "time">${new Date(hour.dt * 1000).toLocaleTimeString([], {
            timeZone: weather.timezone,
            hour: 'numeric',
            hour12: 'true',
          })}</p>
          <div class="weather-icon"></div>
          <p class="temp">${Math.round(hour.temp)}</p>
        </div>`;
      });
      document.querySelector('.hour-fc .chart').innerHTML = hourlyF;

      //Tomorrow
      document.querySelector('.tomorrow .temp').innerHTML = `${Math.round(
        weather.daily[1].temp.day
      )}`;
      document.querySelector('.tomorrow .condition').innerHTML =
        weather.daily[1]['weather'][0]['main'];

      //7 Day
      let weeklyF = '';
      weather.daily.forEach((day) => {
        weeklyF += `
        <div class="day">
          <p class="weekday">${days[new Date(day.dt * 1000).getDay()]}</p>
          <div class="weather-icon"></div>
          <div class="high-low">
          <p class="low temp">${Math.round(day.temp.min)}</p>
          <p class="high temp">${Math.round(day.temp.max)}</p>
        </div>`;
      });
      document.querySelector('.week-fc .chart').innerHTML = weeklyF;
    });
};

window.addEventListener('load', searchLocation);

//Remove later mayhaps
window.addEventListener('load', getCurrentLocation());