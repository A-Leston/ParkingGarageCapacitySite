//public_html/js/garages.js
// This is the code for homepage view (garages.html); upon loading page, msyql is queried to pull up the latest garage percent info and display it to user. showGarages is also called upon clicking Refresh button
// displaying indiv garage info using modal popup--modal content uses same route/similar html table generation scheme as admin page 

const urlPrefix="http://35.243.163.3";
let toggleStatus = "Student"; //default case of student only spots
showGarages();
document.getElementById("toggle").addEventListener("change", () => {toggleFunc();});
document.getElementById("refreshButton").addEventListener("click", () => {showGarages();});
document.getElementById("adminLogin").addEventListener("click", () => {location.href = urlPrefix + "/login.html";});

//basic modal close config (taken from w3schools.com modal tutorial)
let modal = document.getElementById("garageModal");
window.addEventListener("click", event => {if (event.target == modal) { modal.style.display = "none";} });


let currentGarage = "";


function toggleFunc() {
	if(document.getElementById('toggle').checked) {
        	console.log("switched to faculty");
		toggleStatus = "Faculty";
		showGarages(); // refresh page
    	}
	else {
        	console.log("switched to student");
		toggleStatus = "Student";
		showGarages(); // refresh page
    	}

	// if modal is currently displaying floor info at time of toggle, the modal's content gets refreshed too
	if (document.getElementById("garageModal").style.display!="none"){
		showAGarage();
	}
}


function showGarages() {
	let AJAX = new XMLHttpRequest();
	AJAX.onerror = function(){
		alert('ajax network error');
	}

	AJAX.onload = function() { //receive the queried info as json from gAP route call
		if (this.status == 200){
			let resObj = JSON.parse(this.responseText);
			let info = resObj.garages;
			// put the queried info into HTML display format (for each item aka garage in the queried resobj, generate and populate 2 divs: 1 for garage Name and one for Percent bar)
			let table = document.getElementById("garages");
			table.innerHTML = ""; // clearing whatever was there before. need for proper refresh after toggle change
			let i = 0;
			for (entry of info) {
				let nameRow = table.insertRow();
				nameRow.setAttribute("class", "garageLabel");
				let name = nameRow.insertCell();
				name.setAttribute("class", "nameCell");
				name.innerHTML = "<a class='modalLinks' href='#'>" + entry.GarageName + "</a>"; 

				let percentRow = table.insertRow();
				let percent = percentRow.insertCell();
				percent.setAttribute("class", "progShell");
				percent.style.backgroundColor="#96c3ed";

				let modified_percent = parseFloat(entry.Percent*100).toFixed(0); //ariel's code to truncate%
				percent.innerHTML = "<div class='progBar' style='width:"
						 + modified_percent + "%; background: linear-gradient(#121a8a , #565cba); color:#FFFFFF; text-align:right; padding-top:10px; padding-bottom:10px; padding-right: 10px;'>"
						+ modified_percent + "% full</div>";
				i= i+1;
			} //for

			//after showGarages is done printing table, attach eventlisteners (click=> open modal+call getfloordata) to all the garagenames' hrefs
			let modalLinks = document.getElementsByClassName("modalLinks");
			for (var j=0; j < modalLinks.length; j++) {
				modalLinks[j].addEventListener("click", showAGarage);
			}

		} //if
		else {
			alert('Error-ajax onload');
		}
	} //ajaxonload

	AJAX.open("GET",urlPrefix+"/getAllPercent?toggle=" + toggleStatus);
	console.log("sending AJAX " + urlPrefix+ "/getAllPercent?toggle=" + toggleStatus);
	AJAX.send();
} //fnc showGarages


function showAGarage(e) {
	let garage;
	try {
		garage = e.target.text;
	} catch (error) {
		try {
			garage = currentGarage;
		} catch (error) {
			return;
		}

	} finally {

	console.log(garage);
	let AJAX_modal = new XMLHttpRequest();
	AJAX_modal.onerror = function() {
		alert('ajax_modal network error');
	}

	AJAX_modal.onload = function() {
		if (this.status ==200){
			let resObj = JSON.parse(this.responseText);
			let info = resObj.levels;
			// create table displaying garage info, to be inserted into modal-content space
			let table = document.createElement("table");
			table.setAttribute('class', 'modal_text');
			table.id = "currentDataTable";
			let header = table.createTHead();
			let row = header.insertRow();
			let h1 = row.insertCell(0);
			let h2 = row.insertCell(1);
			h1.width = "50%";
			h2.width = "50%";

			h1.innerHTML = "<b>Floor</b>";
			h2.innerHTML = "<b>Spaces Available</b>";
			let body = table.createTBody();
			body.setAttribute('class', 'modal_floors');

			let i=0;
			for (entry of info) {
				let row = body.insertRow();
				let floor = row.insertCell(0);
				let free = row.insertCell(1)
				floor.innerHTML = entry.Level;
				free.innerHTML = entry.SpacesFree;
				i = i+1;
			} //for


			let tableDiv = document.getElementById("currentData");
			tableDiv.innerHTML = "";
			tableDiv.append(table);
			currentGarage = garage;
			document.getElementById("nowViewing").innerHTML = "Now Viewing: "+garage;
			modal.style.display = "block";
			console.log("current garage is: "+currentGarage);
		}

		else {
			alert('ajax_modal error : onload');
		}

	} //onload

	AJAX_modal.open("GET", urlPrefix + "/getFloorData?garage=" + garage + "&toggle=" + toggleStatus);
	AJAX_modal.send();
	console.log('sending ajax_modal: ' + urlPrefix + "/getFloorData?garage=" + garage + "&toggle=" + toggleStatus);
 } // Finally
} //showAGarage
