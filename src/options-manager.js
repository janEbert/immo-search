function handleDragstart(event) {
	const source = event.target;
	event.dataTransfer.setData("text/plain", source.id);
	console.log(source.id);
	event.dataTransfer.effectAllowed = "move";
}


function handleDragover(event) {
	event.preventDefault();
}


function handleDragenter(event) {
	const target = event.target.nodeName === "#text"
		  ? event.target.parentElement
		  : event.target;

	if (target.className !== "dropzone") {
		return;
	}

	event.dataTransfer.dropEffect = "move";
	target.style.borderTop = "2px solid black";
}


function handleDragleave(event) {
	const target = event.target.nodeName === "#text"
		  ? event.target.parentElement
		  : event.target;

	if (target.className !== "dropzone") {
		return;
	}

	target.style.borderTop = null;
}


function handleDrop(event) {
	event.preventDefault();
	const sourceId = event.dataTransfer.getData("text/plain");
	const target = event.target;
	console.log(sourceId);
	console.log(target.id);

	const keysList = event.target.parentElement;
	const source = document.getElementById(sourceId);
	keysList.insertBefore(source, target);

	handleDragleave(event);
}


function getKeyId(key) {
	return "key-" + key;
}


function createDraggableListItem(key, label) {
	const listItem = document.createElement("li");
	listItem.setAttribute("id", getKeyId(key));
	listItem.innerText = label;

	listItem.className = "dropzone";
	listItem.setAttribute("draggable", "true");
	listItem.addEventListener("dragstart", handleDragstart);
	listItem.addEventListener("dragover", handleDragover);
	listItem.addEventListener("dragenter", handleDragenter);
	listItem.addEventListener("dragleave", handleDragleave);
	listItem.addEventListener("drop", handleDrop);

	return listItem;
}


function fillListsUsing(shownKeys, emptyData) {
	const selectedKeysList = document.getElementById("selected-keys");
	deleteChildren(selectedKeysList);

	const formattedShownKeys = emptyData.formatKeys(shownKeys)
		  .map((e) => e[0]);
	for (let i = 0; i < shownKeys.length; ++i) {
		const key = shownKeys[i];
		const formattedKey = formattedShownKeys[i];
		const listItem = createDraggableListItem(key, formattedKey);
		selectedKeysList.append(listItem);
	}

	// Available

	const availableKeysList = document.getElementById("available-keys");
	deleteChildren(availableKeysList);

	const availableKeys = [];
	for (const key of Object.keys(emptyData)) {
		if (document.getElementById(getKeyId(key)) !== null) {
			continue;
		}
		availableKeys.push(key);
	}
	const formattedAvailableKeys = emptyData.formatKeys(availableKeys)
		  .map((e) => e[0]);

	for (let i = 0; i < availableKeys.length; ++i) {
		const key = availableKeys[i];
		const formattedKey = formattedAvailableKeys[i];
		const listItem = createDraggableListItem(key, formattedKey);
		availableKeysList.append(listItem);
	}
}


async function fillLists() {
	const emptyData = new ParsedData();

	const shownKeys = await loadData("selectedKeys").then(
		(storedData) => {
			if (Object.keys(storedData).length === 0) {
				const shownKeys = emptyData.defaultShownKeys();
				return shownKeys;
			}

			const shownKeys = storedData.selectedKeys;
			return shownKeys;
		},
		(error) => {
			console.log("Load error: " + error);
			const shownKeys = emptyData.defaultShownKeys();
			return shownKeys;
		}
	);

	fillListsUsing(shownKeys, emptyData);
}


function updateStoredSelectedKeys(selectedKeys) {
	const storedDataTable = document.getElementById("stored-data");
	const storedDataTableBody = storedDataTable.firstElementChild
		  .nextElementSibling;

	for (const tableRow of storedDataTableBody) {
		const keyData = tableRow.firstElementChild;
		if (keyData.innerText !== "selectedKeys") {
			continue;
		}

		const valueData = keyData.nextElementSibling;
		valueData.innerText = selectedKeys;
	}
}


function saveOptions() {
	const selectedKeysList = document.getElementById("selected-keys");

	const selectedKeys = [];
	for (const listItem of selectedKeysList.children) {
		const keyId = listItem.getAttribute("id");
		const key = keyId.slice(4);

		selectedKeys.push(key);
	}

	browser.storage.local.set({selectedKeys}).then(function() {
		updateStoredSelectedKeys(selectedKeys);
	});
}


function registerMaybeDelete(element) {
	element.addEventListener("click", function() {
		const key = element.innerText;
		if (!confirm("Zeile mit Schlüssel\n" + key + "\nwirklich löschen?")) {
			return;
		}

		removeData(key).then(element.parentElement.remove());
	});
}


function createTableRow(key, value) {
	const tableRow = document.createElement("tr");

	const keyData = document.createElement("td");
	keyData.innerText = key;
	registerMaybeDelete(keyData);
	tableRow.appendChild(keyData);

	const valueData = document.createElement("td");
	valueData.innerText = value;
	valueData.style.maxWidth = "100vw";
	registerClipboard(valueData);
	tableRow.appendChild(valueData);
	return tableRow;
}


async function fillStoredData() {
	const table = document.getElementById("stored-data");
	const tableBody = table.firstElementChild.nextElementSibling;
	deleteChildren(tableBody);

	const data = await loadData().catch(
		(error) => console.log("Error loading " + error)
	);

	for (const key of Object.keys(data)) {
		const tableRow = createTableRow(key, JSON.stringify(data[key]));
		tableBody.appendChild(tableRow);
	}
}


function resetOptions() {
	const emptyData = new ParsedData();
	const selectedKeys = emptyData.defaultShownKeys();

	browser.storage.local.set({selectedKeys}).then(
		function() {
			fillLists();
			updateStoredSelectedKeys(selectedKeys);
		},
		(error) => console.log("Error resetting options: " + error)
	);
}


function maybeClearData() {
	if (!confirm("*Alle* gespeicherten Daten löschen?\n"
				+ "Das beinhaltet auch alle gespeicherten Immobilien!")) {
		return;
	}

	browser.storage.local.clear().then(
		() => {
			fillLists();
			fillStoredData();
		},
		(error) => console.log("Error clearing data: " + error)
	);
}


function initSaveOptionsButton() {
	const button = document.getElementById("save-options");
	button.addEventListener("click", saveOptions);
}


function initResetOptionsButton() {
	const button = document.getElementById("reset-options");
	button.addEventListener("click", resetOptions);
}


function initClearDataButton() {
	const button = document.getElementById("clear-data");
	button.addEventListener("click", maybeClearData);
}


function main() {
	fillLists();
	fillStoredData();
	initSaveOptionsButton();
	initResetOptionsButton();
	initClearDataButton();
}


window.addEventListener("load", main);
