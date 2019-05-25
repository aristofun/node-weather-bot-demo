// Подключаем телеграф и либу для http запросов
require('dotenv').config();
const tg = require('telegraf');
const geo = require('./geo');
const weather = require('./weather');

// Создаем экземпляр бота с API ключем из переменных окружения
const bot = new tg(process.env.BOT_TOKEN);

// Велкам сообщение для нового юзера
bot.start((ctx) => {
  console.log('/start', ctx.message);
  ctx.reply('Пришли локейшен, узнаешь текущую погоду в нем 📍');
});

function locationReplier(ctx, lat, lng) {
  console.log('Location received');

  if (!!ctx) {
    console.log(ctx.message);
    lat = ctx.message.location.latitude;
    lng = ctx.message.location.longitude;
  }

  weather.weather(lat, lng)
    .then((resp) => {
      let cw = resp.data.currently;

      console.log(`${cw.summary} ${cw.temperature}˚C`);

      let message = `${cw.summary}, *${Math.round(cw.temperature)}*˚C ` +
        `(ощущается как ${Math.round(cw.apparentTemperature)})\n\n` +
        `Давление ${Math.round(cw.pressure * 0.75006157584566)} мм рт. ст.\n` +
        `Ветер ${cw.windSpeed} м/c\n` +
        `Влажность ${Math.round(cw.humidity * 100)}%\n` +
        `Координаты: ш:${lat}, д:${lng}%\n\n` +
        resp.data.hourly.summary;

      console.log(message);

      return ctx.replyWithPhoto(
        `https://darksky.net/images/weather-icons/${cw.icon}.png`,
        {
          caption: message,
          parse_mode: 'Markdown'
        });
    })
    .catch((err) => {
      let errMsg = `${err.name}/${err.statusCode}/${err.message}`;
      console.log(errMsg);
      ctx.reply('Ошибка определения погоды, попробуйте позже... \n' + errMsg);
    });
}


// На сообщение с типом location лезем в погодный сервис и отдаем погоду
bot.on('location', locationReplier);

// На любое сообщение кроме location отвечаем подсказкой
bot.on('message', (ctx) => {
  console.log('Message received', ctx.message);

  geo.geoCodeAddress(ctx.message.text)
    .then((resp) => {
      return locationReplier(undefined, resp.lat, resp.lng);
    })
    .catch((err) => {
      let errMsg = `${err.name}/${err.statusCode}/${err.message}`;
      console.log(errMsg);
      ctx.reply('Ошибка поиска адреса 🤷‍♂️\n');
    });
});

// Launch bot connected to TG API
console.log('Bot launched');
bot.launch();
