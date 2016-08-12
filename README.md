# _A Facebook bot prototype who tell the weather_

The Node.js script is using:

[messenger-bot] (https://github.com/remixz/messenger-bot) to initialize the bot

[nlp-compromise] (https://github.com/nlp-compromise/nlp_compromise) for natural language processing

[geocoder] (https://github.com/geocoder-php/geocoder-js) to recognize and normalize city names

[datapoint-js](https://github.com/jacobtomlinson/datapoint-js) to get weather forecast_

__Disclaimer: Note that environmental variables for messenger-bot and for datapoint-js need to be set.__

## Dependencies
```Bash
$ npm install
```

## Set up the bot
First you need a Facebook account.
Then you need to download the Facebook SDK.
Follow the instruction on this [website] (https://sumwu.me/blog/page/9/how-to-create-a-facebook-messenger-bot). They are pretty useful.

You can also have a look at the [Facebook tutorial] (https://developers.facebook.com/docs/messenger-platform/complete-guide/setup) and this [GitHub Project] (https://github.com/jw84/messenger-bot-tutorial).

Basically, you have to run this kind of command in you terminal to set up the back end side:
```Bash
$ grunt serve
```

```Bash
$ ./ngrok http 3000
```

```Bash
$ curl -ik -X POST "https://graph.facebook.com/v2.6/me/subscribed_apps?access_token=process.env.FACEBOOK_API_TOKEN"
```

After the ngrok command, don't forget to set up the URL Callback on the API.

## Run the bot
After cloning this repository and setting up the server, you can run the code with this command:

```Bash
node app.js
```
