const async = require("async");
const Video = require("./Video");
const { init } = require("../youtube");
const Log = require("./Log");
const { createDirIfDoesntExist, readdir, unlink } = require("../utils/FileUtils");

class Playlist {
	constructor(id, title, parentDir) {
		this.id = id;
		this.title = title;
		this.videos = [];
		this.playlistDir = `${parentDir}/${this.title}`;
		this.totalResults = 0;
	}

	async init() {
		try {
			const newDirCreated = await createDirIfDoesntExist(this.playlistDir);
			if (newDirCreated) {
				Log.success({
					initiator: this.id + "-1",
					msg: `[SUCCESS] Created directory: ${this.playlistDir}.`
				});
			} else {
				Log.skip({
					initiator: this.id + "-1",
					msg: `[SKIP] Directory: ${this.playlistDir} already exists.`
				});
			}
		} catch (err) {
			Log.error({
				initiator: this.id + "-1",
				msg: `[ERROR] Could not create directory: ${this.playlistDir}. ${err}`
			});
			throw err;
		}

		let videos = [];
		let nextPageToken = null;

		do {
			const youtube = await init();
			const { data } = await youtube.playlistItems.list({
				playlistId: this.id,
				part: "snippet,contentDetails",
				maxResults: 50,
				pageToken: nextPageToken
			});

			videos = videos.concat(data.items);
			nextPageToken = data.nextPageToken;
			this.totalResults = data.pageInfo.totalResults;
		} while (nextPageToken);

		this.videos = videos.map(video => {
			return new Video(video.snippet.resourceId.videoId, video.snippet.position + "_" + video.snippet.title);
		});
	}

	async download() {
		const downloadVideo = async (video) => {
			await video.download(`${this.playlistDir}`);
		};

		Log.playlist({
			initiator: this.id + "-2",
			msg: `PLAYLIST ${this.title}`
		});

		await this.deleteUnliked();
		await new Promise((resolve, reject) => {
			async.mapLimit(this.videos, 5, downloadVideo, (err, results) => {
				if (err) {
					Log.error({
						initiator: this.id + "-3",
						msg: `[ERROR] Downloading playlist ${this.title} failed. ${err}`
					});
				} else {
					Log.success({
						initiator: this.id + "-3",
						msg: `[SUCCESS] Downloading playlist ${this.title} completed.\n`
					});
				}

				resolve();
			});
		});
	}

	async deleteUnliked() {
		let filesInDir = [];

		try {
			filesInDir = await readdir(this.playlistDir);
		} catch (err) {
			Log.error({
				initiator: this.id,
				msg: `[ERROR] Could not ls directory. ${err}.`
			});
			throw err;
		}

		const videosInPlaylist = this.videos.map(video => video.fileName);
		const deleteFileIfDoesntExist = async (file) => {
			if (!videosInPlaylist.includes(file)) {
				await unlink(`${this.playlistDir}/${file}`);
				Log.success({
					initiator: this.id + file,
					msg: `[DELETE] ${file}. The song doesn't occur in the playlist anymore.`
				});
			}
		};

		await new Promise((resolve, reject) => {
			async.map(filesInDir, deleteFileIfDoesntExist, (err, res) => {
				if (err) {
					Log.error({
						initiator: this.id + err.message, // find better id
						msg: `[ERROR] Problem when deleting. ${err}.`
					});
					reject(err);
					return;
				}
				resolve();
			});
		});
	}
}

module.exports = Playlist;
