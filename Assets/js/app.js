let APIKey = "166a433c57516f51dfab1f7edaed8413";
let place = {city: "London"}
let tempUnit = "imperial"
var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + place.city + "&units=" + tempUnit + "&appid=" + APIKey;
$.ajax({
  url: queryURL,
  method: "GET"
}).then(function(response) {
  console.log(response);
});