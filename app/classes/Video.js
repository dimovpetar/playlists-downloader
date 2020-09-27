const sanitize = require("sanitize-filename");
const ytdl = require("ytdl-core");
const Ffmpeg = require("fluent-ffmpeg");
let ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
// electron know issue
ffmpegPath = ffmpegPath.replace("app.asar", "app.asar.unpacked");
const Log = require("./Log");
const { hmsToSecondsOnly } = require("../utils/TimeUtils");
const { fileExists, unlink } = require("../utils/FileUtils");
const translitbg = require("translitbg");

class Video {
	constructor(id, name) {
		this.id = id;
		this.fileName = translitbg.go(sanitize(name + ".mp3", { replacement: "_" }));
		this.url = `https://www.youtube.com/watch?v=${id}`;
		this.length = 0;
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
			const stream = ytdl(this.url, {
				format: "mp4"
			}).on("info", (e) => {
				this.length = parseFloat(e.videoDetails.lengthSeconds);
			});

			let currLength = 0;
			const proc = new Ffmpeg({
				source: stream,
				timeout: 60
			});
			proc.setFfmpegPath(ffmpegPath);

			proc.on("start", (commandLine) => {
				Log.download({
					initiator: this.id,
					msg: `[DOWNLOAD] ${this.fileName} 0%`
				});
			}).on("progress", e => {
				currLength = hmsToSecondsOnly(e.timemark);
				const percents = Math.round(currLength * 100 / this.length);
				Log.download({
					initiator: this.id,
					msg: `[DOWNLOAD] ${this.fileName} ${percents}%`
				});
			}).on("error", err => {
				Log.error({
					initiator: this.id,
					msg: `[ERROR]: Downloading ${this.fileName} failed. ${err}`
				});
				unlink(fullfileName)
					.then(() => {
						reject(err);
					})
					.catch((_err) => {
						reject(err);
					});
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
