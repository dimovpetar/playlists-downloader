const fs = require("fs");
const fsp = fs.promises;
const electron = require("electron");
const path = require("path");
const { createDirIfDoesntExist } = require("../utils/FileUtils");
const userDataPath = (electron.app || electron.remote.app).getPath("userData");
const settingsFilePath = path.join(userDataPath, "playlists-downloader/settings.json");

class Config {
	constructor() {
		this.settingsPath = settingsFilePath;
	}

	async init(data) {
		this.youtubeApiKey = data.youtubeApiKey;
		this.youtubeChannelId = data.youtubeChannelId;

		try {
			await createDirIfDoesntExist(path.join(userDataPath, "playlists-downloader"));
			await fsp.writeFile(settingsFilePath, JSON.stringify({
				youtubeApiKey: this.youtubeApiKey,
				youtubeChannelId: this.youtubeChannelId
			}));
		} catch (err) {
			console.error(`Failed to persist settings in ${settingsFilePath}`);
		}
	}

	async checkForSavedSettings() {
		return fsp.readFile(settingsFilePath, "utf8")
			.then((data) => {
				const parsed = JSON.parse(data);
				return parsed;
			})
			.catch(() => {
				return false;
			});
	}
}

module.exports = new Config();
