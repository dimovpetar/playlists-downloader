const sanitize = require("sanitize-filename");
const ytdl = require("ytdl-core");
const Ffmpeg = require("fluent-ffmpeg");
const Log = require("./Log");
const { hmsToSecondsOnly } = require("../utils/TimeUtils");
const { fileExists } = require("../utils/FileUtils");

class Video {
	constructor(id, name) {
		this.id = id;
		this.fileName = sanitize(name + ".mp3", { replacement: "_" });
		this.url = `https://www.youtube.com/watch?v=${id}`;
	};

	async download(dir) {
		const fullfileName = `${dir}/${this.fileName}`;
		const exists = await fileExists(fullfileName);
		if (exists) {
			Log.skip({
				initiator: this.id,
				msg: `[SKIP] ${this.fileName} already exists.`
			});
			return;
		}

		await new Promise((resolve, reject) => {
			let length = 0;
			const stream = ytdl(this.url, {
				format: "mp4"
			}).on("info", (e) => {
				length = e.length_seconds;
			});

			const proc = new Ffmpeg({ source: stream });
			proc.setFfmpegPath("/usr/bin/ffmpeg");
			proc.on("start", (commandLine) => {
				Log.download({
					initiator: this.id,
					msg: `[DOWNLOAD] ${this.fileName} 0%`
				});
			}).on("progress", e => {
				const current = hmsToSecondsOnly(e.timemark);
				const percents = Math.round(current * 100 / length);
				Log.download({
					initiator: this.id,
					msg: `[DOWNLOAD] ${this.fileName} ${percents}%`
				});
			}).on("error", err => {
				Log.error({
					initiator: this.id,
					msg: `[ERROR]: Downloading ${this.fileName} failed. ${err}`
				});
				reject(err);
			}).on("end", () => {
				Log.success({
					initiator: this.id,
					msg: `[SUCCESS] Downloading ${this.fileName} completed.`
				});
				resolve();
			}).save(fullfileName);
		});
	}
}

module.exports = Video;
