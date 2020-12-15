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


async function parseTitlePhotoDiv(titlePhotoDiv, parsedData) {
	console.log("debug titlephoto");
	const titlePhotoGroupDiv = titlePhotoDiv.firstElementChild
		.nextElementSibling
		.nextElementSibling
		.nextElementSibling;
	const moreThanTitleDiv = titlePhotoGroupDiv.firstElementChild
		  .firstElementChild;
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
	const [addressStreetAndMaybeComma, addressNumber] = splitAtLast(
		address,
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
	const [availableUntilLabel, availableUntilDate] = splitAt(
		availableUntilLabelAndDate,
		": "
	);
	parsedData.availableFromDate = germanDateToIso(availableFromDate);
	parsedData.availableUntilDate = germanDateToIso(availableUntilDate);
}


function parseAmenitiesOverviewDiv(amenitiesOverviewDiv, parsedData) {
	// TODO
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

	const amenitiesOverviewDiv = estateOverviewDiv.nextElementSibling
		  .nextElementSibling
		  .nextElementSibling
		  .nextElementSibling
		  .nextElementSibling
		  .nextElementSibling;
	parseAmenitiesOverviewDiv(amenitiesOverviewDiv, parsedData);

	const descriptionOverviewDiv = amenitiesOverviewDiv.nextElementSibling
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

	console.log("debug 7");
	parsedData.calculateRemaining();
	console.log(parsedData);
	window.parsedData = parsedData;

	displayData(parsedData, contentDiv);

	return parsedData;
}


async function main() {
	// await shortSleep(1000);

	console.log("Starting enhancements!");
	await enhanceWGG();
	console.log("Enhancements done!");
}


// window.addEventListener("load", main);
main();
