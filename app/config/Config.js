const fs = require("fs");
const fsp = fs.promises;
const electron = require("electron");
const path = require("path");
const { createDirIfDoesntExist } = require("../utils/FileUtils");
const userDataPath = (electron.app || electron.remote.app).getPath("userData");
const settingsFilePath = path.join(userDataPath, "playlists-downloader/settings.json");

class Config {
	constructor() {
		this._initialized = false;
		this.settingsPath = settingsFilePath;
	}

	async init(data) {
		if (this._initialized) {
			return;
		}

		this.youtubeApiKey = data.youtubeApiKey;
		this.channelId = data.channelId;
		try {
			await createDirIfDoesntExist(path.join(userDataPath, "playlists-downloader"));
			await fsp.writeFile(settingsFilePath, JSON.stringify({
				youtubeApiKey: this.youtubeApiKey,
				youtubeChannelId: this.channelId
			}));
		} catch (err) {
			console.error(`Failed to persist settings in ${settingsFilePath}`);
		}
		this._initialized = true;
	}

	async checkForSavedSettings() {
		return fsp.readFile(settingsFilePath, "utf8")
			.then((data) => {
				const parsed = JSON.parse(data);
				this.youtubeApiKey = parsed.youtubeApiKey;
				this.channelId = parsed.youtubeChannelId;
				this._initialized = true;
				return true;
			})
			.catch(() => {
				return false;
			});
	}
}

module.exports = new Config();
