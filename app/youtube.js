const { google } = require("googleapis");
const vars = require("./config/vars");
const youtube = google.youtube({
	version: "v3",
	auth: vars.youtube_api_key
});

module.exports = youtube;
