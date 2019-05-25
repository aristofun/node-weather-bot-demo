const axios = require('axios');

// Формируем параметры запроса к погодному API
const wtUrl = `https://api.darksky.net/forecast/${process.env.WEATHER_TOKEN}/`;
const wtParams = {params: {units: 'si', lang: 'ru', exclude: ['alerts', 'flags', 'daily']}};

function weather(latitude, longitude) {
  return axios.get(`${wtUrl}${latitude},${longitude}`, wtParams)
    .then((resp) => {
      const message = `${resp.data.currently.summary} ${resp.data.currently.temperature}˚C`;
      return message;
    });
}

module.exports = {weather};