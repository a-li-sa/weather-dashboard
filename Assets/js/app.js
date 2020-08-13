// let APIKey = "166a433c57516f51dfab1f7edaed8413";
// let place = {city: "London"}
// let tempUnit = "imperial"
// var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + place.city + "&units=" + tempUnit + "&appid=" + APIKey;
// $.ajax({
//   url: queryURL,
//   method: "GET"
// }).then(function(response) {
//   console.log(response);
// });
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

$(document).on("click", ".city-link", function(event) {
  event.preventDefault();
  const cityName = event.target.parentElement.textContent;
  let tempUnit = "imperial";
  let APIKey = "166a433c57516f51dfab1f7edaed8413";
  $.ajax({
      url: "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=" + tempUnit + "&appid=" + APIKey,
      method: "GET"
  }).then(function(response) {
    $('#current-city').text(response.name);
    $('#today-temp').text(response.main.feels_like);
    $('#today-humidity').text(response.main.humidity);
    $('#today-wind').text(response.wind.speed);
    let lat = response.coord.lat;
    let lon = response.coord.lon;
    $.ajax({
      url: "https://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey,
      method: "GET"
    }).then(function(response) {
      $('#today-uv').text(response.value);
    });
  });
  $.ajax({
    url: "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&units=" + tempUnit + "&appid=" + APIKey,
    method: "GET"
  }).then(function(response) {
    console.log(response);
  });
});

$(document).on("click", ".trash", function(event) {
  const index = event.target.parentElement.getAttribute("data-index");
  cities.splice(index, 1);
  renderCities();
});
{/* <div class="uk-card-default" id="view-city-cards">
<div class="uk-card-header">
  <a href="#" class="uk-button uk-button-text">Austin</a> 
  <button class="uk-button uk-button-text uk-float-right" uk-icon="icon: trash"></button>
</div> */}
