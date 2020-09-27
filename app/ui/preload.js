const ipcRenderer = require("electron").ipcRenderer;

function submit(event) {
	event.preventDefault();

	const youtubeApiKey = document.getElementById("apiKey").value;
	const channelId = document.getElementById("channelId").value;

	if (youtubeApiKey && channelId) {
		ipcRenderer.send("start", {
			youtubeApiKey,
			channelId
		});
		messageStrip.innerText = "";
	} else {
		messageStrip.innerText = "Fill inputs first!";
	}
}

/**
 * @type {HTMLElement}
 */
let messagesUL = null;

/**
 * @type {HTMLElement}
 */
let messageStrip = null;

const updateUI = (event, messages) => {
	messages.forEach(([key, { msg, type }]) => {
		let li = document.getElementById(key);

		if (!li) {
			li = document.createElement("li");
			li.id = key;
			li.appendChild(document.createTextNode(msg));
			messagesUL.appendChild(li);
		} else {
			const textNode = li.childNodes[0];
			textNode.nodeValue = msg;
		}

		li.className = "";
		li.classList.add(`type-${type}`);
	});
};

window.addEventListener("DOMContentLoaded", () => {
	messagesUL = document.getElementById("messages");
	messageStrip = document.getElementById("messageStrip");
	const form = document.getElementById("form");
	form.addEventListener("submit", submit);

	ipcRenderer.once("prefillSettings", (event, data) => {
		document.getElementById("channelId").value = data.channelId;
		document.getElementById("apiKey").value = data.youtubeApiKey;
		messageStrip.innerText = `Found settings at ${data.settingsPath}`;
	});
	ipcRenderer.send("UILoaded");
	ipcRenderer.on("btnclick-task-finished", function(event, param) {});
	ipcRenderer.on("updateUI", updateUI);
});
