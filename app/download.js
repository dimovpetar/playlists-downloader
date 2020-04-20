
const Channel = require("./classes/Channel");
const async = require("async");
const BrowserWindowInstance = require("./BrowserWindowInstance");
const { ipcMain } = require("electron");
const Log = require("./classes/Log");
const { createDirIfDoesntExist, getFullPath } = require("./utils/FileUtils");
const vars = require("./config/vars");

async function start() {
	const downloadsDir = getFullPath("media");
	try {
		await createDirIfDoesntExist(downloadsDir);
		Log.success({
			initiator: "init",
			msg: `[SUCCESS] Created directory: ${downloadsDir}`
		});
	} catch (err) {
		Log.error({
			initiator: "init",
			msg: `[ERROR] Could not create directory: ${downloadsDir}. ${err}`
		});
		return;
	}

	const channel = new Channel(vars.youtube_channel_id, downloadsDir);
	await channel.init();

	const downloadPlaylist = async playlist => {
		await playlist.download();
	};

	async.mapLimit(channel.playlists, 1, downloadPlaylist, (err, result) => {
		if (err) {
			console.log(err);
			Log.error({
				initiator: "startProcess",
				msg: `Failed downloading playlists from ${channel.title}'s channel. ${err}`
			});
			return;
		}
		Log.success({
			initiator: "startProcess",
			msg: `All playlists from ${channel.title}'s channel downloaded successfully.`
		});
	});
};

const messages = new Map();

const handleMessage = (type, data) => {
	messages.set(data.initiator, {
		...data,
		type
	});
	BrowserWindowInstance.get().webContents.send("updateUI", [...messages]);
};

Log.addListener("success", (...args) => {
	handleMessage("success", ...args);
});

Log.addListener("download", (...args) => {
	handleMessage("download", ...args);
});

Log.addListener("error", (...args) => {
	handleMessage("error", ...args);
});

Log.addListener("skip", (...args) => {
	handleMessage("skip", ...args);
});

Log.addListener("playlist", (...args) => {
	handleMessage("playlist", ...args);
});

ipcMain.on("start", function (event, arg) {
	start();
	event.sender.send("btnclick-task-finished", "yes");
});