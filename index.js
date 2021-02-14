const dotenv = require("dotenv");
dotenv.config();
const Twitter = require("twitter");
const sharp = require("sharp");
const fs = require("fs");
const weather = require("openweather-apis");
const { colors, backgroundColors } = require("./constants");

const currentUTC = Math.round(Date.now() / 1000);

const randomProp = function (obj) {
  var keys = Object.keys(obj);
  return obj[keys[(keys.length * Math.random()) << 0]];
};
const randomColor = randomProp(colors);

const client = new Twitter({
  consumer_key: process.env.apikey,
  consumer_secret: process.env.apikeysecret,
  access_token_key: process.env.accesstoken,
  access_token_secret: process.env.accesstokensecret,
});

// region get weather data
weather.setCity("Berlin");
weather.setAPPID(process.env.weatherapikey);
weather.getAllWeather(function (err, JSONObj) {
  // console.log(JSONObj);
  const {
    sys: { sunrise, sunset },
    clouds: { all },
  } = JSONObj;
  const light = sunrise < currentUTC && currentUTC < sunset;
  const clear = all < 20;
  console.log({ light, clear });
});
//endregion

// region manipulate svg
const glasses = `.st13{fill:${randomColor};stroke:#000000;stroke-miterlimit:10;}`;
const lens = `.st18{opacity:0.5;fill:${backgroundColors.dark};}`;

let svgFile = fs.readFileSync("assets/max.svg", "utf8");
svgFile = svgFile.replace(/^.st13.*$/m, glasses);
svgFile = svgFile.replace(/^.st18.*$/m, lens);
fs.writeFileSync("assets/max.svg", svgFile);
// endregion

// region export svg to png
sharp("./assets/max.svg")
  .resize(400, 400)
  .flatten({ background: backgroundColors.dark })
  .png()
  .toFile("./assets/max.jpg")
  .then(function (info) {
    //console.log(info);
  })
  .catch(function (err) {
    //console.log(err);
  });
// endregion

// region update twitter
client.get("account/verify_credentials", {}, function (error, tweet, response) {
  if (!error) {
    //console.log(tweet);
  }
});
//endregion
