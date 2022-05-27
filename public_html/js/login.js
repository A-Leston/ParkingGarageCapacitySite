//script for login.html

const urlPrefix = "http://35.243.163.3";

document.getElementById("loginButton").addEventListener("click", login);

function login() {
	const un = document.getElementById("user").value;
	const pw = document.getElementById("pass").value;
	const msg = JSON.stringify({username:un, password:pw});
	console.log(msg);

	let AJAX = new XMLHttpRequest();
	AJAX.onerror = function(){
		console.log('ajax error-login');
	}
	AJAX.onload = function(){
		if (this.status ==200){
			alert("Successfully logged in");
			window.location.replace(urlPrefix+"/admin.html");

		} //login success
		else {
			alert(this.responseText);
			console.log(this.responseText);
		} //login fail (could be for a variety of reasons; the bad user/pass cases have a specific error msg--need to maybe deal with mysql errors later
	} //onload
	AJAX.open("POST", urlPrefix+"/login");
	AJAX.setRequestHeader("Content-Type", "application/json");
	AJAX.send(msg);
	console.log("now sending ajax post to " + urlPrefix+"/login");
} //login
