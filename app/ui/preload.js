const ipcRenderer = require("electron").ipcRenderer;

/**
 * @type {HTMLElement}
 */
let messagesUL = null;

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
	const btn = document.getElementById("start");
	messagesUL = document.getElementById("messages");

	btn.addEventListener("click", () => {
		ipcRenderer.send("start");
	});

	ipcRenderer.on("btnclick-task-finished", function(event, param) {

	});

	ipcRenderer.on("updateUI", updateUI);
});
