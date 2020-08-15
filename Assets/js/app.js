$(document).ready(function() {

  $('#today-date').text(`${moment().format('dddd, l')}`);
  for (let i = 1; i < 6; i++) {
    let $div = $('<div>');
    let $innerDiv = $('<div>').addClass('uk-card uk-card-default uk-card-small');
    let $h4 = $('<h4>').addClass('uk-card-title uk-text-center uk-text-light uk-padding uk-padding-remove-bottom').text(moment().add(i, 'day').format('dddd, l'));
    let $img = $('<img>').attr('alt', 'weather icon').attr('id', 'icon-' + i);
    let $pDescr = $('<p>').addClass('uk-text-uppercase uk-text-small').attr('id', 'descr-' + i);
    let $table = $('<table>').addClass('uk-table uk-text-center');
    let $trTemp = $('<tr>').append($('<th>').text('High / Low').addClass('uk-text-center uk-padding-remove-right'), ($('<th>').text('Humidity').addClass('uk-text-center')));
    let $trHumidity = $('<tr>').append(($('<td>').attr('id', 'temp-' + i)).addClass('uk-text-center uk-padding-remove-right'), ($('<td>').attr('id', 'humidity-' + i)));
    $div.append($innerDiv.append($h4.append('<br>', $pDescr, $img), $table.append($trTemp, $trHumidity)));
    $('.uk-grid-match').append($div);
  }

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

  init();
  
  function addToList (event) {
    event.preventDefault();
    let city = $("#city-input").val().trim().toLowerCase();
    cities.unshift(city);
    findDuplicates(cities);
    if (city === '') {
      return cities.shift();
    } else if ((findDuplicates(cities) === '') && (city !== '')) {
      $("#city-input").val("");
      renderCityList();
      storeCities();
      $('#city-0').children().first()[0].click();
    } else {
      cities.shift();
      $("#city-input").val("");
      for (let i = 0; i < cities.length; i++) {
        if (cities[i] === city) {
          $(`#city-${i}`).children().first()[0].click();
        }
      }
    }
  };

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

  $("#add-city").on("click", addToList);

  $("#city-input").bind('keypress', function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      $("#add-city").click();
    }
  });

  $(document).on("click", ".trash", function(event) {
    const index = event.target.parentElement.parentElement.getAttribute("data-index");
    cities.splice(index, 1);
    storeCities();
    renderCityList();
  });

  $(document).on("click", ".city-link", displayInfo);
  
  function displayInfo(event) {
    event.preventDefault();
    const cityName = event.target.parentElement.textContent;
    let tempUnit = "imperial";
    let APIKey = "166a433c57516f51dfab1f7edaed8413";
    $.ajax({
        url: "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=" + tempUnit + "&set=unix&appid=" + APIKey,
        method: "GET"
    }).then(function(response) {
      $('#current-city').text(`${response.name}, ${response.sys.country}`)
      let lat = response.coord.lat;
      let lon = response.coord.lon;
      $.ajax({
        url: `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=${tempUnit}&appid=${APIKey}`,
        method: "GET"
      }).then(function(response) {
        $('.current-description').html(response.current.weather[0].description);
        $('#today-icon').attr('src', `https://openweathermap.org/img/wn/${response.current.weather[0].icon}@2x.png`)
        $('.today-temp').text(`${Math.floor(response.current.temp)}°F`);
        $('#morning').text(`${Math.floor(response.daily[0].temp.morn)}°F`);
        $('#afternoon').text(`${Math.floor(response.daily[0].temp.day)}°F`);
        $('#evening').text(`${Math.floor(response.daily[0].temp.eve)}°F`);
        $('#night').text(`${Math.floor(response.daily[0].temp.night)}°F`);
        $('#feels-like').text(`${Math.floor(response.current.feels_like)}°F`);
        $('#today-humidity').text(`${response.current.humidity}%`);
        function degToCompass(num) {
          let val = Math.floor((num / 22.5) + 0.5);
          let arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
          return arr[(val % 16)];
        }
        let windDirection = degToCompass(response.current.wind_deg);
        $('#today-wind').text(`${response.current.wind_speed} MPH ${windDirection}`);
        $('#today-uv').text(response.current.uvi);
        if (response.current.uvi < 3) {
          $('#today-uv').attr('class', 'uk-alert-success');
        } else if (response.current.uvi >= 3 && response.value < 8) {
          $('#today-uv').attr('class', 'uk-alert-warning');
        } else {
          $('#today-uv').attr('class', 'uk-alert-danger');
        }
        for (let i = 0; i < 5; i++) {
          $(`#descr-${i+1}`).text(response.daily[i].weather[0].description)
          $(`#icon-${i+1}`).attr("src", `https://openweathermap.org/img/wn/${response.daily[i].weather[0].icon}@2x.png`);
          $(`#temp-${i+1}`).text(`${Math.floor(response.daily[i].temp.max)} / ${Math.floor(response.daily[i].temp.min)}°F`);
          $(`#humidity-${i+1}`).text(`${response.daily[i].humidity}%`);
          $(`#hour-${i+1}-temp`).text(`${Math.floor(response.hourly[i+1].temp)}°F`);
          $(`#hour-${i+1}-feels`).text(`${Math.floor(response.hourly[i+1].feels_like)}°F`);
        }
      });
      $.ajax({
        url: `https://secure.geonames.org/timezoneJSON?lat=${lat.toFixed(2)}&lng=${lon.toFixed(2)}&username=zigzagpoon`,
        method: "GET"
      }).then(function(response) {
        for (let i = 1; i < 6; i++) {
          $(`#hour-${i}`).text(`${(moment.tz(response.time, response.timezoneId).add(i, 'hours').format('hA'))}`);
          $(`#hour-${i}`).parent().addClass('uk-text-right');
        }
        $('#current-time').html(`${(moment.tz(response.time, response.timezoneId)).format('LLLL')}`);
        $('#sunrise').text((moment.tz(response.sunrise, response.timezoneId)).format('LT'));
        $('#sunset').text((moment.tz(response.sunset, response.timezoneId)).format('LT'));
      }); 
    });
  };

  $('#city-0').children().first().click();

});