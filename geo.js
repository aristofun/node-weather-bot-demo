const axios = require('axios');
const geoUrl = 'https://maps.googleapis.com/maps/api/geocode/json';

function geoCodeAddress(address) {
  let geoParams = {
    params: {
      address: address,
      key: process.env.GMAPS_TOKEN
    }
  };

  return axios.get(geoUrl, geoParams)
    .then((resp) => {
      let body = resp.data;
      // console.log(body);
      if (body.status === 'ZERO_RESULTS') {
        throw new Error('No address found');
      } else if (body.status === 'OK') {
        let res = {
          address: body.results[0].formatted_address,
          lat: body.results[0].geometry.location.lat,
          lng: body.results[0].geometry.location.lng
        };
        return res;
      }
    });
}

module.exports = {geoCodeAddress};