'use strict'

//Function which take the weather in argument and give symbols back 
function symbol(expr){
    var symbol = "";
    if(expr==="Clear night"||expr==="Sunny day"){
        symbol = "☀";
    }
    else if(expr==="Partly cloudy (night)"||expr==="Partly cloudy (day)"){
        symbol = "☀☁";
    }
    else if(expr==="Not used"){
        symbol = "Not used";
    }
    else if(expr==="Mist"||expr==="Fog"||expr==="Cloudy"||expr==="Overcast"){
        symbol = "☁";
    }
    else if(expr==="Light rain shower (night)"||expr==="Light rain shower (day)"||expr==="Light rain"){
        symbol = "☀☁💦";
    }
    else if(expr==="Drizzle"||expr==="Heavy rain shower (night)"||expr==="Heavy rain shower (day)"||expr==="Heavy rain"){
        symbol = "☁💦";
    }
    else if(expr==="Sleet shower (night)"||expr==="Sleet shower (day)"||expr==="Sleet"){
        symbol = "☁❄💦";
    }
    else if(expr==="Hail shower (night)"||expr==="Hail shower (day)"||expr==="Hail"){
        symbol = "☁☄";
    }
    else if(expr==="Light snow shower (night)"||expr==="Light snow shower (day)"||expr==="Light snow"||expr==="Heavy snow shower (night)"||expr==="Heavy snow shower (day)"||expr==="Heavy snow"){
        symbol = "❄";
    }
    else{
        symbol = "⚡";
    }
    return symbol;
}

//Function which take the message of the Facebook's user in argument and find the place the user is interested in.
//If no place, function give an empty string.
//If several places, function give the last place.
function findPlace(words){
    var place = "";
    for(var i=0 ; i<words.length ; i++){
        if(nlp.noun(words[i]).is_place()===true){
            place = words[i];
        }
    }
    return place;
}

//Function which take the message of the Facebook's user in argument and find the time the user is interested in.
//If no time, function give an empty string.
//If several times, function give the last time.
function findTime(words){
    var time = "";
    for(var i=0 ; i<words.length ; i++){
        if(nlp.noun(words[i]).is_date()===true||words[i]==="today"||words[i]==="now"||words==="tomorrow"){
            time = words[i];
        }
    }
    return time;
}

//Array of hours of sample.
var timeForecast = [1,7,10,13,16,19,22];

//Function which give the forecast now.
function forecastNow(currentHours){
    var absDiff = [];
    for(var i=0; i<timeForecast.length ; i++){
        absDiff.push(Math.abs(currentHours-timeForecast[i]));
    }
    Math.min.apply(null,absDiff);
    return absDiff.indexOf(Math.min.apply(null,absDiff));
}

//Library which deals with RegEx
let nlp = require("nlp_compromise");

//Library for http request
var http = require('http');

//Library for the bot
var Bot = require('messenger-bot');

//Library to get the weather depending on the time and the place
var datapoint = require('datapoint-js')
    datapoint.set_key(process.env.DATAPOINT_KEY)

//Create a new Bot with the token that you can get thanks to the Facebook API
var bot = new Bot({
    token: process.env.FACEBOOK_API_TOKEN,
    verify: process.env.VERIFY_TOKEN
});

//Libraries that recognize places
var geocoderProvider = 'google';
var httpAdapter = 'http';
var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter);

//Initialization
var place = "";
var time = "";

//Bot give an error message
bot.on('error', function (err) {
    console.log(err.message)
});

//Bot dealing with a message
bot.on('message', function (payload, reply) {
    console.log('message received : ', payload.message.text);

    var str = payload.message.text.toLowerCase();//The Facebook's user input is transform in lower case
    var words = str.split(" ");//words is an array of all the words of the sentence of the user
    place = findPlace(words);//Recognize the last place
    time = findTime(words);//Recognize the last time

    while(place === "" || time === ""){
        
        if(place === "" && time === ""){
            
            var text = "Hello!\nWhat do you want to know about the weather?";//Response of the bot
            
                reply({text}, function(err) {
                    if (err) {
                        throw err
                    }
                    console.log(`Echoed back ${text}`);
                });
        }//If both input are empty, the bot ask the user

        else if(place === ""){
            var text = "Where?";
                reply({text}, function(err) {
                    if (err) {
                        throw err
                    }
                    console.log(`Echoed back ${text}`);
                });
        }//If the place is empty, the bot ask for it

        else if(time === ""){
            var text = "When?";
                reply({text}, function(err) {
                    if (err) {
                        throw err
                    }
                    console.log(`Echoed back ${text}`);
                });
        }//If the time is empty, the bot ask for it

        //The bot should now have both of the time and the place the user is interested in.
        else{
            geocoder.geocode(place)
                .then(function(res) {
        
                    var address = res[0];//address is the place
                
                    var site = datapoint.get_nearest_forecast_site(address.longitude, address.latitude)//site is the nearest weather forecast center from place, find thanks to the lon and the lat of place
                    
                    var forecast = datapoint.get_forecast_for_site(site.id, "3hourly")//get the forecast for the site, sample every 3 hours
                    
                    var currentDate = new Date();
                    
                    var currentHours = currentDate.getHours();

                    if(time==="today"||time==="now"){
                        
                        var current_timestep = forecast.days[0].timesteps[forecastNow(currentHours)];//get the timestep for today, which is also now
                        
                        //This is the respond of our bot to the user for today's forecast where the user ask for it.
                        var text = symbol(current_timestep.weather.text)+"\n"+current_timestep.weather.text+"\nTemperature is "+current_timestep.temperature.value+"°"+current_timestep.temperature.units+" in "+address.formattedAddress+".";
                        
                        reply({text}, function(err) {
                            if (err) {
                                throw err
                            }
                            console.log(`Echoed back ${text}`);
                        });
                    }
                    else if(time==="tomorrow"){
                        
                        var current_timestep = forecast.days[1].timesteps[forecastNow(currentHours)];//get the timestep for tomorrow
                        
                        //This is the respond of our bot to the user for tomorrow's forecast where the user ask for it.
                        var text = symbol(current_timestep.weather.text)+"\n"+current_timestep.weather.text+"\nTomorrow, at "+ currentHours+":"+ currentDate.getMinutes() +", temperature should be "+current_timestep.temperature.value+"°"+current_timestep.temperature.units+" in "+address.formattedAddress+".";
                        
                        reply({text}, function(err) {
                            if (err) {
                                throw err
                            }
                            console.log(`Echoed back ${text}`);
                        });
                    }
                    // else{
                       // OTHER DATE TO CODE
                    // }
                        return;
                    })
                .catch(function(err) {
                    console.log(err);
                });
        }
        
    place = findPlace(words);//Condition for the while
    time = findTime(words);//Condition for the while
    console.log("place : "+place+"\ntime : "+time);
    }
});

console.log('FIN');

//The bot could be able to tell the user name.
// bot.getProfile(payload.sender.id, function (err, profile) {
// if (err) {
//     throw err
// }
// console.log(text);
//     console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${text}`);
// })

http.createServer(bot.middleware()).listen(3000);//set up the bot's server
console.log('Echo bot server running at port 3000.');