$(document).ready(function() {

  $('#today-date').text(`${moment().format('dddd, LL')}`);
  for (let i = 1; i < 6; i++) {
    let $div = $('<div>');
    let $innerDiv = $('<div>').addClass('uk-card uk-card-default uk-card-body');
    let $h4 = $('<h4>').addClass("uk-card-title uk-text-center").text(moment().add(i, 'day').format('dddd, l'));
    let $img = $('<img>').attr("alt", "weather icon").attr("id", "icon-" + i);
    let $pTemp = $('<p>').text('High of the Day: ').append($('<span>').attr('id', 'temp-' + i));
    let $pHumidity = $('<p>').text('Humidity: ').append($('<span>').attr('id', 'humidity-' + i));
    $div.append($innerDiv.append($h4.append('<br>', $img), $pTemp, $pHumidity));
    $('.uk-grid-match').append($div);
  }

  let cities = ["Austin", "Chicago", "New York", "Orlando", "San Francisco", "Seattle", "Denver", "Atlanta"];
  
  function renderCities() {
    $("#view-city-cards").empty();
    for (let i = 0; i < cities.length; i++) {
      let $d = $("<div>").addClass("uk-card-header").attr("data-index", i).attr("id", "city-" + i);
      let $a = $("<a>").attr("href", "#").addClass("uk-button uk-button-text city-link").text(cities[i]);
      let $b = $("<button>").addClass("uk-button uk-button-text uk-float-right trash").attr("uk-icon", "trash");
      $d.append($a, $b);
      $("#view-city-cards").append($d);
    }
  }

  renderCities();

  $("#add-city").on("click", function(event) {
    event.preventDefault();
    let city = $("#city-input").val().trim();
    cities.unshift(city);
    $("#city-input").val("");
    renderCities();
  });

  $(document).on("click", ".trash", function(event) {
    const index = event.target.parentElement.parentElement.getAttribute("data-index");
    cities.splice(index, 1);
    renderCities();
  });

  $(document).on("click", ".city-link", displayInfo);
  
  function displayInfo(event) {
    event.preventDefault();
    const cityName = event.target.parentElement.textContent;
    let tempUnit = "imperial";
    let APIKey = "166a433c57516f51dfab1f7edaed8413";
    $.ajax({
        url: "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=" + tempUnit + "&appid=" + APIKey,
        method: "GET"
    }).then(function(response) {
      $('#current-city').text(`${response.name}, ${response.sys.country}`)
      $('#current-city').append($('<span>').addClass("uk-float-right").text(`${moment().format('dddd, LL')}`));
      $('#today-icon').attr('src', `http://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`)
      $('#today-temp').text(`${response.main.feels_like}°F`);
      $('#today-humidity').text(`${response.main.humidity}%`);
      $('#today-wind').text(`${response.wind.speed} MPH`);
      let lat = response.coord.lat;
      let lon = response.coord.lon;
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
      $('#icon-1').attr("src", `http://openweathermap.org/img/wn/${response.list[0].weather[0].icon}@2x.png`);
      $('#temp-1').text(`${response.list[0].temp.max}°F`);
      $('#humidity-1').text(`${response.list[0].humidity}%`);
      $('#icon-2').attr("src", `http://openweathermap.org/img/wn/${response.list[1].weather[0].icon}@2x.png`);
      $('#temp-2').text(`${response.list[1].temp.max}°F`);
      $('#humidity-2').text(`${response.list[1].humidity}%`);
      $('#icon-3').attr("src", `http://openweathermap.org/img/wn/${response.list[2].weather[0].icon}@2x.png`);
      $('#temp-3').text(`${response.list[2].temp.max}°F`);
      $('#humidity-3').text(`${response.list[2].humidity}%`);
      $('#icon-4').attr("src", `http://openweathermap.org/img/wn/${response.list[3].weather[0].icon}@2x.png`);
      $('#temp-4').text(`${response.list[3].temp.max}°F`);
      $('#humidity-4').text(`${response.list[3].humidity}%`);
      $('#icon-5').attr("src", `http://openweathermap.org/img/wn/${response.list[4].weather[0].icon}@2x.png`);
      $('#temp-5').text(`${response.list[4].temp.max}°F`);
      $('#humidity-5').text(`${response.list[4].humidity}%`);
    });
  };
  
  $('#city-0').children().first().click();

});