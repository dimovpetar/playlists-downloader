const { google } = require("googleapis");
const Config = require("./config/Config");

const init = async () => {
	await Config.init();
	return google.youtube({
		version: "v3",
		auth: Config.youtubeApiKey
	});
};

module.exports = {
	init
};
