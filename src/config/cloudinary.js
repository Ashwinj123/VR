// config.js
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "drhcswu5n",
  api_key: "767437798533958",
  api_secret: "H9AghOATUjpIZMvlKrgW0lyDSUM",
  secure: true,
});

module.exports = cloudinary;
