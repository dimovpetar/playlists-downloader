const { google } = require("googleapis");
const Config = require("./config/Config");
const assert = require("assert");

const init = async () => {
	assert.ok(Config.youtubeApiKey);
	return google.youtube({
		version: "v3",
		auth: Config.youtubeApiKey
	});
};

module.exports = {
	init
};
