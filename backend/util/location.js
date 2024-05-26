// const APi_KEY = "";
// const axios = require("axios");
// const HttpError = require("../models/http-error");

async function getCoordsForAddress(address) {
  return {
    lat: 40.748817,
    lng: -73.985428,
  };

  // const response = axios.get(
  //   `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
  //     address
  //   )}&key=${APi_KEY}`
  // );
  // const data = response.data;

  // if (!data || data.status === "ZERO_RESULTS") {
  //   const error = new HttpError(
  //     "Could not find location for the specified address.",
  //     422
  //   );
  //   throw error;
  // }

  // const coordinates = data.results[0].geometry.location;
}

module.exports = getCoordsForAddress;
