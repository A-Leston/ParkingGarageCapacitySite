// script for admin.html: 'dashboard' layout w/3 fncs accessible via sidebar nav w/o reloading whole pg
// basic idea: click tab on sidebar-> content of "fncStuff" div (html interface for various user inputs) is swapped out to match the newly selected fnc
const urlPrefix="http://35.243.163.3";

let options= document.getElementsByClassName("selectBtn");
for (i=0; i<options.length ; i++){
	options[i].addEventListener("click", changeFnc);
}

let garage; 
let currentValues=[];
let fnc; 

function changeFnc(e) {
	fnc = e.target.id;
	for (i=0; i<options.length; i++){
		options[i].classList.remove("selected");
	}
	document.getElementById(fnc).classList.add("selected");

	switch (fnc) {
		case "createAdmin":
			document.getElementById("header").innerHTML = "Create New Admin";
			document.getElementById("fncStuff").innerHTML=`<div class="fncPrompt">Enter a username and password to create a new admin account.</div><br>
				<div hidden id="alert" class="alert"></div>
				<label for='username'>Username:</label><br><input type='text' id='username'><br>
				<label for="password">Password:</label><br><input type="password" id="password"><br> <label for="password">Re-enter Password:</label><br><input type="password" id="password_re"><br>
				<button id="createButton">Register</button>`;
			//need to happen on load of this fnc's html:
			document.getElementById("createButton").addEventListener("click", create_admin);
			document.getElementById("password_re").addEventListener("keydown", ()=> {document.getElementById("password_re").style.borderColor="black";});
			document.getElementById("username").addEventListener("keydown", ()=>{document.getElementById("username").style.borderColor="black";});
			break;
		case "updateFloors":
			document.getElementById("header").innerHTML = "Update Floor Occupancies";
			document.getElementById("fncStuff").innerHTML=`<div class="fncPrompt">Manually update garage floor occupancies.</div>
				<label for='garageSelect'>Choose a Garage: </label>
				<select name='garages' id='garageSelect'></select>
				<div id='currentData' class="currentData"> </div>
				<button id='submitButton' class='float-left submit-button'>Submit</button>
				`;
			getGarageNames();
			document.getElementById("submitButton").addEventListener("click", updateData);
			document.getElementById("garageSelect").addEventListener("change", displayData);
			break;
		case "simulate":
			document.getElementById("header").innerHTML = "Garage Simulator";
			document.getElementById("fncStuff").innerHTML= `<div class="fncPrompt">Select a garage to simulate cars moving through it.</div>
				<label for="garageSelect">Choose a Garage:</label>
				<select name="garages" id="garageSelect"></select>
				<div id="currentData" class="currentData"></div>`
			getGarageNames();
			document.getElementById("garageSelect").addEventListener("change", displayData);
			break;
	}
}


//JS for create admin fnc

function create_admin() {
        //trying to add some check if password+reentered password match
	let message = document.getElementById("alert");
	message.style.color="red";
	message.setAttribute("hidden", "hidden");

	const un = document.getElementById("username").value;
        const pw = document.getElementById("password").value;
	const pw_re= document.getElementById("password_re").value;

	if (pw != pw_re){
		message.innerHTML= "Passwords do not match; try again.";
		message.removeAttribute("hidden");
		document.getElementById("password_re").style.borderColor="red";
		return;
	}
        const msg = JSON.stringify({username:un, password:pw});

        let AJAX = new XMLHttpRequest();
        AJAX.onerror = function(){
		alert("Server error; try again later.");
                console.log('ajax error-create_admin');
        }
        AJAX.onload = function(){
                if (this.status ==200){
			message.style.color="green";
			document.getElementById("username").value="";
     			document.getElementById("password").value="";
        		document.getElementById("password_re").value="";
                } //create success
		else if (this.status==444){
			document.getElementById("username").style.borderColor="red";
		}
		message.innerHTML=this.responseText;
		message.removeAttribute("hidden");
        } //onload
	AJAX.open("POST", urlPrefix+"/createAdmin");
        AJAX.setRequestHeader("Content-Type", "application/json");
        AJAX.send(msg);
        console.log("now sending ajax post to " + urlPrefix+"/createAdmin");
} //create_admin



function getGarageNames() {
	let AJAX1 = new XMLHttpRequest();
	AJAX1.onerror = function() {
		alert('ajax1 error--getGarageNames');
	} //onerror

	AJAX1.onload = function() {
		if (this.status ==200) {
			let resObj = JSON.parse(this.responseText);
			let names = resObj.names;
			let menu = document.getElementById("garageSelect");
			let i=0;
			for (entry of names) {
				let option = document.createElement("option");
				option.value = entry.GarageName;
				option.text = entry.GarageName;
				if (i==0) {
					garage = entry.GarageName;
				} //autoselect 1st option; note--if there are no garages, onload displayData will break
				menu.add(option);
				i=i+1;
			} //for
			displayData();
		} //if 200
		else {
			alert('ajax1 error onload --getGarageNames');
		} //else error
	} //onload
	AJAX1.open("GET", urlPrefix+ "/getGarageNames");
	AJAX1.send();
	console.log("sending ajax1 " + urlPrefix + "/getGarageNames");
} //getGarageNames

function updateData() {
	// take the values stored in text fields, pass to server as qeury
	let table = document.getElementById("currentDataTable");
	let select = document.getElementById("garageSelect");
        let garage = select.options[select.selectedIndex].value;
        let rows = table.rows.length - 1; // # of rows-1 (1strow=headings) and therefore floors/textfields
	let qStr = "garage="+ garage;

	for (var i=0; i<rows; i++) {
		let floor = document.getElementById(i+""); //geting text field for floor
		qStr = qStr + "&" + (i+1) + "=" + floor.value;
	}

	let AJAX3 = new XMLHttpRequest();
	AJAX3.onerror = function() {
		alert('ajax3 error-updateData');
	} //onerror

	AJAX3.onload = function() {
		if (this.status == 200) {
			alert('successfully updated!');
			displayData();
		} //if status 200
		else {
			alert('ajax2 error--onload');
		} //else status not 200
	} //onload
	AJAX3.open("GET", urlPrefix + "/updateGarage?" + qStr);
	console.log("sending ajax3 " + urlPrefix+ "/updateGarage?" + qStr);
	AJAX3.send();
} //updateData



function displayData(){
	let AJAX2=new XMLHttpRequest();
	AJAX2.onerror=function(){
		alert("AJAX2 error--displayData");
	}
	AJAX2.onload=function(){
		if(this.status==200){
			let resObj=JSON.parse(this.responseText);
			let info=resObj.levels;
			//create table displaying garage info+interface to take user input for updating floor data
			let table=document.createElement("table");
			table.id="currentDataTable";
			let header=table.createTHead();
			let row=header.insertRow();
			let h1=row.insertCell(0);
			let h2=row.insertCell(1);
			let h3=row.insertCell(2);

			currentValues=[]; //making sure it's empty before filling
			h1.innerHTML="<b>Floor</b>";
			h2.innerHTML="<b>Current Occupancy</b>";

			switch (fnc){
				case "updateFloors":
					h3.innerHTML="<b>Updated Occupancy</b>";
					break;
				case "simulate":
					h3.innerHTML="<b>Moving Upwards</b>";
					let h4=row.insertCell(3);
					h4.innerHTML="<b>Moving Downwards</b>";
					break;
			}
			let i=0;
			for (entry of info){
				let body = table.createTBody();
				let row=body.insertRow();
				let floor=row.insertCell(0);
				floor.innerHTML=entry.Level;
				let current=row.insertCell(1);
				current.innerHTML=entry.CurrentOccupancy;
				

				if (fnc=="updateFloors"){
					let newVal=row.insertCell(2);
					newVal.innerHTML= "<input type='text' id=" + i + ">";
				}
				else {
					let inButton=row.insertCell(2);
					inButton.innerHTML="<button id=\"inF" + (i+1) + "\">entering Floor " + (i+1) + "</button>";
					let outButton=row.insertCell(3);
					outButton.innerHTML="<button id=\"outF" + (i+1) + "\">leaving Floor " + (i+1) + "</button>";
					currentValues.push(entry.CurrentOccupancy); //create array of floor vals for update buttons
				}
				i+=1;
			}
			let tableDiv = document.getElementById("currentData");
			tableDiv.innerHTML="";
			tableDiv.append(table);

			if (fnc=="simulate"){ // connecting dynamic btns to sensor fnc
				for (i=0; i<entry.Level; i++){
					inwardSensor= "inF" + (i+1);
					outwardSensor= "outF"+ (i+1);
					document.getElementById(inwardSensor).addEventListener("click", sensor);
					document.getElementById(outwardSensor).addEventListener("click", sensor);
				}
			}
		} //status200
		else {
			alert("error: AJAX2onload --displayData");
		}
	} //onload
		//pass currently selected garage name to GET its floordata
		let select=document.getElementById("garageSelect");
		if (select.options[select.selectedIndex]){
			garage=select.options[select.selectedIndex].value;
		}
		AJAX2.open("GET", urlPrefix+"/getFloorData?garage="+garage);
		AJAX2.send();
		console.log("sending AJAX2: " +urlPrefix+"/getFloorData?garage="+garage);
} //displayData


// sensor fnc for simulate:
function sensor() {  // function for the buttons that simulate sensors
	console.log("sensor triggered: " + this.id);
	let id = this.id;
	let data = id.split("F");
	let direction = data[0]; // which type of sensor (up/in or down/out)
	let floorNum = data[1];  // on which floor
	let qStr = "garage=" + garage;

	if (direction === "in") {
		// will add 1 to floor of that garage and subtract 1 from floor below it, but wont try to edit floor 0
		if (floorNum -1 < 1){ //if someone moved in to garage from outside (floor 1 entrance)
			newNum = currentValues.shift();
			newNum += 1;
			currentValues.push(newNum); //adds new to end

			for (i = 1; i < currentValues.length; i++){ //loop till its back in proper order
				newNum = currentValues.shift();
				currentValues.push(newNum); //adds new to end
			} // end for
		}  //end if floor 1

		else {  // for any other floor
                        for (i = 0; i < currentValues.length; i++){ //loop till its back in proper order
				if ((floorNum -2) == i) { // floor to take from
                                newNum = currentValues.shift();
				newNum -=1; // subtract 1 from floor they left
                                currentValues.push(newNum); //adds new to end
				}
				else if ((floorNum-1) == i) { //floor they went too
				newNum = currentValues.shift();
                                newNum +=1; // add 1 to floor
                                currentValues.push(newNum); //adds new to end
				}
				else {
				newNum = currentValues.shift();
                                currentValues.push(newNum); //adds new to end
				}
			}   // end for
		}   // end else
	} // if in/up

	if (direction === "out") {
		//will subtract 1 from current floor and add 1 to floor under it,  but wont try to edit floor 0
		if (floorNum -1 < 1){ //if someone moved out of garage, floor 1 exit
                        newNum = currentValues.shift();
                        newNum -= 1;
                        currentValues.push(newNum); //adds new to end

                        for (i = 1; i < currentValues.length; i++){ //loop till its back in proper order
                                newNum = currentValues.shift();
                                currentValues.push(newNum); //adds new to end
                        } // end for
                }  //end if floor 1
                else {  // for any other floor
                        for (i = 0; i < currentValues.length; i++){ //loop till its back in proper order
                                if ((floorNum -2) == i) { // floor to add to
                                	newNum = currentValues.shift();
                                	newNum +=1; // add 1 to floor they moved to
                                	currentValues.push(newNum); //adds new to end
                                }

                                else if ((floorNum-1) == i) { //floor they came from
                        	        newNum = currentValues.shift();
                            	    newNum -=1; // subtract 1 to floor
                                	currentValues.push(newNum); //adds new to end
                                }

                                else {
                                	newNum = currentValues.shift();
                                	currentValues.push(newNum); //adds new to end
                                }
                        }   // end for
		}  //end else
	}  // if out/down

 for (i=0; i<entry.Level; i++) {
 	let floor = currentValues[i]; // making query
        qStr = qStr + "&" + (i+1) + "=" + floor;
	} // end for

let AJAX3 = new XMLHttpRequest();
	AJAX3.onerror = function() {
		alert('ajax3 error-updateData');
	}
	AJAX3.onload = function() {
		if (this.status == 200) {
			displayData();
		}
		else {
			alert('ajax3 error--onload');
		}
	} //onload
AJAX3.open("GET", urlPrefix + "/updateGarage?" + qStr);
console.log("sending ajax3 " + urlPrefix+ "/updateGarage?" + qStr);
AJAX3.send();
}  //sensor func

