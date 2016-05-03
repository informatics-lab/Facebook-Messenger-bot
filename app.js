'use strict'

// NEXT STEP :
//     - Put an image of a sun, a cloud or rain, depend on the weather.
//     - Add the time of the day or the week in the variables. (RegEx "tomorrow" ...)
//     - The app should answer "Hello [user's name]"
//     - We should create a really could page with the help of the design team

// function mots put in an array all words of a sentence
// [,. ?!;:] are used to split words
function mots(str){
    var lettres="";
    var mots=[];
    for(var i=0; i<str.length ; i++){
        if(str[i]!==" " && str[i]!=="," && str[i]!=="." && str[i]!=="?" && str[i]!=="!" && str[i]!==";" && str[i]!==":"){
            lettres=lettres+str[i];
        }
        else{
            if(lettres!=="")
            mots.push(lettres);
            lettres="";
        }
    }
    if(str[str.length-1]!==" " && str[str.length-1]!=="," && str[str.length-1]!=="." && str[str.length-1]!=="?" && str[str.length-1]!=="!" && str[str.length-1]!==";" && str[str.length-1]!==":"){
        mots.push(lettres);
    }
    return mots;
}


let nlp = require("nlp_compromise");

var http = require('http');
var Bot = require('messenger-bot');
var datapoint = require('datapoint-js')
    datapoint.set_key("41bf616e-7dbc-4066-826a-7270b8da4b93")

var bot = new Bot({
    token: 'EAAYQyEuvYfUBAKihUAovZAACAW3At3MUst8ISQof0Gbr5mLnu94GQOkco0OEZA9wCrUCHIPwvjtSU6B2Fyr8gNZADV6oHIAv5cHCPzaABxcC1Ec66Ro1X1uWobEqk60FB2AbG150oXxjrdMlwZA72inC5diRNcYZAqOc4yLsxZCAZDZD',
    verify: 'VERIFY_TOKEN'
});

bot.on('error', function (err) {
    console.log(err.message)
});

bot.on('message', function (payload, reply) {

    console.log('message received : ', payload.message.text);

    var re = /[weather|forecast|temperature|cold|hot|sun|sunny|cloud|cloudy|wind|windy|rain|rainy|climate|umbrella|sunglasses]/
    var str = payload.message.text.toLowerCase();
    var words = mots(str);
    var place = ""

    for(var i=0 ; i<words.length ; i++){
        if(nlp.noun(words[i]).is_place()===true){
            place = words[i];
        }
    }

    var geocoderProvider = 'google';
    var httpAdapter = 'http';
    var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter);

    if(re.exec(str)){
        console.log('matched');
        geocoder.geocode(place)
            .then(function(res) {
                
                var address = res[0];
                console.log(address);

                var site = datapoint.get_nearest_forecast_site(address.longitude, address.latitude)
                var obs_site = datapoint.get_nearest_obs_site(address.longitude, address.latitude)
                var forecast_site = datapoint.get_nearest_obs_site(address.longitude, address.latitude)
                var forecast = datapoint.get_forecast_for_site(site.id, "3hourly")
                var current_timestep = forecast.days[0].timesteps[0]

                var text =  nlp.noun(place).is_place() + "\n"+ place+ "\nlon: "+address.longitude+"\nlat: "+address.latitude+"\nTemperature is " + current_timestep.temperature.value + "°" + current_timestep.temperature.units + " in " + address.formattedAddress + ".";
                
                reply({text}, function(err) {
                    if (err) {
                        throw err
                    }

                    console.log(`Echoed back ${text}`);
                });
                return;
            })
            .catch(function(err) {
                console.log(err);
            });
        }

    else{
        var text = "unrecognised!";
    }

    console.log('FIN');

    //var text = {
    //    'attachment': {
    //        'type': 'image',
    //        'payload': {
    //            'url': 'https://d13yacurqjgara.cloudfront.net/users/28455/screenshots/1389791/weather.gif'
    //        }
    //    }
    //};
    // bot.getProfile(payload.sender.id, function (err, profile) {
    //     if (err) {
    //         throw err
    //     }
    //     console.log(text);

    //         console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${text}`);
    //     })
    // })

    reply({text}, function(err) {
        if (err) {
            throw err
        }

        console.log(`Echoed back ${text}`);
    });
});

http.createServer(bot.middleware()).listen(3000);
console.log('Echo bot server running at port 3000.');