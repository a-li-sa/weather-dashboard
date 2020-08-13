$(document).ready(function() {

  $('#today-date').text(`${moment().format('dddd, l')}`);
  for (let i = 1; i < 6; i++) {
    let $div = $('<div>');
    let $innerDiv = $('<div>').addClass('uk-card uk-card-default uk-card-body');
    let $h4 = $('<h4>').addClass('uk-card-title uk-text-center uk-text-light').text(moment().add(i, 'day').format('dddd, l'));
    let $img = $('<img>').attr('alt', 'weather icon').attr('id', 'icon-' + i);
    let $pDescr = $('<p>').addClass('uk-text-uppercase uk-text-small').attr('id', 'descr-' + i);
    let $pTemp = $('<p>').text('Temperature: ').append($('<span>').attr('id', 'temp-' + i));
    let $pHumidity = $('<p>').text('Humidity: ').append($('<span>').attr('id', 'humidity-' + i));
    $div.append($innerDiv.append($h4.append('<br>', $pDescr, $img), $pTemp, $pHumidity));
    $('.uk-grid-match').append($div);
  }

  let cities = ["austin", "chicago", "new york", "orlando", "san francisco", "seattle", "denver", "atlanta"];
  
  function renderCityList() {
    $("#view-city-cards").empty();
    for (let i = 0; i < cities.length; i++) {
      let $d = $("<div>").addClass("uk-card-header").attr("data-index", i).attr("id", "city-" + i);
      let $a = $("<a>").attr("href", "#").addClass("uk-button uk-button-text city-link").text(cities[i]);
      let $b = $("<button>").addClass("uk-button uk-button-text uk-float-right trash").attr("uk-icon", "close");
      $d.append($a, $b);
      $("#view-city-cards").append($d);
    }
  }

  renderCityList();

  $("#add-city").on("click", function(event) {
    event.preventDefault();
    let city = $("#city-input").val().trim().toLowerCase();
    cities.unshift(city);
    findDuplicates(cities);
    if (findDuplicates(cities) === '') {
      $("#city-input").val("");
      renderCityList();
      $('#city-0').children().first().click();
    } else {
      cities.shift();
      for (let i = 0; i < cities.length; i++) {
        if (cities[i] === city) {
          $(`#city-${i}`).children().first().click();
        }
      }
    }
  });

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

  $(document).on("click", ".trash", function(event) {
    const index = event.target.parentElement.parentElement.getAttribute("data-index");
    cities.splice(index, 1);
    renderCityList();
  });

  $(document).on("click", ".city-link", displayInfo);
  
  function displayInfo(event) {
    event.preventDefault();
    const cityName = event.target.parentElement.textContent;
    let tempUnit = "imperial";
    let APIKey = "852968cb61edf5b792db65f8d6deefa1";
    $.ajax({
        url: "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=" + tempUnit + "&set=unix&appid=" + APIKey,
        method: "GET"
    }).then(function(response) {
      $('#current-city').text(`${response.name}, ${response.sys.country}`)
      $('#current-city').append($('<span>').addClass("uk-float-right uk-text-light").text(`${moment().format('dddd, l')}`));
      $('.current-description').html(response.weather[0].description);
      $('#today-icon').attr('src', `http://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`)
      $('#today-temp').text(`${response.main.temp}°F`);
      $('#feels-like').text(`${response.main.feels_like}°F`);
      $('#today-humidity').text(`${response.main.humidity}%`);
      $('#today-wind').text(`${response.wind.speed} MPH`);
      let lat = response.coord.lat;
      let lon = response.coord.lon;
      $.ajax({
        url: `https://secure.geonames.org/timezoneJSON?lat=${lat.toFixed(2)}&lng=${lon.toFixed(2)}&username=zigzagpoon`,
        method: "GET"
      }).then(function(response) {
        $('#sunrise').text((moment.tz(response.sunrise, response.timezoneId)).format('LT'));
        $('#sunset').text((moment.tz(response.sunset, response.timezoneId)).format('LT'));

      }); 
      $.ajax({
        url: "https://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey,
        method: "GET"
      }).then(function(response) {
        $('#today-uv').text(response.value);
        if (response.value < 3) {
          $('#today-uv').attr('class', 'uk-alert-success');
        } else if (response.value >= 3 && response.value < 8) {
          $('#today-uv').attr('class', 'uk-alert-warning');
        } else {
          $('#today-uv').attr('class', 'uk-alert-danger');
        }
      });
    });
    $.ajax({
      url: "https://api.openweathermap.org/data/2.5/forecast/daily?q=" + cityName + "&units=" + tempUnit + "&appid=" + APIKey,
      method: "GET"
    }).then(function(response) {
      for (let i = 0; i < 5; i++) {
        $(`#descr-${i+1}`).text(response.list[i].weather[0].description)
        $(`#icon-${i+1}`).attr("src", `http://openweathermap.org/img/wn/${response.list[i].weather[0].icon}@2x.png`);
        $(`#temp-${i+1}`).text(`${Math.floor(response.list[i].temp.max)}°F / ${Math.floor(response.list[i].temp.min)}°F`);
        $(`#humidity-${i+1}`).text(`${response.list[i].humidity}%`);
      }
    });
  };
  
  $('#city-0').children().first().click();

});