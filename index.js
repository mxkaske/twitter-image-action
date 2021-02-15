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

weather.setCity("Berlin");
weather.setAPPID(process.env.weatherapikey);
weather.getAllWeather(function (err, JSONObj) {
  const {
    sys: { sunrise, sunset },
    clouds: { all },
  } = JSONObj;

  const light = sunrise < currentUTC && currentUTC < sunset;
  const clear = all < 20;

  const glasses = `.st13{fill:${randomColor};stroke:#000000;stroke-miterlimit:10;}`;
  const lens = `.st18{opacity:0.5;fill:${
    clear ? backgroundColors.white : backgroundColors.dark
  };}`;

  let svgFile = fs
    .readFileSync("assets/max.svg", "utf8")
    .replace(/^.st13.*$/m, glasses)
    .replace(/^.st18.*$/m, lens);

  sharp(Buffer.from(svgFile, "utf8"))
    .resize(400, 400)
    .flatten({
      background: light ? backgroundColors.light : backgroundColors.dark,
    })
    .toBuffer()
    .then(function (response) {
      client.post(
        "account/update_profile_image",
        {
          image: response.toString("base64"),
        },
        function (error, tweet, response) {
          if (!error) console.log(tweet);
          else console.log(error);
        }
      );
    })
    .catch(function (error) {
      console.log(error);
    });
});
