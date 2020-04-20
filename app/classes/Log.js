const EventEmitter = require("events");

class Log extends EventEmitter {
	error({ initiator, msg }) {
		this.emit("error", {
			initiator,
			msg
		});
	}

	success({ initiator, msg }) {
		this.emit("success", {
			initiator,
			msg
		});
	}

	download({ initiator, msg }) {
		this.emit("download", {
			initiator,
			msg
		});
	}

	skip({ initiator, msg }) {
		this.emit("skip", {
			initiator,
			msg
		});
	}

	playlist({ initiator, msg }) {
		this.emit("playlist", {
			initiator,
			msg
		});
	}
}

module.exports = new Log();
