'use strict';
module.change_code = 1;
var _ = require('lodash');
var rp = require('request-promise');
var ENDPOINT = 'http://services.faa.gov/airport/status/';

function FAADataHelper() {
}

FAADataHelper.prototype.requestAirportStatus = function(airportCode) {
  return this.getAirportStatus(airportCode).then(
    function(response) {
		
		setTimeout(function(){console.log(response)},3000);
      console.log('success - received airport info for ' + airportCode);
      return response.body;
    }
  );
};

FAADataHelper.prototype.getAirportStatus = function(airportCode) {
  var options = {
    method: 'GET',
    uri: ENDPOINT + airportCode,
    resolveWithFullResponse: true,
    json: true
  };
  return rp(options);
};

FAADataHelper.prototype.formatAirportStatus = function(airportStatus) {
  var weather = _.template('The current weather conditions are ${weather}, ${temp} and wind ${wind}.')({
    weather: airportStatus.weather.weather,
    temp: airportStatus.weather.temp,
    wind: airportStatus.weather.wind
  });
  if (airportStatus.delay === 'true') {
    var template = _.template('There is currently a delay for ${airport}. ' +
      'The average delay time is ${delay_time}. ' +
      'Delay is because of the following: ${delay_reason}. ${weather}');
    return template({
      airport: airportStatus.name,
      delay_time: airportStatus.status.avgDelay,
      delay_reason: airportStatus.status.reason,
      weather: weather
    });
  } else {
    //no delay
    return _.template('Listen up dude, there is currently no delay at ${airport}. ${weather}')({
      airport: airportStatus.name,
      weather: weather
    });
  }
};

module.exports = FAADataHelper;
