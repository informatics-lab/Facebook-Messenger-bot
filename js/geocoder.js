'use strict'

var geocoderProvider = 'google';
var httpAdapter = 'http';
// optional
// var extra = {
//     apiKey: 'YOUR_API_KEY', // for Mapquest, OpenCage, Google Premier
//     formatter: null         // 'gpx', 'string', ...
// };

var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter);

// Using callback
// geocoder.geocode('29 champs elysée paris', function(err, res) {
//     console.log(res);
// });

// Or using Promise
geocoder.geocode('29 champs elysée paris')
    .then(function(res) {
        console.log(res);
    })
    .catch(function(err) {
        console.log(err);
    });

console.log("c");