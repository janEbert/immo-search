// Content Script for "*://www.immobilienscout24.de/expose/*"

// import {
// 	ParsedData,
// 	shortSleep,
// 	splitAt,
// 	splitAtLast,
// 	parseGermanDecimal,
// 	germanDateToIso,
// 	displayData
// } from "./common.js";


function getFullDescription(descriptionPre) {
	// Click "show more" button automatically to get full object description
	const descriptionShowMoreA = descriptionPre
		  .nextElementSibling
		  .firstElementChild;
	descriptionShowMoreA.click();
	// Wait for the click to work through the code.
	// TODO maybe necessary
	// await shortSleep(500);
	const description = descriptionPre.innerText;
	return description;
}


function parsePhotoContactIdDiv(photoContactIdDiv, parsedData) {
	const photoOverviewDiv = photoContactIdDiv.firstElementChild
		  .firstElementChild;
	const contactOverviewDiv = photoOverviewDiv.nextElementSibling;

	const idOverviewDiv = contactOverviewDiv.nextElementSibling;
	const idsDiv = idOverviewDiv.firstElementChild
		  .firstElementChild
		  .firstElementChild;
	const ids = idsDiv.innerText;
	if (ids.startsWith("Objekt")) {
		const [objectLabelAndId, scoutLabelAndId] = splitAt(ids, " | ");
		const [objectLabel, objectId] = splitAt(objectLabelAndId, ": ");
		parsedData.estateId = objectId;

		if (scoutLabelAndId.startsWith("Scout")) {
			const [scoutLabel, scoutId] = splitAt(scoutLabelAndId, ": ");
			parsedData.id = scoutId;
		}
	} else {
		const [scoutLabel, scoutId] = ids.split(": ", 2);
		parsedData.id = scoutId;
	}
}


function parsePostalInformation(postalInformationDiv, parsedData) {
	const postalInformation = postalInformationDiv.innerText;
	const [postalCodeAndTown, region] = splitAt(postalInformation, ", ");
	parsedData.region = region;
	const [postalCode, town] = splitAt(postalCodeAndTown, " ");
	parsedData.postalCode = postalCode;
	parsedData.town = town;
}


function parseTitleAddressDiv(titleAddressDiv, parsedData) {
	// Title
	const titleDiv = titleAddressDiv.firstElementChild;
	const title = titleDiv.innerText;
	parsedData.title = title;

	// Address
	const addressDiv = titleDiv.nextElementSibling
		  .firstElementChild
		  .nextElementSibling
		  .firstElementChild
		  .firstElementChild
		  .firstElementChild;

	console.log("debug 2");
	const maybeStreetAddressDiv = addressDiv.firstElementChild;
	const maybePostalInformationDiv = maybeStreetAddressDiv.nextElementSibling;
	if (maybePostalInformationDiv.innerText === "\nDie vollständige Adresse der "
		+ "Immobilie erhalten Sie vom Anbieter.") {
		parsePostalInformation(maybeStreetAddressDiv, parsedData);
		return;
	}

	// Remove comma at end
	const addressStreetAndNumber = maybeStreetAddressDiv.innerText.slice(0, -1);
	const [addressStreet, addressNumber] = splitAtLast(
		addressStreetAndNumber,
		" "
	);
	parsedData.addressStreet = addressStreet;
	parsedData.addressNumber = addressNumber;

	parsePostalInformation(maybePostalInformationDiv, parsedData);
}


function parseMainCriteriaDiv(mainCriteriaDiv, parsedData) {
	// Cold Rent per Month
	const coldRentGroupDiv = mainCriteriaDiv.firstElementChild;
	const coldRentDiv = coldRentGroupDiv.firstElementChild
		  .firstElementChild;
	// Remove space symbol and unit
	const coldRentAndUnit = coldRentDiv.innerText;
	const [coldRent, coldRentUnit] = splitAtLast(coldRentAndUnit, " ");
	parsedData.coldRent = parseGermanDecimal(coldRent);
	parsedData.coldRentUnit = coldRentUnit;

	// Number of Rooms
	const numRoomsGroupDiv = coldRentGroupDiv.nextElementSibling;
	const numRoomsDiv = numRoomsGroupDiv.firstElementChild;
	const numRooms = numRoomsDiv.innerText;
	parsedData.numRooms = parseGermanDecimal(numRooms);

	// Floor Area
	const floorAreaGroupDiv = numRoomsGroupDiv.nextElementSibling;
	const floorAreaDiv = floorAreaGroupDiv.firstElementChild;
	// Remove space symbol and unit
	const floorAreaAndUnit = floorAreaDiv.innerText;
	const [floorArea, floorAreaUnit] = splitAtLast(floorAreaAndUnit, " ");
	parsedData.floorArea = parseGermanDecimal(floorArea);
	parsedData.floorAreaUnit = floorAreaUnit;
}


function parseCriteriaTagDiv(criteriaTagDiv, parsedData, tagTranslations) {
	const tagText = criteriaTagDiv.innerText;
	if (!Object.prototype.hasOwnProperty.call(tagTranslations, tagText)) {
		console.log("WARNING: Unknown tag '" + tagText + "'. Skipping...");
		return;
	}

	parsedData[tagTranslations[tagText]] = true;
}


function parseCriteriaTagsDiv(criteriaTagsDiv, parsedData) {
	const tagTranslations = {
		"Keller": "hasCellar",
		"Personenaufzug": "hasElevator",
		"Einbauküche": "hasKitchen",
		"Balkon/ Terrasse": "hasBalcony",
		"Garten/ -mitbenutzung": "hasGarden",
	};

	for (const criteriaTagDiv of criteriaTagsDiv.children) {
		parseCriteriaTagDiv(criteriaTagDiv, parsedData, tagTranslations);
	}
}


function parseEstateType(estateTypeGroupDiv, parsedData) {
	// Type Div

	// Type Title (class "is24qa-typ-label")
	// innerText should be "Typ"
	const estateTypeTitleDiv = estateTypeGroupDiv.firstElementChild;
	// Type (class "is24qa-typ")
	const estateTypeDd = estateTypeTitleDiv.nextElementSibling;
	const estateType = estateTypeDd.innerText;
	parsedData.estateType = estateType;

	return estateTypeGroupDiv;
}


function parseFloorLevel(floorLevelGroupDiv, parsedData) {
	// Floor Level Div

	// Floor Level Title (class "is24qa-etage-label")
	// innerText should be "Etage"
	const floorLevelTitleDiv = floorLevelGroupDiv.firstElementChild;
	// Floor Level (class "is24qa-etage")
	const floorLevelDd = floorLevelTitleDiv.nextElementSibling;
	// May be something like "3 von 4"
	const floorLevel = floorLevelDd.innerText;
	parsedData.floorLevel = floorLevel;

	return floorLevelGroupDiv;
}


function parseLivingArea(livingAreaGroupDiv, parsedData) {
	// Living Area Div

	// Living Floor Area Title (class "is24qa-wohnflaeche-ca-label")
	// innerText should be "Wohnfläche ca."
	const livingAreaTitleDiv = livingAreaGroupDiv.firstElementChild;
	// Living Floor Area (class "is24qa-wohnflaeche-ca")
	const livingAreaDd = livingAreaTitleDiv.nextElementSibling;
	// We already have this stored as floorArea

	return livingAreaGroupDiv;
}


function parseUsableArea(usableAreaGroupDiv, parsedData) {
	// Usable Area Area Div

	// Usable Area Area Title (class "is24qa-nutzflaeche-ca-label")
	// innerText should be "Nutzfläche ca."
	const usableAreaTitleDiv = usableAreaGroupDiv.firstElementChild;
	// Usable Area Area (class "is24qa-nutzflaeche-ca")
	const usableAreaDd = usableAreaTitleDiv.nextElementSibling;
	const usableAreaAndUnit = usableAreaDd.innerText;
	const [usableArea, usableAreaUnit] = splitAtLast(usableAreaAndUnit, " ");
	parsedData.usableArea = parseGermanDecimal(usableArea, 10);
	parsedData.usableAreaUnit = usableAreaUnit;

	return usableAreaGroupDiv;
}


function parseAvailableFromDate(availableFromDateGroupDiv, parsedData) {
	// Available from Date Div

	// Available from Date Title (class = "is24qa-bezugsfrei-ab-label")
	// innerText should be "Bezugsfrei ab"
	const availableFromDateTitleDiv = availableFromDateGroupDiv.firstElementChild;
	// Available from Date (class = "is24qa-bezugsfrei-ab")
	const availableFromDateDd = availableFromDateTitleDiv.nextElementSibling;
	const availableFromDate = availableFromDateDd.innerText;
	parsedData.availableFromDate = germanDateToIso(availableFromDate);

	return availableFromDateGroupDiv;
}


function parseNumRooms(numRoomsGroupDiv, parsedData) {
	// Number of Rooms Div

	// Number of Rooms Title (class "is24qa-zimmer-label")
	// innerText should be "Zimmer"
	const numRoomsTitleDiv = numRoomsGroupDiv.firstElementChild;
	// Number of Rooms (class "is24qa-zimmer")
	const numRoomsDd = numRoomsTitleDiv.nextElementSibling;
	// We already have this stored as numRooms

	return numRoomsGroupDiv;
}


function parseNumBathrooms(numBathroomsGroupDiv, parsedData) {
	// Number of Bathrooms Div

	// Number of Bathrooms Title (class "is24qa-badezimmer-label")
	// innerText should be "Badezimmer"
	const numBathroomsTitleDiv = numBathroomsGroupDiv.firstElementChild;
	// Number of Bathrooms (class "is24qa-badezimmer")
	const numBathroomsDd = numBathroomsTitleDiv.nextElementSibling;
	const numBathrooms = numBathroomsDd.innerText;
	parsedData.numBathrooms = parseInt(numBathrooms, 10);

	return numBathroomsGroupDiv;
}


function parseNumBedrooms(numBedroomsGroupDiv, parsedData) {
	// Number of Bedrooms Div

	// Number of Bedrooms Title (class "is24qa-schlafzimmer-label")
	// innerText should be "Schlafzimmer"
	const numBedroomsTitleDiv = numBedroomsGroupDiv.firstElementChild;
	// Number of Bedrooms (class "is24qa-schlafzimmer")
	const numBedroomsDd = numBedroomsTitleDiv.nextElementSibling;
	const numBedrooms = numBedroomsDd.innerText;
	parsedData.numBedrooms = parseInt(numBedrooms, 10);

	return numBedroomsGroupDiv;
}


function parsePetPolicy(petPolicyGroupDiv, parsedData) {
	// Pet Policy Div

	// Pet Policy Title (class "is24qa-haustiere-label")
	// innerText should be "Haustiere"
	const petPolicyTitleDiv = petPolicyGroupDiv.firstElementChild;
	// Pet Policy (class "is24qa-haustiere")
	const petPolicyDd = petPolicyTitleDiv.nextElementSibling;
	const petPolicy = petPolicyDd.innerText;
	parsedData.petPolicy = petPolicy;

	return petPolicyGroupDiv;
}


function parseParkingSpots(parkingSpotsGroupDiv, parsedData) {
	// Parking Spots Div

	// Parking Spots Title (class "is24qa-garage-stellplatz-label")
	// innerText should be "Garage/ Stellplatz"
	const parkingSpotsTitleDiv = parkingSpotsGroupDiv.firstElementChild;
	// Parking Spots (class "is24qa-garage-stellplatz")
	const parkingSpotsDd = parkingSpotsTitleDiv.nextElementSibling;
	const parkingSpots = parkingSpotsDd.innerText;
	parsedData.parkingSpots = parkingSpots;

	return parkingSpotsGroupDiv;
}


function parseOptionalRemainingInformation(startNode, parsedData, switcher) {
	if (startNode === null || startNode.firstElementChild === null
		|| startNode.tagName.toLowerCase() !== "dl") {
		return startNode;
	}

	const firstChild = startNode.firstElementChild;
	if (firstChild.hasAttribute("id")) {
		const id = "id-" + firstChild.getAttribute("id");
		if (Object.prototype.hasOwnProperty.call(switcher, id)) {
			return switcher[id](startNode, parsedData);
		}
	}

	if (firstChild.hasAttribute("class")) {
		const firstClass = "class-" + firstChild.classList[0];
		if (Object.prototype.hasOwnProperty.call(switcher, firstClass)) {
			return switcher[firstClass](startNode, parsedData);
		}
	}

	console.log("WARNING! Unknown optional remaining information! Skipping...");
	return startNode;
}


function parseOptionalRemainingInformationList(
	firstOptionalRemainingInformation,
	parsedData
) {
	const switcher = {
		"class-is24qa-typ-label": parseEstateType,
		"class-is24qa-etage-label": parseFloorLevel,
		"class-is24qa-wohnflaeche-label": parseLivingArea,
		"class-is24qa-nutzflaeche-label": parseUsableArea,
		"class-is24qa-bezugsfrei-ab-label": parseAvailableFromDate,
		"class-is24qa-zimmer-label": parseNumRooms,
		"class-is24qa-badezimmer-label": parseNumBathrooms,
		"class-is24qa-schlafzimmer-label": parseNumBedrooms,
		"class-is24qa-haustiere-label": parsePetPolicy,
		"class-is24qa-garage-stellplatz-label": parseParkingSpots,
	};

	let currentNode = firstOptionalRemainingInformation;
	while (currentNode !== null) {
		const previousSibling = parseOptionalRemainingInformation(
			currentNode,
			parsedData,
			switcher,
		);
		currentNode = previousSibling.nextElementSibling;
	}
}


function maybeParseInternetSpeedDiv(internetSpeedDiv, parsedData) {
	// Internet Speed may be missing
	if (document.getElementById("expose-media-availability-container")
		=== null) {
		// We skip over a script tag
		return internetSpeedDiv.nextElementSibling;
	}

	// We skip over a script tag
	return internetSpeedDiv.nextElementSibling.nextElementSibling;
}


function parseRemainingInformationDiv(remainingInformationDiv, parsedData) {
	// Estate Overview (Type, Availability Date, Detailed Room Listing, ...)
	const estateOverviewDiv = remainingInformationDiv.firstElementChild;

	const firstOptionalRemainingInformation = estateOverviewDiv
		  .firstElementChild;
	parseOptionalRemainingInformationList(
		firstOptionalRemainingInformation,
		parsedData
	);

	// Premium Stats
	const premiumStatsDiv = maybeParseInternetSpeedDiv(
		estateOverviewDiv.nextElementSibling,
		parsedData,
	);

	// Cost Overview
	const costOverviewTitleDiv = premiumStatsDiv.nextElementSibling;
	const costOverviewDiv = costOverviewTitleDiv.nextElementSibling;

	console.log("debug 5");
	// Rent Overview
	const rentOverviewDiv = costOverviewDiv.firstElementChild.firstElementChild;

	// Total Rent per Month
	const totalRentGroupDiv = rentOverviewDiv.lastElementChild;
	// Total Rent Title (class "is24qa-gesamtmiete-label")
	// TODO probably better to get by classname
	const totalRentTitleDiv = totalRentGroupDiv.firstElementChild;
	// Total Rent (class "is24qa-gesamtmiete")
	const totalRentDiv = totalRentTitleDiv.nextElementSibling;
	const totalRentAndUnit = totalRentDiv.innerText;
	// Thousands are separated by a period; splitting at first space is fine.
	const [totalRent, totalRentUnit] = splitAt(totalRentAndUnit, " ");
	// Thousands are separated by a period; simply remove those.
	parsedData.totalRent = parseGermanDecimal(totalRent.replace(/./g, ""));
	parsedData.totalRentUnit = totalRentUnit;

	// Rent Deposit Overview
	const rentDepositOverviewDiv = rentOverviewDiv.nextElementSibling;
	// FIXME parse this
}

function parseStructuredDetailsDiv(structuredDetailsDiv, parsedData) {
	// Title and Address
	const titleAddressDiv = structuredDetailsDiv.firstElementChild;
	parseTitleAddressDiv(titleAddressDiv, parsedData);

	console.log("debug 3");
	// Main Criteria (Rent, Rooms, Area)
	const mainCriteriaDiv = titleAddressDiv.nextElementSibling;
	parseMainCriteriaDiv(mainCriteriaDiv, parsedData);

	// Criteria Tags (has Balcony/has Kitchen/...)
	const criteriaTagsDiv = mainCriteriaDiv.nextElementSibling;
	parseCriteriaTagsDiv(criteriaTagsDiv, parsedData);

	console.log("debug 4");
	// Remaining Information (Type, Level, Availability Date, Cost, ...)
	const remainingInformationDiv = criteriaTagsDiv.nextElementSibling;
	parseRemainingInformationDiv(remainingInformationDiv, parsedData);
}


function parseObjectDescription(textualDescriptionTitleDiv, parsedData) {
	// Object Description Title (class "is24qa-objektbeschreibung-label")
	// innerText should be "Objektbeschreibung"

	// Object Description Div
	const textualDescriptionGroupDiv = textualDescriptionTitleDiv
		  .nextElementSibling;

	// Object Description Text (class "is24qa-objektbeschreibung")
	const textualDescriptionPre = textualDescriptionGroupDiv.firstElementChild;
	const description = getFullDescription(textualDescriptionPre);
	parsedData.description = description;

	return textualDescriptionGroupDiv;
}


function parseFloorPlanLinks(floorPlanListDiv, parsedData) {
	// TODO only first link
	const floorPlanLinkItem = floorPlanListDiv.firstElementChild;
	const floorPlanLinkA = floorPlanLinkItem.firstElementChild
		  .nextElementSibling;
	const floorPlanLink = floorPlanLinkA.getAttribute("href");
	const floorPlanLinkText = floorPlanLinkA.innerText;
}


function parseFloorPlanImages(floorPlanGroupDiv, parsedData) {
	// Floor Plan Images
	// TODO only first image (don't know how to get others)
	const floorPlanImages = floorPlanGroupDiv.firstElementChild
		  .firstElementChild
		  .nextElementSibling
		  .nextElementSibling
		  .nextElementSibling
		  .firstElementChild
		  .firstElementChild
		  .firstElementChild
		  .firstElementChild
		  .firstElementChild;
	if (!floorPlanImages.hasAttribute("src")) {
		console.log("Wrong DOM walk towards floor plan image");
	}
}


function parseFloorPlan(floorPlanOverviewDiv, parsedData) {
	// Floor Plan Div (id "is24-ex-floorplans")

	// Floor Plan Title
	// innerText should be "Grundrisse"
	const floorPlanTitle = floorPlanOverviewDiv.firstElementChild;

	// Can be either link list or images
	const floorPlanGroupDiv = floorPlanTitle.nextElementSibling;
	const floorPlanListDiv = floorPlanGroupDiv.firstElementChild;

	if (floorPlanListDiv.classList.length > 0
		&& floorPlanListDiv.classList[0] === "is24-linklist") {
		parseFloorPlanLinks(floorPlanListDiv, parsedData);
	} else {
		parseFloorPlanImages(floorPlanGroupDiv, parsedData);
	}

	return floorPlanOverviewDiv;
}


function parseAmenitiesDescription(amenitiesDescriptionTitleDiv, parsedData) {
	// Amenities Description Title (class "is24qa-ausstattung-label")
	// innerText should be "Ausstattung"

	// Amenities Description Div
	const amenitiesDescriptionGroupDiv = amenitiesDescriptionTitleDiv
		  .nextElementSibling;
	// Amenities Description Text (class "is24qa-ausstattung")
	const amenitiesDescriptionPre = amenitiesDescriptionGroupDiv
		  .firstElementChild;
	const amenitiesDescription = getFullDescription(amenitiesDescriptionPre);
	parsedData.amenitiesDescription = amenitiesDescription;

	return amenitiesDescriptionGroupDiv;
}


function parseLocationDescription(locationDescriptionTitleDiv, parsedData) {
	// Location Description Title (class "is24qa-lage-label")
	// innerText should be "Lage"

	// Location Description Div
	const locationDescriptionGroupDiv = locationDescriptionTitleDiv
		  .nextElementSibling;
	// Location Description Text (class "is24qa-lage")
	const locationDescriptionPre = locationDescriptionGroupDiv
		  .firstElementChild;
	const locationDescription = getFullDescription(locationDescriptionPre);
	parsedData.locationDescription = locationDescription;

	return locationDescriptionGroupDiv;
}


function parseMiscDescription(miscDescriptionTitleDiv, parsedData) {
	// Miscellaneous Description Div (class "is24qa-sonstiges-label")
	// innerText should be "Sonstiges"

	// Miscellaneous Description Div
	const miscDescriptionGroupDiv = miscDescriptionTitleDiv.nextElementSibling;

	// The above may not exist so be very careful about handling it.
	if (miscDescriptionGroupDiv === null
		|| miscDescriptionGroupDiv.tagName.toLowerCase() !== "div") {
		return miscDescriptionGroupDiv;
	}
	if (miscDescriptionGroupDiv.tagName.toLowerCase() !== "div") {
		return miscDescriptionGroupDiv;
	}

	// Miscellaneous Description Text (class "is24qa-sonstiges")
	const miscDescriptionPre = miscDescriptionGroupDiv.firstElementChild;

	if (miscDescriptionPre === null
		|| miscDescriptionPre.tagName.toLowerCase() !== "pre"
		|| miscDescriptionPre.classList[0] !== "is24qa-sonstiges") {
		return miscDescriptionGroupDiv;
	}

	const miscDescription = getFullDescription(miscDescriptionPre);
	parsedData.miscDescription = miscDescription;

	return miscDescriptionGroupDiv;
}


function parseAdditionalLinks(additionalLinksGroupDiv, parsedData) {
	// class "print-hide"

	// Additional Links Title
	// innerText should be "Ergänzende Links"
	const additionalLinksTitle = additionalLinksGroupDiv.firstElementChild;
	// Additional Links List (class "is24-linklist")
	const additionalLinksList = additionalLinksTitle.nextElementSibling;
	// TODO only first additional link
	// TODO (get nextelementsibling of additionallinkslist.firstelementchild
	// for second)
	const additionalLinksA = additionalLinksList.firstElementChild
		  .firstElementChild;
	const additionalLinks = additionalLinksA.getAttribute("href");
	const additionalLinksText = additionalLinksA.innerText;

	return additionalLinksGroupDiv;
}


function parseTenantDocuments(tenantDocumentsGroupDiv, parsedData) {
	// Tenant Documents (id "is24-tenant-documents-widget")

	// Tenant Documents Row
	const tenantDocumentsRowDiv = tenantDocumentsGroupDiv.firstElementChild
		  .firstElementChild
		  .nextElementSibling
		  .firstElementChild;
	// TODO only first document
	// TODO (get nextelementsibling of tenantDocumentsRowDiv.firstelementchild
	// for second)
	const tenantDocumentsImageDiv = tenantDocumentsRowDiv.firstElementChild
		  .firstElementChild
		  .firstElementChild
		  .firstElementChild;
	const tenantDocumentsButton = tenantDocumentsImageDiv.firstElementChild;
	if (tenantDocumentsButton.hasAttribute("disabled")) {
		// TODO document is not desired; so skip
	}
	const tenantDocumentsText = tenantDocumentsImageDiv.nextElementSibling
		  .firstElementChild
		  .firstElementChild;
	const tenantDocuments = tenantDocumentsText.innerText;

	return tenantDocumentsGroupDiv;
}


function parseOptionalDescription(startNode, parsedData) {
	if (startNode === null || startNode.tagName.toLowerCase() === "script") {
		return startNode;
	}

	const switcher = {
		"class-is24qa-objektbeschreibung-label": parseObjectDescription,
		"id-is24-ex-floorplans": parseFloorPlan,
		"class-is24qa-ausstattung-label": parseAmenitiesDescription,
		"class-is24qa-lage-label": parseLocationDescription,
		"class-is24qa-sonstiges-label": parseMiscDescription,
		"class-print-hide": parseAdditionalLinks,
		"id-is24-tenant-documents-widget": parseTenantDocuments,
	};

	if (startNode.hasAttribute("id")) {
		const id = "id-" + startNode.getAttribute("id");
		if (Object.prototype.hasOwnProperty.call(switcher, id)) {
			return switcher[id](startNode, parsedData);
		}
	}

	if (startNode.hasAttribute("class")) {
		const firstClass = "class-" + startNode.classList[0];
		if (Object.prototype.hasOwnProperty.call(switcher, firstClass)) {
			return switcher[firstClass](startNode, parsedData);
		}
	}

	console.log("WARNING! Unknown optional description! Skipping...");
	return startNode;
}


function parseContentDiv(contentDiv, parsedData) {
	// Photos, Contact and IDs
	const photoContactIdDiv = contentDiv.firstElementChild;
	parsePhotoContactIdDiv(photoContactIdDiv, parsedData);

	// Details
	const detailsDiv = photoContactIdDiv.nextElementSibling;

	// Structured Information
	const structuredDetailsDiv = detailsDiv.firstElementChild;
	parseStructuredDetailsDiv(structuredDetailsDiv, parsedData);

	// Textual Descriptions
	// Here, some may exist or not. For example, complete groups may be missing
	// or only the text for the "Others" heading may not exist.

	console.log("debug 6");
	let previousSibling = structuredDetailsDiv;
	while (previousSibling !== null) {
		previousSibling = parseOptionalDescription(
			previousSibling.nextElementSibling,
			parsedData
		);
	}
}


function enhanceIS24() {
	const parsedData = new ParsedData();

	parsedData.site = "immobilienscout24.de";
	console.log("debug");
	const contentDiv = document.getElementById("is24-content");
	parseContentDiv(contentDiv, parsedData);

	console.log("debug 7");
	parsedData.calculateRemaining();
	console.log(parsedData);
	window.parsedData = parsedData;

	displayData(parsedData, contentDiv);

	return parsedData;
}


async function main() {
	while (document.getElementById("is24-page-loaded") === null) {
		await shortSleep(500);
	}
	// await shortSleep(1000);

	console.log("Starting enhancements!");
	enhanceIS24();
	console.log("Enhancements done!");
}


// window.addEventListener("load", main);
main();
