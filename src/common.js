// Common functions for parsing and displaying parsed information on
// real estate listing sites.


class ParsedData {
	constructor() {
		this.site = "";
		this.title = "";
		this.id = "";
		// Called Object ID at ImmoScout24; does not exist for every real estate
		// listing, so do not know what it is.
		this.estateId = "";
		this.estateType = "";
		this.availableFromDate = "";
		this.availableUntilDate = "";

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
		this.petPolicy = "";
		this.parkingSpots = "";

		// Textual Descriptions
		this.description = "";
		this.amenitiesDescription = "";
		this.locationDescription = "";
		this.miscDescription = "";

		// Calculated later
		this.coldRentPerArea = "";
		this.totalRentPerArea = "";
		this.additionalCosts = "";
		this.additionalCostsPerArea = "";
		this.additionalCostsUnit = "";
	}

	calculateRemaining() {
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
		return ["Kalt", this.coldRent + " " + this.formatColdRentUnit()[1]];
	}

	formatColdRentPerArea() {
		return [
			"Kalt/Fläche",
			roundPrice(this.coldRentPerArea)
				+ " " + this.formatColdRentUnit()[1]
				+ "/" + this.formatFloorAreaUnit()[1]
		];
	}

	formatColdRentUnit() {
		return ["Kalt Einheit", this.coldRentUnit];
	}

	formatTotalRent() {
		return ["Gesamt", this.totalRent + " " + this.formatTotalRentUnit()[1]];
	}

	formatTotalRentPerArea() {
		return [
			"Gesamt/Fläche",
			roundPrice(this.totalRentPerArea)
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
			this.additionalCosts + " " + this.formatAdditionalCostsUnit()[1]
		];
	}

	formatAdditionalCostsPerArea() {
		return [
			"NK/Fläche",
			roundPrice(this.additionalCostsPerArea)
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
		return ["Ablösevereinbahrung", this.compensationCostsUnit];
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
		return ["Keller", this.hasCellar ? "Ja" : "Nein"];
	}

	formatHasElevator() {
		return ["Lift", this.hasElevator ? "Ja" : "Nein"];
	}

	formatHasKitchen() {
		return ["Küche", this.hasKitchen ? "Ja" : "Nein"];
	}

	formatHasBalcony() {
		return ["Balkon", this.hasBalcony ? "Ja" : "Nein"];
	}

	formatHasGarden() {
		return ["Garten", this.hasGarden ? "Ja" : "Nein"];
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

	toDefaultHtmlTable() {
		const keys = [
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

		return urlSwitcher[this.site]();
	}

	getStorageKey() {
		return this.site + "/" + this.id;
	}
}


function shortSleep(ms) {
	return new Promise(r => setTimeout(r, ms));
}


function splitAt(text, separator) {
	const separatorIndex = text.indexOf(separator);
	const left = text.slice(0, separatorIndex);
	const right = text.slice(separatorIndex + separator.length);
	return [left, right];
}


function splitAtMatch(text, regexp) {
	const matchIndex = text.search(regexp);
	const left = text.slice(0, matchIndex);
	const right = text.slice(matchIndex);
	return [left, right];
}


function splitAtLast(text, separator) {
	const lastSeparatorIndex = text.lastIndexOf(separator);
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
	return parseFloat(price.toFixed(2), 10);
}


function germanDateToIso(date) {
	if (!/^\d\d?.\d\d?.\d?\d?\d{2}$/.test(date)) {
		return date;
	}
	return date.split(".").reverse().join("-");
}


function isoDateToGerman(date) {
	return date.split("-").reverse().join(".");
}


function registerClipboard(element) {
	element.addEventListener("click", function() {
		navigator.clipboard.writeText(element.innerText);
	});
}


function storeData(parsedData) {
	const storeObject = {};
	storeObject[parsedData.getStorageKey()] = parsedData;
	browser.storage.local.set(storeObject);
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
	const summaryNode = document.createElement("summary");
	summaryNode.innerHTML = summaryText;
	detailsNode.appendChild(summaryNode);
	return detailsNode;
}


function createStoreButton(parsedData) {
	const button = document.createElement("button");
	button.innerHTML = "Anzeige Speichern";
	button.style.padding = "2px";
	button.style.marginBottom = "1rem";

	button.addEventListener("click", function() {
		storeData(parsedData);
	});
	return button;
}


function displayData(parsedData, parentNode) {
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
	const resultTable = parsedData.toDefaultHtmlTable();
	tableContainer.innerHTML = resultTable;
	parentNode.insertBefore(tableContainer, parentNode.firstElementChild);

	const storeButton = createStoreButton(parsedData);
	parentNode.insertBefore(storeButton, parentNode.firstElementChild);
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

