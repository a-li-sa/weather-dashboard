$(document).ready(function() {
// make the html elements
  // today's date under the city name
  $('#today-date').text(`${moment().format('dddd, l')}`);
  // table for the hourly forecast 
  for (let i = 0; i < 48; i++) {
    let $hour = $('<th>').append($('<span>').attr('id', `hour-${i}`));
    $('#hourly-hour').append($hour);
    let $hourTemp = $('<td>').append($('<span>').attr('id', `hour-${i}-temp`));
    $('#hourly-temp').append($hourTemp);
    let $hourFeels = $('<td>').append($('<span>').attr('id', `hour-${i}-feels`));
    $('#hourly-feels').append($hourFeels);
    let $hourMain = $('<td>').append($('<span>').attr('id', `hour-${i}-main`));
    $('#hourly-main').append($hourMain);
  }
  // 5 cards, 1 for each day for the 5 day forecast
  for (let i = 1; i < 6; i++) {
    let $div = $('<div>');
    let $innerDiv = $('<div>').addClass('uk-card uk-card-default uk-card-small');
    let $h4 = $('<h4>').addClass('uk-card-title uk-text-center uk-text-light uk-padding uk-padding-remove-bottom').text(moment().add(i, 'day').format('dddd, l'));
    let $img = $('<img>').attr('alt', 'weather icon').attr('id', 'icon-' + i);
    let $pDescr = $('<p>').addClass('uk-text-uppercase uk-text-small').attr('id', 'descr-' + i);
    let $table = $('<table>').addClass('uk-table uk-text-center');
    let $trTemp = $('<tr>').append($('<th>').text('High / Low').addClass('uk-text-center uk-padding-remove-right'), ($('<th>').text('Humidity').addClass('uk-text-center')));
    let $trHumidity = $('<tr>').append(($('<td>').addClass('uk-text-center uk-padding-remove-right').append($('<span>').attr('id', 'high-' + i), ` / `, $('<span>').attr('id', 'low-' + i),)), ($('<td>').attr('id', 'humidity-' + i)));
    $div.append($innerDiv.append($h4.append('<br>', $pDescr, $img), $table.append($trTemp, $trHumidity)));
    $('.uk-grid-match').append($div);
  }
// for local storage
  //array to be saved to local storage
  let cities = [];
  function storeCities() {
    localStorage.setItem("cities", JSON.stringify(cities));
  }
  function renderCityList() {
    $("#view-city-cards").empty();
    for (let i = 0; i < cities.length; i++) {
      let $d = $("<div>").addClass("uk-card-header").attr("data-index", i).attr("id", "city-" + i);
      let $a = $("<a>").attr("href", "#target").attr("uk-scroll", true).addClass("uk-button uk-button-text city-link").text(cities[i]);
      let $b = $("<button>").addClass("uk-button uk-button-text uk-float-right trash").attr("uk-icon", "close");
      $d.append($a, $b);
      $("#view-city-cards").append($d);
    }
  }
  function init() {
    if (localStorage.getItem("cities")) {
      const savedCities = JSON.parse(localStorage.getItem("cities"))
      cities.push(...savedCities);
    } else {
      let defaultCities = ["austin", "chicago", "new york", "orlando", "san francisco", "seattle", "denver", "atlanta"];
      cities.push(...defaultCities);
    }
    renderCityList();
  }
  // when this function is called, the city list will be rendered from array (from local storage or the default list)
  init();
// render a new city to the list using the search input
  function addToList (event) {
    event.preventDefault();
    let city = $("#city-input").val().trim().toLowerCase();
    // add city to the beginning of the array
    cities.unshift(city);
    // check if city is already on the list
    findDuplicates(cities);
    if (city === '') {
      // if input is empty remove input from cities array
      return cities.shift();
    } else if ((findDuplicates(cities) === '') && (city !== '')) {
      // if the input is not already in the array and it is not an empty string, render to list and store in local storage
      $("#city-input").val("");
      renderCityList();
      storeCities();
      $('#city-0').children().first()[0].click();
    } else {
      // if input is already on the list, remove from the cities array and show the city on the page
      cities.shift();
      $("#city-input").val("");
      for (let i = 0; i < cities.length; i++) {
        if (cities[i] === city) {
          $(`#city-${i}`).children().first()[0].click();
        }
      }
    }
  };
  // call this to find duplicates in the cities array
  let findDuplicates = (arr) => {
    let sorted_arr = arr.slice().sort();
    let results = '';
    for (let i = 0; i < sorted_arr.length - 1; i++) {
      if (sorted_arr[i + 1] == sorted_arr[i]) {
        results += (sorted_arr[i]);
      }
    }
    return results;
  }
  // when search icon button is pressed, call the addToList function
  $("#add-city").on("click", addToList);
  // when the return key is pressed, do the above action
  $("#city-input").bind('keypress', function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      $("#add-city").click();
    }
  });
// click the close button to remove the city from the list
  $(document).on("click", ".trash", function(event) {
    const index = event.target.parentElement.parentElement.getAttribute("data-index");
    cities.splice(index, 1);
    storeCities();
    renderCityList();
  });
// initialize windSpeed variable,
  let windSpeed;
// on the list, click the city name to display weather info
  $(document).on("click", ".city-link", displayInfo);
  function displayInfo(event) {
    event.preventDefault();
    $('#change-unit-btn').text('Metric: °C, m/s');
    const cityName = event.target.parentElement.textContent;
    let tempUnit = "imperial";
    let APIKey = "166a433c57516f51dfab1f7edaed8413";
    $.ajax({
        url: "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=" + tempUnit + "&set=unix&appid=" + APIKey,
        method: "GET"
    }).then(function(response) {
    // display the city name and country
      $('#current-city').text(`${response.name}, ${response.sys.country}`)
      let lat = response.coord.lat;
      let lon = response.coord.lon;
    // use lat and lon to access onecall api
      $.ajax({
        url: `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=${tempUnit}&appid=${APIKey}`,
        method: "GET"
      }).then(function(response) {
        $('#current-temp').addClass('units').text(`${response.current.temp.toFixed(0)}°F`);
        $('.current-description').html(response.current.weather[0].description);
        $('#today-icon').attr('src', `https://openweathermap.org/img/wn/${response.current.weather[0].icon}@2x.png`)
        $('#morning').addClass('units').text(`${response.daily[0].temp.morn.toFixed(0)}°F`);
        $('#afternoon').addClass('units').text(`${response.daily[0].temp.day.toFixed(0)}°F`);
        $('#evening').addClass('units').text(`${response.daily[0].temp.eve.toFixed(0)}°F`);
        $('#night').addClass('units').text(`${response.daily[0].temp.night.toFixed(0)}°F`);
        $('#today-humidity').text(`${response.current.humidity}%`);
      // convert degrees to direction
        function degToCompass(num) {
          let val = Math.floor((num / 22.5) + 0.5);
          let arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
          return arr[(val % 16)];
        }
        let windDirection = degToCompass(response.current.wind_deg);
        $('#today-wind').text(`${response.current.wind_speed.toFixed(1)} mph`);
      // assign value to windSpeed variable, which will be used to convert from mph to m/s 
        windSpeed = response.current.wind_speed;
        $('#wind-direction').text(` ${windDirection}`);
      // green, yellow, or red alerts for the uv index
        $('#today-uv').text(response.current.uvi);
        if (response.current.uvi < 3) {
          $('#today-uv').attr('class', 'uk-alert-success');
        } else if (response.current.uvi >= 3 && response.current.uvi < 8) {
          $('#today-uv').attr('class', 'uk-alert-warning');
        } else {
          $('#today-uv').attr('class','uk-alert-danger');
        }
      // information for the 5 day forecast
        for (let i = 1; i < 6; i++) {
          $(`#descr-${i}`).text(response.daily[i].weather[0].description)
          $(`#icon-${i}`).attr("src", `https://openweathermap.org/img/wn/${response.daily[i].weather[0].icon}@2x.png`);
          $(`#high-${i}`).addClass('units').text(`${response.daily[i].temp.max.toFixed(0)}°F`);
          $(`#low-${i}`).addClass('units').text(`${response.daily[i].temp.min.toFixed(0)}°F`);
          $(`#humidity-${i}`).text(`${response.daily[i].humidity}%`);
        }
      // temperatures for the hourly forecast
        for (let i = 0; i < 48; i++) {
          $(`#hour-${i}-temp`).addClass('units').text(`${response.hourly[i].temp.toFixed(0)}°F`);
          $(`#hour-${i}-feels`).addClass('units').text(`${response.hourly[i].feels_like.toFixed(0)}°F`);
          $(`#hour-${i}-main`).text(`${response.hourly[i].weather[0].main}`);
        }
      });
    // use lat and lon to access geonames api
      $.ajax({
        url: `https://secure.geonames.org/timezoneJSON?lat=${lat.toFixed(2)}&lng=${lon.toFixed(2)}&username=zigzagpoon`,
        method: "GET"
      }).then(function(response) {
      // hours for hourly forecast
        for (let i = 0; i < 48; i++) {
          $(`#hour-${i}`).text(`${(moment.tz(response.time, response.timezoneId).add(i, 'hours').format('hA'))}`);
        // display the date at midnight
          if (moment.tz(response.time, response.timezoneId).add(i, 'hours').format('hA') === '12AM') {
            $(`#hour-${i}`).prepend(`${(moment.tz(response.time, response.timezoneId).add(i, 'hours').format('M/D'))} `);
          }
          $(`#hour-${i}`).parent().addClass('uk-text-right');
        }
        $('#current-time').html(`${(moment.tz(response.time, response.timezoneId)).format('LLLL')}`);
        $('#sunrise').text((moment.tz(response.sunrise, response.timezoneId)).format('LT'));
        $('#sunset').text((moment.tz(response.sunset, response.timezoneId)).format('LT'));
      }); 
    });
  };
// when the page loads, show the first city on the list
  $('#city-0').children().first().click();
// convert from imperial to metric
  $('#change-unit-btn').click(function() {
    if ($(this).text() === 'Metric: °C, m/s') {
      $(this).text('Imperial: °F, mph');
    } else {
      $(this).text('Metric: °C, m/s');
    }
    $.each(Array.from($('.units')), function(index, element) {
      if (element.textContent.includes('°F')) {
        let fahrenheit = parseInt(element.textContent.substring().substring());
        let celsius = (fahrenheit - 32) * 5 / 9;
        element.textContent = `${(celsius).toFixed(0)}°C`;
      } else {
        let celsius = parseInt(element.textContent.substring().substring());
        let fahrenheit = celsius * 9 / 5 + 32;
        element.textContent = `${(fahrenheit).toFixed(0)}°F`;
      }
    })
    if ($('#today-wind').text().includes('mph')) {
      let mph = windSpeed;
      let ms = mph * 5280 * 12 * 2.54 / 100 / 60 / 60;
      $('#today-wind').text(`${ms.toFixed(1)} m/s`);
      windSpeed = ms;
    } else {
      let ms = windSpeed;
      let mph = ms * 60 * 60 * 100 / 2.54 / 12 / 5280;
      console.log(ms, mph)
      $('#today-wind').text(`${mph.toFixed(1)} mph`);
      windSpeed = mph;
    }
  });
});