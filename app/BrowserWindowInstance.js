const BrowserWindow = {
	_BrowserWindow: null,
	set: (v) => {
		this._BrowserWindow = v;
	},
	get: () => {
		return this._BrowserWindow;
	}
};

module.exports = BrowserWindow;
