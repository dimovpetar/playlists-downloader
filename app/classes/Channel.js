
const Playlist = require("./Playlist");
const { init } = require("../youtube");

class Channel {
	constructor (id, dir) {
		this.id = id;
		this.playlists = [];
		this.title = "";
		this.dir = dir;
	}

	async init() {
		const youtube = await init();
		const { data: { items: playlists } } = await youtube.playlists.list({
			channelId: this.id,
			part: "id,snippet"
		});

		this.title = playlists[0].snippet.channelTitle;

		this.playlists = playlists.map(playlist => {
			return new Playlist(playlist.id, playlist.snippet.title, this.dir);
		});

		await Promise.all(this.playlists.map(playlist => playlist.init()));
	}
}

module.exports = Channel;
