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
  consumer_key: process.env.APIKEY,
  consumer_secret: process.env.APIKEYSECRET,
  access_token_key: process.env.ACCESSTOKEN,
  access_token_secret: process.env.ACCESSTOKENSECRET,
});

weather.setCity("Berlin");
weather.setAPPID(process.env.WEATHERAPIKEY);
weather.getAllWeather(function (err, JSONObj) {
  const {
    sys: { sunrise, sunset },
    clouds: { all },
  } = JSONObj;

  const light = sunrise < currentUTC && currentUTC < sunset;
  const clear = all < 20;

  const glassesColor = `.st13{fill:${randomColor};stroke:#000000;stroke-miterlimit:10;}`;
  const lensColor = `.st18{opacity:0.5;fill:${
    clear && light ? backgroundColors.dark : backgroundColors.white
  };}`;

  const backgroundColor = light
    ? clear
      ? backgroundColors.yellow
      : backgroundColors.light
    : backgroundColors.dark;

  let svgFile = fs
    .readFileSync("assets/max.svg", "utf8")
    .replace(/^.st13.*$/m, glassesColor)
    .replace(/^.st18.*$/m, lensColor);

  sharp(Buffer.from(svgFile, "utf8"))
    .resize(400, 400)
    .flatten({
      background: backgroundColor,
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

  sharp("assets/banner.png")
    .resize(1500, 500)
    .flatten({
      background: backgroundColor,
    })
    .then(function (response) {
      client.post(
        "account/update_profile_banner",
        {
          banner: response.toString("base64"),
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
