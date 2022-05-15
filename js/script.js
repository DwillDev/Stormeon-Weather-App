//OpenWeather API Key
let apiKey = '9b9bc44cc70f3fd327b277e80a6e788b';

//Toggle sidebar
document.addEventListener('click', (e) => {
  if (e.target == document.querySelector('.headnav__icon--menu')) {
    document.querySelector('.nav__dropnav').classList.toggle('nav-hide');
    fixScreenNav();
  }
});

//Toggle fixed state on nav and splash screen

let fixScreenNav = () => {
  if (!document.querySelector('.nav__dropnav').classList.contains('nav-hide')) {
    document.querySelector('body').style.overflow = 'hidden';
    document.querySelector('.headnav__icon--menu').style.color = 'white';
  } else {
    document.querySelector('body').style.overflow = 'unset';
    document.querySelector('.headnav__icon--menu').style.color = 'unset';
  }
};

let fixScreenSplash = () => {
  if (!document.querySelector('.splash').classList.contains('hide')) {
    document.querySelector('body').style.overflow = 'hidden';
  }
};

//Hide splash screen
let hideSplash = () => {
  if (!document.querySelector('.splash').classList.contains('hide')) {
    document.querySelector('.splash').classList.add('hide');
    document.querySelector('body').style.overflow = 'unset';
  }
};

//Reset
let reset = () => {
  document.querySelector('.headnav__icon--menu').style.color = 'unset';
  document.querySelector('body').style.overflow = 'unset';
  document.querySelector('.dropnav').classList.toggle('nav-hide');
  document.querySelector('.search-form__input').value = '';
};

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
  if (e.target == document.querySelector('.headnav__icon--refresh')) {
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

document.querySelector('.search-form').addEventListener('submit', (e) => {
  e.preventDefault();
  reset();
});

let lat;
let lon;

//Use current location
let getCurrentLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      lat = position.coords.latitude;
      lon = position.coords.longitude;
      getCityBrowser();
      hideSplash();
    });
  } else {
    alert('geolocation not supported or denied');
  }
};

document.addEventListener('click', (e) => {
  if (e.target == document.querySelector('.headnav__icon--geolocation')) {
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
    hideSplash();
    reset();
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
      document.querySelector(
        '.current-weather__icon--today'
      ).innerHTML = `<i class="wi wi-owm-${weather.current.weather[0].id}"></i>`;

      //Extra
      for (i = 0; i < document.querySelectorAll('.extra').length; i++) {
        document.querySelectorAll('.current-weather__text--wind')[i].innerHTML = `${Math.round(
          weather.current.wind_speed
        )} ${speedSymbol}`;

        let precip = '';
        if (weather.daily[0].rain) {
          precip += ` <i class="current-weather__icon current-weather__icon--precip wi wi-raindrop"></i>             
            <p class="current-weather__text current-weather__text--precip">${weather.daily[0].rain} mm</p>`;
          document.querySelectorAll('.current-weather__precip')[i].innerHTML = precip;
        } else if (weather.daily[0].snow || weather.daily[0].snow || weather.daily[0].rain) {
          precip += ` <i class="current-weather__icon current-weather__icon--precip wi wi-snow"></i>             
            <p class="current-weather__text current-weather__text--precip">${weather.daily[0].snow} mm</p>`;
          document.querySelectorAll('.current-weather__precip')[i].innerHTML = precip;
        } else {
          precip += ` <i class="current-weather__icon current-weather__icon--precip wi wi-raindrop"></i>             
          <p class="current-weather__text current-weather__text--precip">0 mm</p>`;
          document.querySelectorAll('.current-weather__precip')[i].innerHTML = precip;
        }

        document.querySelectorAll('.current-weather__text--humidity')[
          i
        ].innerHTML = `${weather.current.humidity}%`;
        document.querySelectorAll('.current-weather__text--uv')[i].innerHTML = weather.current.uvi;
      }

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
      for (i = 0; i < 24; i++) {
        hourlyF += `
        <div class="hour__time">
          <p class = "hour__num">${new Date(weather.hourly[i].dt * 1000).toLocaleTimeString([], {
            timeZone: weather.timezone,
            hour: 'numeric',
            hour12: 'true',
          })}</p>
          <div class="hour__icon">
            <i class="wi wi-owm-${weather.hourly[i]['weather'][0]['id']}"></i>
          </div>
          <p class="hour__temp">${Math.round(weather.hourly[i].temp)}</p>
        </div>
        `;
      }
      document.querySelector('.future-weather__content--hour').innerHTML = hourlyF;

      //Tomorrow
      document.querySelector('.future-weather__temp').innerHTML = `${Math.round(
        weather.daily[1].temp.day
      )}`;
      document.querySelector('.future-weather__condition').innerHTML =
        weather.daily[1]['weather'][0]['main'];
      document.querySelector(
        '.future-weather__icon--tomorrow'
      ).innerHTML = `<i class="wi wi-owm-${weather.daily[1]['weather'][0]['id']}"></i>`;

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

      //Dynamic theme switching
      let prevClass = document.querySelector('body').classList[0];
      let eon;

      switch (weather.current.weather[0].main) {
        case 'Thunderstorm':
          document.querySelector('.wrapper').classList.replace(prevClass, 'jolteon');
          document.querySelector('.pokemon__type').src = './img/Pokémon_Electric_Type_Icon.svg';
          document.querySelector('.pokemon__image').src = './img/jolteon-3d.png';
          prevClass = document.querySelector('body').classList[0];
          eon = 'Jolteon';
          break;
        case 'Rain':
        case 'Drizzle':
        case 'Mist':
          document.querySelector('body').classList.replace(prevClass, 'vaporeon');
          document.querySelector('.pokemon__type').src = './img/Pokémon_Water_Type_Icon.svg';
          document.querySelector('.pokemon__image').src = './img/vaporeon-3d.png';
          prevClass = document.querySelector('body').classList[0];
          eon = 'Vaporeon';
          break;
        case 'Snow':
          document.querySelector('body').classList.replace(prevClass, 'glaceon');
          document.querySelector('.pokemon__type').src = './img/Pokémon_Ice_Type_Icon.svg';
          document.querySelector('.pokemon__image').src = './img/glaceon-3d.png';
          prevClass = document.querySelector('body').classList[0];
          eon = 'Glaceon';
          break;
        case 'Clear':
          document.querySelector('body').classList.replace(prevClass, 'leafeon');
          document.querySelector('.pokemon__type').src = './img/Pokémon_Grass_Type_Icon.svg';
          document.querySelector('.pokemon__image').src = './img/leafeon-3d.png';
          prevClass = document.querySelector('body').classList[0];
          eon = 'Leafeon';
          break;
        case 'Clouds':
        case 'Fog':
        case 'Haze':
          document.querySelector('body').classList.replace(prevClass, 'umbreon');
          document.querySelector('.pokemon__type').src = "./img/Pokémon_Dark_Type_Icon.svg";
          document.querySelector('.pokemon__image').src = "./img/umbreon-3d.png";
          prevClass = document.querySelector('body').classList[0];
          eon = 'Umbreon';
          break;
        case 'Smoke':
        case 'Ash':
          document.querySelector('body').classList.replace(prevClass, 'flareon');
          document.querySelector('.pokemon__type').src = './img/Pokémon_Fire_Type_Icon.svg';
          document.querySelector('.pokemon__image').src = './img/flareon-3d.png';
          prevClass = document.querySelector('body').classList[0];
          eon = 'Flareon';
          break;
        default:
          document.querySelector('body').classList.replace(prevClass, 'espeon');
          document.querySelector('.pokemon__type').src = './img/Pokémon_Psychic_Type_Icon.svg';
          document.querySelector('.pokemon__image').src = './img/espeon-3d.png';
          prevClass = document.querySelector('body').classList[0];
          eon = 'espeon';
          break;
      }
      document.querySelector(
        '.pokemon__text'
      ).innerHTML = `${weather.current.weather[0].main} - Today's weather is perfect for your ${eon}!`;
    });
};

window.addEventListener('load', () => {
  searchLocation();
  getCurrentLocation();
  fixScreenSplash();
});
