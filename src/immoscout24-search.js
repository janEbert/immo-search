// Content Script for "*://www.immobilienscout24.de/Suche/*"


const site = "immobilienscout24.de";


function parseTitleA(titleA, parsedData) {
	const titleDiv = titleA.firstElementChild;
	const title = titleDiv.innerText;
	parsedData.title = title;
}


function parseColdRentGroupDiv(coldRentGroupDiv, parsedData) {
	const coldRentDiv = coldRentGroupDiv.firstElementChild;
	const coldRentAndUnit = coldRentDiv.innerText;
	const [coldRent, coldRentUnit] = splitAt(coldRentAndUnit, " ");
	parsedData.coldRent = parseGermanDecimal(coldRent, /\./g);
	parsedData.coldRentUnit = coldRentUnit;
}


function parseFloorAreaGroupDiv(floorAreaGroupDiv, parsedData) {
	const floorAreaDiv = floorAreaGroupDiv.firstElementChild;
	const floorAreaAndUnit = floorAreaDiv.innerText;
	const [floorArea, floorAreaUnit] = splitAtLast(floorAreaAndUnit, " ");
	parsedData.floorArea = parseGermanDecimal(floorArea);
	parsedData.floorAreaUnit = floorAreaUnit;
}


function parseNumRoomsGroupDiv(numRoomsGroupDiv, parsedData) {
	const numRoomsDiv = numRoomsGroupDiv.firstElementChild
		  .firstElementChild
		  .firstElementChild
		  .nextElementSibling;
	const numRooms = numRoomsDiv.innerText;
	// TODO Should we just remove all of this?
	// Attribute is deleted as we can't really do anything with it.
	// parsedData.numRooms = parseGermanDecimal(numRooms);
}


function parseSearchResult(searchResult, parsedData) {
	const scoutId = searchResult.getAttribute("data-id");
	parsedData.id = scoutId;

	const titleA = searchResult.firstElementChild
		  .firstElementChild
		  .firstElementChild
		  .nextElementSibling
		  .firstElementChild
		  .firstElementChild
		  .nextElementSibling
		  .nextElementSibling;
	parseTitleA(titleA, parsedData);

	// class "result-list-entry__criteria"
	const mainCriteriaOverviewDiv = titleA.nextElementSibling
		  .nextElementSibling
		  .nextElementSibling;
	const mainCriteriaGroupDiv = mainCriteriaOverviewDiv.firstElementChild;

	const coldRentGroupDiv = mainCriteriaGroupDiv.firstElementChild;
	parseColdRentGroupDiv(coldRentGroupDiv, parsedData);

	const floorAreaGroupDiv = coldRentGroupDiv.nextElementSibling;
	parseFloorAreaGroupDiv(floorAreaGroupDiv, parsedData);

	const numRoomsGroupDiv = floorAreaGroupDiv.nextElementSibling;
	parseNumRoomsGroupDiv(numRoomsGroupDiv, parsedData);

	return mainCriteriaOverviewDiv;
}


function enhanceSearchResult(searchResult) {
	if (!searchResult.hasAttribute("data-id")) {
		return;
	}

	const parsedData = new MainParsedData();
	parsedData.site = site;

	const resultAnchor = parseSearchResult(searchResult, parsedData);

	parsedData.calculateRemaining();
	displayMainParsedData(parsedData, resultAnchor, ["coldRentPerArea"]);
}


function enhanceSearchResultList(searchResultList) {
	for (const searchResult of searchResultList.children) {
		enhanceSearchResult(searchResult);
	}
}


function enhanceIs24Search() {
	const searchResultList = document.getElementById("resultListItems");
	enhanceSearchResultList(searchResultList);
}


async function main() {
	while (document.getElementById("is24-page-loaded") === null) {
		await shortSleep(500);
	}
	// FIXME This is not going to work for long. Figure out when the listings do
	// not get JS-updated anymore.
	await shortSleep(2000);

	console.log("Starting enhancements!");
	enhanceIs24Search();
	console.log("Enhancements done!");
}


// window.addEventListener("load", main);
main();
