// Content Script for "*://www.wg-gesucht.de/*"

// import {
// 	ParsedData,
// 	shortSleep,
// 	splitAt,
// 	splitAtMatch,
// 	splitAtLast,
// 	parseGermanDecimal,
// 	germanDateToIso,
// 	displayData
// } from "./common.js";


function findMoreThanTitleDiv(titlePhotoDiv) {
	const noPicturesTitleDiv = document.getElementById("noImagesTeaser");
	if (noPicturesTitleDiv !== null) {
		return noPicturesTitleDiv.firstElementChild;
	}

	const unloadedPicturesTitleDiv = document.getElementById("sliderTopTitle");
	if (unloadedPicturesTitleDiv !== null) {
		return unloadedPicturesTitleDiv;
	}

	const titlePhotoGroupDiv = titlePhotoDiv.firstElementChild
		.nextElementSibling
		.nextElementSibling
		.nextElementSibling;
	const moreThanTitleDiv = titlePhotoGroupDiv.firstElementChild
		  .firstElementChild;
	return moreThanTitleDiv;
}


async function parseTitlePhotoDiv(titlePhotoDiv, parsedData) {
	console.log("debug titlephoto");

	const moreThanTitleDiv = findMoreThanTitleDiv(titlePhotoDiv);
	while (moreThanTitleDiv.innerText.trim() === "") {
		await shortSleep(500);
	}

	const moreThanTitle = moreThanTitleDiv.innerText;
	const title = moreThanTitle.trim();
	parsedData.title = title;
}


function parseMainCriteriaDiv(mainCriteriaDiv, parsedData) {
	const floorAreaGroupDiv = mainCriteriaDiv.firstElementChild
		  .nextElementSibling;
	const floorAreaDiv = floorAreaGroupDiv.firstElementChild;
	const floorAreaAndUnit = floorAreaDiv.innerText;
	const [floorArea, floorAreaUnit] = splitAtMatch(
		floorAreaAndUnit,
		/[^.,0-9]+$/
	);
	parsedData.floorArea = parseGermanDecimal(floorArea);
	parsedData.floorAreaUnit = floorAreaUnit;

	const totalRentGroupDiv = floorAreaGroupDiv.nextElementSibling;
	const totalRentDiv = totalRentGroupDiv.firstElementChild;
	const totalRentAndUnit = totalRentDiv.innerText;
	const [totalRent, totalRentUnit] = splitAtMatch(
		totalRentAndUnit,
		/[^.,0-9]+$/
	);
	parsedData.totalRent = parseGermanDecimal(totalRent);
	parsedData.totalRentUnit = totalRentUnit;
}


function parseEstateOverviewDiv(estateOverviewDiv, parsedData) {
	const costOverviewDiv = estateOverviewDiv.firstElementChild;
	const coldRentRow = costOverviewDiv.firstElementChild
		  .nextElementSibling
		  .firstElementChild
		  .firstElementChild;
	const coldRentDiv = coldRentRow.firstElementChild
		  .nextElementSibling
		  .firstElementChild;
	const coldRentAndUnit = coldRentDiv.innerText;
	const [coldRent, coldRentUnit] = splitAtMatch(
		coldRentAndUnit,
		/[^.,0-9]+$/
	);
	parsedData.coldRent = parseGermanDecimal(coldRent);
	parsedData.coldRentUnit = coldRentUnit;

	const additionalCostsRow = coldRentRow.nextElementSibling;
	const otherCostsRow = additionalCostsRow.nextElementSibling;
	const rentDepositRow = otherCostsRow.nextElementSibling;
	const compensationCostsRow = otherCostsRow.nextElementSibling;

	const addressOverviewDiv = costOverviewDiv.nextElementSibling;
	const addressDiv = addressOverviewDiv.firstElementChild
		  .nextElementSibling;
	const addressAndNewline = addressDiv.innerText;
	// Strip trailing newline
	const address = addressAndNewline.slice(0, -1);

	const [addressStreetAndNumber, postalCodeTownAndRegion] = (
		splitAt(address, "\n")
	);
	// Not a given that there's a number
	const [addressStreetAndMaybeComma, addressNumber] = splitAtLast(
		addressStreetAndNumber,
		" "
	);
	const addressStreet = addressStreetAndMaybeComma.slice(-1) === ","
		  ? addressStreetAndMaybeComma.slice(0, -1)
		  : addressStreetAndMaybeComma;
	parsedData.addressStreet = addressStreet;
	parsedData.addressNumber = addressNumber;

	const [postalCode, townAndRegion] = splitAt(
		postalCodeTownAndRegion,
		" "
	);
	parsedData.postalCode = postalCode;
	// TODO brittle if region contains space
	const [town, region] = splitAtLast(
		townAndRegion,
		" "
	);
	parsedData.town = town;
	parsedData.region = region;

	const availabilityOverviewDiv = addressOverviewDiv.nextElementSibling;
	const availabilityDiv = availabilityOverviewDiv.firstElementChild
		  .nextElementSibling;
	const availableFromAndUntilDateAndNewline = availabilityDiv.innerText;
	// Strip trailing newline
	const availableFromAndUntilDate = availableFromAndUntilDateAndNewline.slice(
		0,
		-1
	);

	const [availableFromLabelAndDate, availableUntilLabelAndDate] = (
		splitAt(availableFromAndUntilDate, "\n")
	);
	const [availableFromLabel, availableFromDate] = splitAt(
		availableFromLabelAndDate,
		": "
	);
	parsedData.availableFromDate = germanDateToIso(availableFromDate);

	if (availableUntilLabelAndDate !== null) {
		const [availableUntilLabel, availableUntilDate] = splitAt(
			availableUntilLabelAndDate,
			": "
		);
		if (isGermanDate(availableUntilDate)) {
			parsedData.availableUntilDate = germanDateToIso(availableUntilDate);
		}
	}
}


function handleOptionalCreditAd(estateOverviewDiv) {
	const maybeMoreThanCreditAdDiv = estateOverviewDiv.nextElementSibling;
	const maybeSharedFlatOverviewDiv = estateOverviewDiv.nextElementSibling
		  .nextElementSibling
		  .nextElementSibling
		  .nextElementSibling
		  .nextElementSibling;

	if (maybeMoreThanCreditAdDiv.className === "row") {
		return maybeSharedFlatOverviewDiv.nextElementSibling;
	}
	return maybeSharedFlatOverviewDiv;
}


function parseOptionalSharedFlatOverview(maybeSharedFlatOverviewDiv) {
	const maybeSharedFlatTitleGroupDiv = maybeSharedFlatOverviewDiv
		  .firstElementChild;

	if (maybeSharedFlatTitleGroupDiv.innerText.trim() !== "WG-Details") {
		return maybeSharedFlatOverviewDiv;
	}

	return maybeSharedFlatOverviewDiv.nextElementSibling.nextElementSibling;
}


function storeAttributeCallback(attribute) {
	return function (parsedData, value) {
		parsedData[attribute] = value;
	};
}


function storeBooleanTagCallback(tagAttribute) {
	return function (parsedData) {
		parsedData[tagAttribute] = true;
	};
}


function parseHasKitchen(parsedData, text) {
	if (text === "Nicht vorhanden") {
		return;
	}
	parsedData.hasKitchen = true;
}


function parseAmenity(amenity, parsedData, amenityTranslations) {
	if (!Object.prototype.hasOwnProperty.call(amenityTranslations,
											  amenity)) {
		console.log("WARNING: Unknown amenity '" + amenity
					+ "'. Skipping...");
		return;
	}

	amenityTranslations[amenity](parsedData, amenity);
}


function parseAmenities(parsedData, text) {
	const amenityTranslations = {
		"Waschmaschine": storeBooleanTagCallback("hasWashingMachine"),
		"Spülmaschine": storeBooleanTagCallback("hasDishWasher"),
		"Balkon": storeBooleanTagCallback("hasBalcony"),
		"Terrasse": storeBooleanTagCallback("hasBalcony"),
		"Garten": storeBooleanTagCallback("hasGarden"),
		"Gartenmitbenutzung": storeBooleanTagCallback("hasGarden"),
		"Keller": storeBooleanTagCallback("hasCellar"),
		"Fahrradkeller": storeBooleanTagCallback("hasBicycleStorage"),
		"Haustiere erlaubt": storeAttributeCallback("petPolicy"),
		"Aufzug": storeBooleanTagCallback("hasElevator"),
	};

	for (const amenity of text.split(", ")) {
		parseAmenity(amenity, parsedData, amenityTranslations);
	}
}


function parseCriteriaTagListItemDiv(
	criteriaTagListItemDiv,
	criteriaTagGroupDiv,
	parsedData,
	switcher,
) {
	if (criteriaTagGroupDiv === null
		|| !criteriaTagGroupDiv.hasAttribute("class")
		|| criteriaTagGroupDiv.classList.length < 2) {
		return;
	}

	const secondClass = criteriaTagGroupDiv.classList[1];
	if (secondClass === "glyphicons-info-sign") {
		const nextSibling = criteriaTagGroupDiv.nextElementSibling;
		if (nextSibling !== null
			&& nextSibling.hasAttribute("class")
			&& nextSibling.classList.length >= 2
			&& Object.prototype.hasOwnProperty.call(
				switcher,
				nextSibling.classList[1]
			)) {

			parseCriteriaTagListItemDiv(
				criteriaTagListItemDiv,
				nextSibling,
				parsedData,
				switcher,
			);
			return;
		}
	}

	if (!Object.prototype.hasOwnProperty.call(switcher, secondClass)) {
		console.log("WARNING: Unknown tag '" + secondClass + "'. Skipping...");
		return;
	}

	const moreThanTag = criteriaTagGroupDiv.innerText;
	const tagText = moreThanTag.trim();

	switcher[secondClass](parsedData, tagText);
}


function parseCriteriaTagsOverviewDiv(criteriaTagsOverviewDiv, parsedData) {
	const switcher = {
		// e.g. "Bedarfsausweis, Gas, Baujahr 1990, Energieeffizienzklasse B"
		// "glyphicons-electricity": null
		// e.g. "WG geeignet"
		// "glyphicons-group": null
		// e.g. "Mehrfamilienhaus" or "sanierter Altbau"
		"glyphicons-mixed-buildings": storeAttributeCallback("estateType"),
		// e.g. "2. OG"
		"glyphicons-building": storeAttributeCallback("floorLevel"),
		// e.g. "teilmöbliert"
		"glyphicons-bed": storeAttributeCallback("availableFurniture"),
		// e.g. "Eigene Küche" or "Nicht vorhanden"
		"glyphicons-dining-set": parseHasKitchen,
		// e.g. "Badewanne" or "Eigenes Bad, Dusche"
		// "glyphicons-bath-bathtub": null,
		// e.g. "DSL, Flatrate, WLAN schneller als 100 Mbit/s"
		// "glyphicons-wifi-alt": null,
		// e.g. "Kabel"
		// "glyphicons-display": null,
		// e.g. "Laminat, Fliesen"
		// "glyphicons-fabric": null,
		// e.g. "Ökostrom"
		// "glyphicons-leaf": null,
		// e.g. "Fernwärme"
		// "glyphicons-fire": null,
		// e.g. "gute Parkmöglichkeiten", "Bewohnerparken"
		"glyphicons-car": storeAttributeCallback("parkingSpots"),
		// e.g. "2 Minuten zu Fuß entfernt"
		// "glyphicons-bus": null,
		// e.g. "Waschmaschine, Keller, Fahrradkeller"
		"glyphicons-folder-closed": parseAmenities,
		// "Eigene Küche": storeBooleanTagCallback("hasKitchen"),
		// "Keller": storeBooleanTagCallback("hasCellar"),
		// "Personenaufzug": storeBooleanTagCallback("hasElevator"),
		// "Balkon/ Terrasse": storeBooleanTagCallback("hasBalcony"),
		// "Garten/ -mitbenutzung": storeBooleanTagCallback("hasGarden"),
	};

	let criteriaTagsDiv = criteriaTagsOverviewDiv.firstElementChild
		.firstElementChild
		.nextElementSibling;

	for (const criteriaTagListItemDiv of criteriaTagsDiv.children) {
		parseCriteriaTagListItemDiv(
			criteriaTagListItemDiv,
			criteriaTagListItemDiv.firstElementChild,
			parsedData,
			switcher,
		);
	}
}


function parseDescription(parsedData) {
	// (id "freitext_0_content")
	const descriptionDiv = document.getElementById("freitext_0_content");
	if (descriptionDiv === null) {
		return;
	}

	const description = descriptionDiv.innerText;
	parsedData.description = description;
}


function parseLocationDescription(parsedData) {
	// (id "freitext_1_content")
	const locationDescriptionDiv = document.getElementById("freitext_1_content");
	if (locationDescriptionDiv === null) {
		return;
	}

	const locationDescription = locationDescriptionDiv.innerText;
	parsedData.locationDescription = locationDescription;
}


function parseMiscDescription(parsedData) {
	// (id "freitext_3_content")
	const miscDescriptionDiv = document.getElementById("freitext_3_content");
	if (miscDescriptionDiv === null) {
		return;
	}

	const miscDescription = miscDescriptionDiv.innerText;
	parsedData.miscDescription = miscDescription;
}


function parseDescriptions(parsedData) {
	parseDescription(parsedData);
	parseLocationDescription(parsedData);
	parseMiscDescription(parsedData);
}


function parseDescriptionOverviewDiv(descriptionOverviewDiv, parsedData) {
	// (id "freitext_0")
	const descriptionGroupDiv = descriptionOverviewDiv.firstElementChild
		  .firstElementChild
		  .firstElementChild
		  .nextElementSibling
		  .nextElementSibling
		  .nextElementSibling
		  .nextElementSibling;

	// FIXME these arbitrarily move around, so better just use ids
	// FIXME some may be missing (optional)
	// (id "freitext_0_content")
	const descriptionDiv = descriptionGroupDiv.firstElementChild
		  .nextElementSibling;
	const description = descriptionDiv.innerText;
	parsedData.description = description;

	// (id "freitext_1")
	const locationDescriptionGroupDiv = descriptionGroupDiv.nextElementSibling;
	// (id "freitext_1_content")
	const locationDescriptionDiv = descriptionGroupDiv.firstElementChild
		  .nextElementSibling;
	const locationDescription = locationDescriptionDiv.innerText;
	parsedData.locationDescription = locationDescription;

	// (id "freitext_3")
	const miscDescriptionGroupDiv = locationDescriptionGroupDiv
		  .nextElementSibling;
	// (id "freitext_3_content")
	const miscDescriptionDiv = miscDescriptionGroupDiv.firstElementChild
		  .nextElementSibling;
	const miscDescription = miscDescriptionDiv.innerText;
	parsedData.miscDescription = miscDescription;
}


function parseBasicInformationDiv(basicInformationDiv, parsedData) {
	const numRoomsDiv = basicInformationDiv.firstElementChild
		  .firstElementChild
		  .firstElementChild
		  .nextElementSibling
		  .firstElementChild;
	const numRooms = numRoomsDiv.innerText;
	parsedData.numRooms = parseGermanDecimal(numRooms);
}


function parseContactOverviewDiv(contactOverviewDiv, parsedData) {
	const contactInformationDiv = contactOverviewDiv.firstElementChild
		  .nextElementSibling;

	const idDiv = contactInformationDiv.nextElementSibling
		  .nextElementSibling
		  .nextElementSibling
		  .nextElementSibling
		  .nextElementSibling;
	const id = idDiv.innerText;
	parsedData.id = id;
}


async function parseContentDiv(contentDiv, parsedData) {
	const flatOverviewDiv = contentDiv.firstElementChild;
	const titlePhotoDiv = flatOverviewDiv.firstElementChild
		  .nextElementSibling
		  .firstElementChild
		  .firstElementChild
		  .nextElementSibling
		  .nextElementSibling
		  .nextElementSibling
		  .nextElementSibling;
	await parseTitlePhotoDiv(titlePhotoDiv, parsedData);

	const mainCriteriaDiv = titlePhotoDiv.nextElementSibling;
	parseMainCriteriaDiv(mainCriteriaDiv, parsedData);

	const estateOverviewDiv = mainCriteriaDiv.nextElementSibling
		  .nextElementSibling;
	parseEstateOverviewDiv(estateOverviewDiv, parsedData);

	const maybeSharedFlatOverviewDiv = handleOptionalCreditAd(
		estateOverviewDiv
	);
	const criteriaTagsOverviewDiv = parseOptionalSharedFlatOverview(
		maybeSharedFlatOverviewDiv
	);

	parseCriteriaTagsOverviewDiv(criteriaTagsOverviewDiv, parsedData);

	const descriptionOverviewDiv = criteriaTagsOverviewDiv.nextElementSibling
		  .nextElementSibling;
	// parseDescriptionOverviewDiv(descriptionOverviewDiv, parsedData);
	parseDescriptions(parsedData);

	const basicInformationDiv = descriptionOverviewDiv.nextElementSibling
		  .nextElementSibling;
	parseBasicInformationDiv(basicInformationDiv, parsedData);

	const contactOverviewDiv = flatOverviewDiv.nextElementSibling
		  .firstElementChild
		  .nextElementSibling
		  .firstElementChild
		  .nextElementSibling
		  .firstElementChild;
	parseContactOverviewDiv(contactOverviewDiv, parsedData);
}


async function enhanceWGG() {
	const parsedData = new ParsedData();

	parsedData.site = "wg-gesucht.de";
	console.log("debug");
	const contentDiv = document.getElementById("main_content");
	await parseContentDiv(contentDiv, parsedData);

	parsedData.calculateRemaining();
	console.log(parsedData);
	window.parsedData = parsedData;

	displayData(parsedData, contentDiv);

	return parsedData;
}


async function main() {
	if (document.getElementById("WG-Pictures") === null
		&& document.getElementById("noImagesTeaser") === null
		&& document.getElementById("freitext_0_content") === null) {
		console.log("We are not on an individual listing page.");
		return;
	}
	// await shortSleep(1000);

	console.log("Starting enhancements!");
	await enhanceWGG();
	console.log("Enhancements done!");
}


// window.addEventListener("load", main);
main();
