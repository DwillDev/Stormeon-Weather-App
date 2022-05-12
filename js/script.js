//OpenWeather API Key
let apiKey = '9b9bc44cc70f3fd327b277e80a6e788b';

//Toggle sidebar
document.addEventListener('click', (e) => {
  if (e.target == document.querySelector('.nav__icon--menu')) {
    document.querySelector('.main__nav').classList.toggle('hide');
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
    tempSymbol = '<i class="wi wi-celsius .current-weather__icon current-weather__icon--unit"></i>';
    speedSymbol = 'm/s';
  } else {
    units = 'imperial';
    tempSymbol =
      '<i class="wi wi-fahrenheit current-weather__icon current-weather__icon--unit"></i>';
    speedSymbol = 'mph';
  }
};

switchUnits.addEventListener('change', () => {
  unitToggle();
  getWeather();
});

//Refresh Data
document.addEventListener('click', (e) => {
  if (e.target == document.querySelector('.nav__icon--refresh')) {
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
  if (e.target == document.querySelector('.nav__icon--geolocation')) {
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
      document.querySelector('.current-weather__city').innerHTML = city.locality;
      unitToggle();
      getWeather();
    });
};

let getCityGoogle = () => {
  google.maps.event.addListener(autocomplete, 'place_changed', () => {
    result = autocomplete.getPlace();
    lat = result.geometry.location.lat();
    lon = result.geometry.location.lng();
    document.querySelector('.current-weather__city').innerHTML = result.vicinity;
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
      document.querySelector('.current-weather__date').innerHTML = `${days[now.getDay()]} - ${
        months[now.getMonth()]
      } ${now.getDate()}, ${now.getFullYear()}`;
      document.querySelector('.current-weather__time').innerHTML = d.toLocaleTimeString([], {
        timeZone: weather.timezone,
        hour: 'numeric',
        minute: '2-digit',
      });
      document.querySelector('.current-weather__temp').innerHTML = `${Math.round(
        weather.current.temp
      )}${tempSymbol}`;
      document.querySelector('.current-weather__low').innerHTML = Math.round(
        weather.daily[0].temp.min
      );
      document.querySelector('.current-weather__high').innerHTML = Math.round(
        weather.daily[0].temp.max
      );
      document.querySelector('.current-weather__icon--today').innerHTML =
      `<i class="wi wi-owm-${weather.current.weather[0].id}"></i>`;

      //Extra
      document.querySelector('.current-weather__text--wind').innerHTML = `${Math.round(
        weather.current.wind_speed
      )} ${speedSymbol}`;
      if (weather.daily[0].rain) {
        document.querySelector('.current-weather__text--rain').innerHTML = weather.daily[0].rain;
      } else {
        document.querySelector('.current-weather__text--rain').innerHTML = '0';
      }
      document.querySelector('.current-weather__text--humidity').innerHTML =
        weather.current.humidity;
      document.querySelector('.current-weather__text--uv').innerHTML = weather.current.uvi;

      //Hourly
      let sunrise = new Date(weather.current.sunrise * 1000);
      let sunset = new Date(weather.current.sunset * 1000);
      document.querySelector('.future-weather__rise-time').innerHTML = sunrise.toLocaleTimeString(
        [],
        {
          timeZone: weather.timezone,
          hour: 'numeric',
          minute: '2-digit',
        }
      );
      document.querySelector('.future-weather__set-time').innerHTML = sunset.toLocaleTimeString(
        [],
        {
          timeZone: weather.timezone,
          hour: 'numeric',
          minute: '2-digit',
        }
      );
      let hourlyF = '';
      for(i=0;i<24;i++){
        hourlyF +=`
        <div class="hour__time">
          <p class = "hour__num">${new Date(weather.hourly[i].dt * 1000).toLocaleTimeString([], {timeZone: weather.timezone,hour: 'numeric',hour12: 'true',})}</p>
          <div class="hour__icon">
            <i class="wi wi-owm-${weather.hourly[i]['weather'][0]['id']}"></i>
          </div>
          <p class="hour__temp">${Math.round(weather.hourly[i].temp)}</p>
        </div>
        `
      }
      document.querySelector('.future-weather__content--hour').innerHTML = hourlyF;

      //Tomorrow
      document.querySelector('.future-weather__temp').innerHTML = `${Math.round(
        weather.daily[1].temp.day
      )}`;
      document.querySelector('.future-weather__condition').innerHTML =
        weather.daily[1]['weather'][0]['main'];
      document.querySelector('.future-weather__icon--tomorrow').innerHTML =
        `<i class="wi wi-owm-${weather.daily[1]['weather'][0]['id']}"></i>`;

      //7 Day
      let weeklyF = '';
      weather.daily.forEach((day) => {
        weeklyF += `
        <div class="week__day">
          <p class="week__dayname">${days[new Date(day.dt * 1000).getDay()]}</p>
          <div class="week__icon"><i class="wi wi-owm-${day.weather[0].id}"></i></div>
          <div class="week__high-low">
          <p class="week__low">${Math.round(day.temp.min)}</p>
          <p class="week__high">${Math.round(day.temp.max)}</p>
          </div>
        </div>`;
      });
      document.querySelector('.future-weather__content--week').innerHTML = weeklyF;
    });
};

window.addEventListener('load', searchLocation);

//Remove later mayhaps
window.addEventListener('load', getCurrentLocation());
