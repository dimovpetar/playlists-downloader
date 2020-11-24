const { app } = require("electron");
const root = app.getPath("home");
const path = require("path");
const fs = require("fs");
const fsp = fs.promises;

const createDirIfDoesntExist = async (dir) => {
	try {
		await fsp.access(dir, fs.constants.F_OK);
		return false;
	} catch (err) {
		// dir doesn't exist
		await fsp.mkdir(dir);
		return true;
	}
};

const getFullPath = (dir) => {
	return path.join(root, dir);
};

const fileExists = async (name) => {
	try {
		await fsp.access(name, fs.constants.F_OK);
		return true;
	} catch (err) {
		return false;
	}
};

const readdir = (name) => {
	return fsp.readdir(name);
};

const unlink = (name) => {
	return fsp.unlink(name);
};

module.exports = {
	createDirIfDoesntExist,
	getFullPath,
	readdir,
	unlink,
	fileExists
};
