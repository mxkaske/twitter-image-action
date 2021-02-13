const dotenv = require("dotenv");
dotenv.config();
const Twitter = require("twitter");
const sharp = require("sharp");
const fs = require("fs");
const { colors, backgroundColors } = require("./constants");

const client = new Twitter({
  consumer_key: process.env.apikey,
  consumer_secret: process.env.apikeysecret,
  access_token_key: process.env.accesstoken,
  access_token_secret: process.env.accesstokensecret,
});

// region manipulate svg
const glasses = `.st13{fill:${colors.indigo};stroke:#000000;stroke-miterlimit:10;}`;
const lens = `.st18{opacity:0.4;fill:${backgroundColors.dark};}`;

const svgFile = fs.readFileSync("assets/max.svg", "utf8");
svgFile.replace(/^.st13(.*)$/gm, "<h1>$1</h1");
// fs.writeFileSync("assets/max.svg", svgFile);
// endregion

// region export svg to png
sharp("./assets/max.svg")
  .resize(400, 400)
  .flatten({ background: colors.dark })
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
