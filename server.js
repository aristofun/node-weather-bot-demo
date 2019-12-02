require('dotenv').config();
const tg = require('telegraf');
const geo = require('./geo');
const weather = require('./weather');

// Bot instance with API token
const bot = new tg(process.env.BOT_TOKEN);

// Welcome message for new user
bot.start((ctx) => {
  console.log('/start', ctx.message);
  ctx.reply('Send me Location 📍 or address string, and I\'ll check the weather');
});

function locationReplier(ctx, lat, lng) {
  console.log('Location received: ' + JSON.stringify(ctx.message));

  if (lat == null || lng == null) {
    lat = ctx.message.location.latitude;
    lng = ctx.message.location.longitude;
  }

  weather.weather(lat, lng)
    .then((resp) => {
      let cw = resp.data.currently;
      console.log('DarkSky api response: ' + JSON.stringify(cw));
      console.log(`${cw.summary} ${cw.temperature}˚C`);

      let message = `${cw.summary}, *${Math.round(cw.temperature)}*˚C ` +
        `(feels like ${Math.round(cw.apparentTemperature)})\n\n` +
        `Pressure ${Math.round(cw.pressure * 0.75006157584566)}  mmHg\n` +
        `Wind ${cw.windSpeed} m/sec\n` +
        `Humidity ${Math.round(cw.humidity * 100)}%\n` +
        `http://www.google.com/maps/place/${lat},${lng}\n\n` +
        resp.data.hourly.summary;

      console.log(message);

      ctx.replyWithPhoto(
        `https://darksky.net/images/weather-icons/${cw.icon}.png`,
        {
          caption: message,
          parse_mode: 'Markdown'
        });
    })
    .catch((err) => {
      let errMsg = `${err.name}/${err.statusCode}/${err.message}`;
      console.log(errMsg);
      ctx.reply('Error getting the weather, try again later... 🤷\n');
    });
}

// Location type message
bot.on('location', locationReplier);

// Reply with hint on other types of messages
bot.on('message', (ctx) => {
  console.log('Message received', ctx.message);

  geo.geoCodeAddress(ctx.message.text)
    .then((resp) => {
      console.log('Geo response: ' + JSON.stringify(resp));
      ctx.reply(resp.address);
      
      locationReplier(ctx, resp.lat, resp.lng);
    })
    .catch((err) => {
      let errMsg = `${err.name}/${err.statusCode}/${err.message}`;
      console.log(errMsg);
      ctx.reply('Address lookup error 🤷‍♂️\n');
    });
});

// Launch bot connected to TG API
console.log('Bot launched');
bot.launch();
