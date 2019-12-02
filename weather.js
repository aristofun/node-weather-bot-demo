const axios = require('axios');

// Weather API params
const wtUrl = `https://api.darksky.net/forecast/${process.env.WEATHER_TOKEN}/`;
const wtParams = {params: {units: 'si', lang: 'ru', exclude: ['alerts', 'flags', 'daily']}};

function weather(latitude, longitude) {
  return axios.get(`${wtUrl}${latitude},${longitude}`, wtParams);
}

module.exports = {weather};