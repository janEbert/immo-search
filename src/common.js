// Common functions for parsing and displaying parsed information on
// real estate listing sites.

class ParsedData {
	constructor() {
		this.site = "";
		this.retrievalDate = new Date().toISOString();
		this.title = "";
		this.id = "";
		// Called Object ID at ImmoScout24; does not exist for every real estate
		// listing, so do not know what it is.
		this.estateId = "";
		this.estateType = "";
		this.availableFromDate = "";
		this.availableUntilDate = "";
		// TODO check whether trade offer
		this.floorLevel = "";

		// Misc

		// Location
		this.addressStreet = "";
		this.addressNumber = "";
		this.postalCode = "";
		this.town = "";
		this.region = "";

		// Rent
		this.coldRent = "";
		this.coldRentUnit = "";
		this.totalRent = "";
		this.totalRentUnit = "";
		this.rentDeposit = "";
		this.rentDepositUnit = "";
		this.compensationCosts = "";
		this.compensationCostsUnit = "";

		// Area
		this.floorArea = "";
		this.floorAreaUnit = "";
		this.usableArea = "";
		this.usableAreaUnit = "";

		// Rooms
		this.numRooms = "";
		this.numBathrooms = "";
		this.numBedrooms = "";

		// Amenities
		this.hasCellar = "";
		this.hasElevator = "";
		this.hasKitchen = "";
		this.hasBalcony = "";
		this.hasGarden = "";
		this.hasWashingMachine = "";
		this.hasDishWasher = "";
		this.hasBicycleStorage = "";
		this.availableFurniture = "";
		this.petPolicy = "";
		this.parkingSpots = "";

		// Textual Descriptions
		this.description = "";
		this.amenitiesDescription = "";
		this.locationDescription = "";
		this.miscDescription = "";

		// Calculated later
		this.url = "";
		this.coldRentPerArea = "";
		this.totalRentPerArea = "";
		this.additionalCosts = "";
		this.additionalCostsPerArea = "";
		this.additionalCostsUnit = "";
	}

	calculateRemaining() {
		this.url = this.getUrl();

		this.coldRentPerArea = this.coldRent / this.floorArea;
		this.totalRentPerArea = this.totalRent / this.floorArea;
		this.additionalCosts = this.totalRent - this.coldRent;
		this.additionalCostsPerArea = this.additionalCosts / this.floorArea;

		const totalRentUnit = this.formatTotalRentUnit()[1];
		const coldRentUnit = this.formatColdRentUnit()[1];
		this.additionalCostsUnit = totalRentUnit === coldRentUnit
			? totalRentUnit
			: totalRentUnit + "+" + coldRentUnit;
	}

	formatSite() {
		return ["Seite", this.site];
	}

	formatUrl() {
		return ["URL", this.url];
	}

	formatRetrievalDate() {
		return ["Abgerufen am", isoDateToGerman(this.retrievalDate)];
	}

	formatTitle() {
		return ["Titel", this.title];
	}

	formatId() {
		return ["ID", this.id];
	}

	formatEstateId() {
		return ["Objekt ID", this.estateId];
	}

	formatEstateType() {
		return ["Typ", this.estateType];
	}

	formatAvailableFromDate() {
		return ["Verfügbar ab", isoDateToGerman(this.availableFromDate)];
	}

	formatAvailableUntilDate() {
		return ["Verfügbar bis", isoDateToGerman(this.availableUntilDate)];
	}

	formatFloorLevel() {
		return ["Etage", this.floorLevel];
	}

	formatAddressStreet() {
		return ["Straße", this.addressStreet];
	}

	formatAddressNumber() {
		return ["Hausnummer", this.addressNumber];
	}

	formatPostalCode() {
		return ["PLZ", this.postalCode];
	}

	formatTown() {
		return ["Stadt", this.town];
	}

	formatRegion() {
		return ["Stadtteil", this.region];
	}

	formatColdRent() {
		return [
			"Kalt",
			formatPrice(this.coldRent) + " " + this.formatColdRentUnit()[1]
		];
	}

	formatColdRentPerArea() {
		return [
			"Kalt/Fläche",
			formatPrice(this.coldRentPerArea)
				+ " " + this.formatColdRentUnit()[1]
				+ "/" + this.formatFloorAreaUnit()[1]
		];
	}

	formatColdRentUnit() {
		return ["Kalt Einheit", this.coldRentUnit];
	}

	formatTotalRent() {
		return [
			"Gesamt",
			formatPrice(this.totalRent) + " " + this.formatTotalRentUnit()[1]
		];
	}

	formatTotalRentPerArea() {
		return [
			"Gesamt/Fläche",
			formatPrice(this.totalRentPerArea)
				+ " " + this.formatTotalRentUnit()[1]
				+ "/" + this.formatFloorAreaUnit()[1]
		];
	}

	formatTotalRentUnit() {
		return ["Gesamt Einheit", this.totalRentUnit];
	}

	formatAdditionalCosts() {
		return [
			"NK",
			formatPrice(this.additionalCosts)
				+ " " + this.formatAdditionalCostsUnit()[1]
		];
	}

	formatAdditionalCostsPerArea() {
		return [
			"NK/Fläche",
			formatPrice(this.additionalCostsPerArea)
				+ " " + this.formatAdditionalCostsUnit()[1]
				+ "/" + this.formatFloorAreaUnit()[1]
		];
	}

	formatAdditionalCostsUnit() {
		return ["NK Einheit", this.additionalCostsUnit];
	}

	formatRentDeposit() {
		return [
			"Kaution",
			this.rentDeposit + " " + this.formatRentDepositUnit()[1]
		];
	}

	formatRentDepositUnit() {
		return ["Kaution Einheit", this.rentDepositUnit];
	}

	formatCompensationCosts() {
		return [
			"Ablösevereinbahrung",
			this.compensationCosts + " " + this.formatCompensationCostsUnit()[1]
		];
	}

	formatCompensationCostsUnit() {
		return ["Ablösevereinbahrung Einheit", this.compensationCostsUnit];
	}

	formatFloorArea() {
		return ["Fläche", this.floorArea + " " + this.formatFloorAreaUnit()[1]];
	}

	formatFloorAreaUnit() {
		return ["Fläche Einheit", this.floorAreaUnit];
	}

	formatUsableArea() {
		return [
			"Nutzfläche",
			this.usableArea + " " + this.formatUsableAreaUnit()[1]
		];
	}

	formatUsableAreaUnit() {
		return ["Nutzfläche Einheit", this.usableAreaUnit];
	}

	formatNumRooms() {
		return ["Zimmer", this.numRooms];
	}

	formatNumBathrooms() {
		return ["Badezimmer", this.numBathrooms];
	}

	formatNumBedrooms() {
		return ["Schlafzimmer", this.numBedrooms];
	}

	formatHasCellar() {
		return ["Keller", formatBoolean(this.hasCellar)];
	}

	formatHasElevator() {
		return ["Lift", formatBoolean(this.hasElevator)];
	}

	formatHasKitchen() {
		return ["Küche", formatBoolean(this.hasKitchen)];
	}

	formatHasBalcony() {
		return ["Balkon", formatBoolean(this.hasBalcony)];
	}

	formatHasGarden() {
		return ["Garten", formatBoolean(this.hasGarden)];
	}

	formatHasWashingMachine() {
		return ["Waschmaschine", formatBoolean(this.hasWashingMachine)];
	}

	formatHasDishWasher() {
		return ["Spülmaschine", formatBoolean(this.hasDishWasher)];
	}

	formatHasBicycleStorage() {
		return ["Fahrradkeller", formatBoolean(this.hasBicycleStorage)];
	}

	formatAvailableFurniture() {
		return ["Möblierung", formatBoolean(this.hasAvailableFurniture)];
	}

	formatPetPolicy() {
		return ["Haustiere", this.petPolicy];
	}

	formatParkingSpots() {
		return ["Parkplätze", this.parkingSpots];
	}

	formatDescription() {
		return ["Beschreibung", this.description];
	}

	formatAmenitiesDescription() {
		return ["Ausstattung", this.amenitiesDescription];
	}

	formatLocationDescription() {
		return ["Lage", this.locationDescription];
	}

	formatMiscDescription() {
		return ["Sonstiges", this.miscDescription];
	}

	formatKeys(desiredKeys) {
		const formattedKeys = (
			desiredKeys || Object.getOwnPropertyNames(this)
		).map(function(key) {
			const formatMethodName = (
				"format" + key.charAt(0).toUpperCase() + key.slice(1)
			);
			if (this[formatMethodName] === undefined
				|| typeof this[formatMethodName] !== "function") {
				console.log("Skipping unknown key " + key);
				return null;
			}

			return this[formatMethodName]();
		}.bind(this)).filter(function(value) {
			return value !== null;
		});

		return formattedKeys;
	}

	defaultTableStyle() {
		return "<style>"
			+ "th, td { padding: 1rem; border: 1px black solid; }"
			+ "td > div { max-height: 20rem; overflow: auto; }"
			+ "</style>";
	}

	defaultShownKeys() {
		return [
			"title",
			"region",
			"coldRent",
			"coldRentPerArea",
			"totalRent",
			"totalRentPerArea",
			"additionalCosts",
			"additionalCostsPerArea",
			"numRooms",
			"availableFromDate",
			"availableUntilDate",
			"description",
			"amenitiesDescription",
			"locationDescription",
			"miscDescription",
		];
	}

	async toDefaultHtmlTable() {
		const keys = await loadData("selectedKeys").then(
			(storedData) => {
				if (Object.keys(storedData).length === 0) {
					const keys = this.defaultShownKeys();
					return keys;
				}

				const keys = storedData.selectedKeys;
				return keys;
			},
			(error) => {
				console.log("Load error: " + error);
				const keys = this.defaultShownKeys();
				return keys;
			}
		);

		return this.toHtmlTable(keys);
	}

	toHtmlTable(desiredKeys) {
		const formattedKeys = this.formatKeys(desiredKeys);

		return "<table style=\"margin-bottom: 2rem;\">"
			+ this.defaultTableStyle()
			+ "</thead><tr>"
			+ formattedKeys.map(function(key) {
				return "<th>" + key[0] + "</th>";
			}).join("")
			+ "</tr></thead>"
			+ "<tbody><tr>"
			+ formattedKeys.map(function(key) {
				return "<td><div>" + key[1] + "</div></td>";
			}).join("")
			+ "</tr></tbody>"
			+ "</table>";
	}

	toOrgTableHeader(desiredKeys) {
		const formattedKeys = this.formatKeys(desiredKeys);

		return "| "
			+ formattedKeys.map(function(key) {
				return key[0];
			}).join(" | ")
			+ " |<br>"
			+ "|-";
	}

	getRawKeys(desiredKeys) {
		const values = (
			desiredKeys || Object.getOwnPropertyNames(this)
		).map(function(key) {
			if (Object.prototype.hasOwnProperty.call(this, key)) {
				return this[key];
			}

			console.log("Skipping unknown key " + key);
			return null;
		}.bind(this)).filter(function(value) {
			return value !== null;
		});
		return values;
	}

	toOrgTableRow(desiredKeys) {
		const values = this.getRawKeys(desiredKeys);
		return "| " + values.join(" | ") + " |";
	}

	toJson() {
		return JSON.stringify(this);
	}

	immoscout24Url() {
		return "https://www." + this.site + "/expose/" + this.id;
	}

	wgGesuchtUrl() {
		return "https://www." + this.site + "/" + this.id;
	}

	getUrl() {
		const urlSwitcher = {
			"immobilienscout24.de": this.immoscout24Url,
			"wg-gesucht.de": this.wgGesuchtUrl,
		};

		if (!Object.prototype.hasOwnProperty.call(urlSwitcher, this.site)) {
			console.log("Unknown site!");
			return null;
		}

		return urlSwitcher[this.site].bind(this)();
	}

	getStorageKey() {
		return "i-" + this.site + "/" + this.id;
	}
}


function shortSleep(ms) {
	return new Promise(r => setTimeout(r, ms));
}


function splitAt(text, separator) {
	const separatorIndex = text.indexOf(separator);
	if (separatorIndex === -1) {
		return [text, null];
	}
	const left = text.slice(0, separatorIndex);
	const right = text.slice(separatorIndex + separator.length);
	return [left, right];
}


function splitAtMatch(text, regexp) {
	const matchIndex = text.search(regexp);
	if (matchIndex === -1) {
		return [text, null];
	}
	const left = text.slice(0, matchIndex);
	const right = text.slice(matchIndex);
	return [left, right];
}


function splitAtLast(text, separator) {
	const lastSeparatorIndex = text.lastIndexOf(separator);
	if (lastSeparatorIndex === -1) {
		return [text, null];
	}
	const left = text.slice(0, lastSeparatorIndex);
	const right = text.slice(lastSeparatorIndex + separator.length);
	return [left, right];
}


function parseGermanDecimal(commaText) {
	const periodText = commaText.replace(",", ".");
	const value = parseFloat(periodText, 10);
	return value;
}


function roundPrice(price) {
	if (price === "") {
		return "";
	}
	return parseFloat(price.toFixed(2), 10);
}


function formatPrice(price) {
	if (price === "") {
		return "";
	}
	const roundedPrice = roundPrice(price);
	const formattedPrice = roundedPrice.toFixed(2);
	if (formattedPrice.endsWith(".00")) {
		return formattedPrice.slice(0, -3);
	}
	return formattedPrice;
}


function formatBoolean(bool) {
	return bool ? "Ja" : "Nein";
}


function isGermanDate(date) {
	return /^\d\d?.\d\d?.\d?\d?\d{2}$/.test(date);
}


function germanDateToIso(date) {
	if (!isGermanDate(date)) {
		return date;
	}
	return date.split(".").reverse().join("-");
}


function isoDateToGerman(date) {
	if (date.length <= 10) {
		return date.split("-").reverse().join(".");
	}

	const year = date.slice(0, 4);
	const month = date.slice(5, 7);
	const day = date.slice(8, 10);
	const time = date.slice(11, 19);
	return day + "." + month + "." + year + " " + time + " UTC";
}


function registerClipboard(element) {
	element.addEventListener("click", function() {
		navigator.clipboard.writeText(element.innerText);
	});
}


function storeData(parsedData) {
	const storeObject = {};
	storeObject[parsedData.getStorageKey()] = parsedData;
	return browser.storage.local.set(storeObject);
}


function loadData(keys) {
	return browser.storage.local.get(keys);
}


function removeData(keys) {
	return browser.storage.local.remove(keys);
}


function insertResult(resultText, parentNode, nextSibling, tag) {
	const resultNode = document.createElement(tag || "p");
	resultNode.innerHTML = resultText;
	registerClipboard(resultNode);
	const separator = parentNode.insertBefore(
		document.createElement("hr"),
		nextSibling !== undefined ? nextSibling : parentNode.firstElementChild
	);
	return parentNode.insertBefore(resultNode, separator);
}


function createDetailsNode(summaryText) {
	const detailsNode = document.createElement("details");
	detailsNode.style.marginBottom = "2rem";
	const summaryNode = document.createElement("summary");
	summaryNode.innerHTML = summaryText;
	detailsNode.appendChild(summaryNode);
	return detailsNode;
}


function createRemoveButton(parsedData, label, storeButton) {
	const button = document.createElement("button");
	button.innerHTML = label;
	button.style.padding = "2px";
	button.style.marginBottom = "1rem";
	button.style.marginLeft = "1rem";

	button.addEventListener("click", function() {
		removeData(parsedData.getStorageKey()).then(
			() => {
				console.log("Removed data");
				button.remove();
				storeButton.innerText = "Anzeige speichern";
			},
			(error) => console.log("Error removing data: " + error)
		);
	});
	return button;
}


function insertRemoveButton(parsedData, storeButton) {
	const removeButton = createRemoveButton(
		parsedData,
		"Anzeige löschen",
		storeButton,
	);

	const parentNode = storeButton.parentElement;
	parentNode.insertBefore(removeButton, storeButton.nextElementSibling);
}


function createStoreButton(parsedData, label) {
	const button = document.createElement("button");
	button.innerHTML = label;
	button.style.padding = "2px";
	button.style.marginBottom = "1rem";

	button.addEventListener("click", function() {
		storeData(parsedData).then(
			() => {
				console.log("Stored data");
				button.innerHTML = "Gespeichert";
				insertRemoveButton(parsedData, button);
			},
			(error) => console.log("Error storing data: " + error)
		);
	});
	return button;
}


function insertStoreButton(label, parsedData, parentNode) {
	const storeButton = createStoreButton(parsedData, label);
	return parentNode.insertBefore(storeButton, parentNode.firstElementChild);
}


function deleteChildren(element) {
	while (element.firstElementChild !== null) {
		element.firstElementChild.remove();
	}
}


async function displayData(parsedData, parentNode) {
	const detailsNode = createDetailsNode("> Daten zur Verarbeitung...");
	const detailsChildNode = document.createElement("div");
	detailsChildNode.style.marginTop = "2rem";
	detailsNode.appendChild(detailsChildNode);

	const resultOrgTableHeader = parsedData.toOrgTableHeader();
	insertResult(resultOrgTableHeader, detailsChildNode, null);

	const resultOrgTableRow = parsedData.toOrgTableRow();
	insertResult(resultOrgTableRow, detailsChildNode, null);

	const resultJSONText = parsedData.toJson();
	insertResult(resultJSONText, detailsChildNode, null);

	parentNode.insertBefore(detailsNode, parentNode.firstElementChild);

	const tableContainer = document.createElement("p");
	const resultTable = await parsedData.toDefaultHtmlTable();
	tableContainer.innerHTML = resultTable;
	parentNode.insertBefore(tableContainer, parentNode.firstElementChild);

	loadData(parsedData.getStorageKey()).then(
		(storedData) => {
			if (Object.keys(storedData).length === 0) {
				insertStoreButton("Anzeige speichern", parsedData, parentNode);
				return;
			}

			const storeButton = insertStoreButton(
				"Gespeichert",
				parsedData,
				parentNode,
			);
			insertRemoveButton(parsedData, storeButton);
		},
		(error) => {
			console.log("Load error: " + error);
			insertStoreButton("Anzeige speichern", parsedData, parentNode);
		}
	);
}


// export {
// 	ParsedData,
// 	shortSleep,
// 	splitAt,
// 	splitAtLast,
// 	splitAtMatch,
// 	parseGermanDecimal,
// 	germanDateToIso,
// 	displayData
// };
