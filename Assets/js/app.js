$(document).ready(function() {
  $('#today-date').text(`(${moment().format('L dddd')})`);
  for (let i = 1; i < 6; i++) {
    let $div = $('<div>');
    let $innerDiv = $('<div>').addClass('uk-card uk-card-default uk-card-body');
    let $h4 = $('<h4>').addClass("uk-card-title").text(moment().add(i, 'day').format('L dddd'));
    let $pTemp = $('<p>').text('High of the Day: ').append($('<span>').attr('id', 'temp-' + i));
    let $pHumidity = $('<p>').text('Humidity: ').append($('<span>').attr('id', 'humidity-' + i));
    $div.append($innerDiv.append($h4, $pTemp, $pHumidity));
    $('.uk-grid-match').append($div);
  }
  let cities = ["Austin", "Chicago", "New York", "Orlando", "San Francisco", "Seattle", "Denver", "Atlanta"];
  function renderCities() {
    $("#view-city-cards").empty();
    for (let i = 0; i < cities.length; i++) {
      let $d = $("<div>").addClass("uk-card-header").attr("data-index", i);
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
    renderCities();
  });
  $(document).on("click", ".trash", function(event) {
    const index = event.target.parentElement.parentElement.getAttribute("data-index");
    cities.splice(index, 1);
    renderCities();
  });
  $(document).on("click", ".city-link", function(event) {
    event.preventDefault();
    const cityName = event.target.parentElement.textContent;
    let tempUnit = "imperial";
    let APIKey = "166a433c57516f51dfab1f7edaed8413";
    $.ajax({
        url: "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=" + tempUnit + "&appid=" + APIKey,
        method: "GET"
    }).then(function(response) {
      $('#current-city').text(`${response.name} (${moment().format('L dddd')})`);
      $('#today-temp').text(`${response.main.feels_like}°F`);
      $('#today-humidity').text(`${response.main.humidity}%`);
      $('#today-wind').text(response.wind.speed);
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
      url: "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&units=" + tempUnit + "&appid=" + APIKey,
      method: "GET"
    }).then(function(response) {
      console.log(response);
      $('#temp-1').text(`${response.list[4].main.temp_max}°F`);
      $('#humidity-1').text(`${response.list[4].main.humidity}%`);
      $('#temp-2').text(`${response.list[12].main.temp_max}°F`);
      $('#humidity-2').text(`${response.list[12].main.humidity}%`);
      $('#temp-3').text(`${response.list[20].main.temp_max}°F`);
      $('#humidity-3').text(`${response.list[20].main.humidity}%`);
      $('#temp-4').text(`${response.list[28].main.temp_max}°F`);
      $('#humidity-4').text(`${response.list[28].main.humidity}%`);
      $('#temp-5').text(`${response.list[36].main.temp_max}°F`);
      $('#humidity-5').text(`${response.list[36].main.humidity}%`);
    });
  });
});