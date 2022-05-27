// queryHandle.js: routes 
// db connection info (used for every route involving a mysql query)
const mysql = require('mysql');
const db_info = {
        host: '34.139.45.114',
        user: 'nodeuser',
        password: 'nodepass',
        database: 'cktest',
		connectionLimit: 20
	};
// other required modules/libraries (utils->shortcut for crafting server res; bcrypt->library to generate salted+hashed pw, check entered pw against hash)
const utils = require('./utils.js'), bcrypt = require('bcrypt');

// Route 1: query to db for current % full for every garage--sends garagename and garage% via json
exports.getAllPercent = function(qObj, res) {
	let toggle = qObj.toggle;
	let pool = mysql.createPool(db_info);
	pool.query("SELECT GarageName, (SUM(CurrentOccupancy)/SUM(MaxOccupancy)) AS Percent FROM Floors WHERE "+toggle+"Privilege=1 GROUP BY GarageName",
		function (error, results) {
			if(error){
				utils.sendJSONObj(res, 400, {error:"server error; try again later"});
				console.log('error--query.js, mysql query getAllPercent');
			}
			else {
				let resObj = {'garages':results};
				res.writeHead(200, {"Content-Type":"application/json"});
				res.write(JSON.stringify(resObj));
				res.end();
			}
			pool.end();
		} // cbf
	) // query
} //getAllPercent

// route 2: query db for list of garage names
exports.getGarageNames = function(res) {
	let pool=mysql.createPool(db_info);
	pool.query("select distinct GarageName from Floors",
		function (error, results) {
			if (error) {
				utils.sendJSONObj(res, 400, {error:"server error; try again later"});
				console.log('error-queryHandle.js, mysql query getGarageNames');
			} //if error
			else {
				let resObj = {'names':results};
				res.writeHead(200, {"Content-Type":"application/json"});
				res.write(JSON.stringify(resObj));
				res.end();
			} //query success
		pool.end();
		} //cbf
	) //query
} // getGarageNames

// route 3: query db for floor COs for specified garage
exports.getFloorData = function(qObj, res) {
	let pool = mysql.createPool(db_info);
	let garage = qObj.garage;
	let sqlQuery =  "SELECT Level, CurrentOccupancy, SpacesFree FROM Floors WHERE GarageName=\'"+garage +"\'";
	let toggle = qObj.toggle;
	if (toggle) {sqlQuery +=  " AND "+toggle+"Privilege=1";}  //if toggle isnt undefined, use it as filter.
	pool.query( sqlQuery, function (error, results) {
			if (error) {
				console.log('error--queryHandle.js, mysql query getFloorData');
				utils.sendJSONObj(res, 400, {error:"server error;  try again later"});
			} 
			else {
				let resObj = {'levels':results};
				res.writeHead(200, {"Content-Type":"application/json"});
				res.write(JSON.stringify(resObj));
				res.end();
			} 
			pool.end();
		} //cbf
	) //query
} //getFloorData

//route 4: take floors' new values entered in admin page and use them to update CurrentOccupancy for floors of specified garage
exports.updateGarage = function(qObj, res) {
	let pool = mysql.createPool(db_info);
	let garage = qObj.garage;
	let newVal = 0;
	let floor = "";
	let q = "";

	delete qObj.garage;

	for (var key in qObj) {
		newVal = qObj[key];
		floor = key;

		if (newVal!=""){
			q = "update Floors set CurrentOccupancy=" + newVal + " where GarageName='"+ garage + "' and Level=" + floor;
			pool.query(q, function (error, results) {
				if (error) {
					utils.sendJSONObj(res, 400, {error:"Server error; try again later."});
					console.log('error--queryHandle.js, mysql query updateGarage');
				} //if error
				else {
					utils.textMsg(res, 200, "successfully updated");
				} //else query success
        		} //cbf
			) //query
		} //if not blank value
	} //for
} //updateGarage

// route 5: takes un and pw input, checks if a user w/that info exists in db; sends 1/3 possible msgs back (login good, un dne, pw bad)
exports.login = function(pObj, res){
	let pool = mysql.createPool(db_info);
	const un = pObj.username;
	const pw = pObj.password;

	pool.query("select password from Users where username=?",[un], function(error, results) {
		if (error){
			utils.sendJSONObj(res, 400, {error:"Server error; try again later"});
			console.log('error-queryHandle.js- mysql login query');
		}
		else {
			if (results.length > 0){ //if username exists in db, try to see if pw matches
				bcrypt.compare(pw, results[0].password, function(error, match) {
					if (error){
						utils.sendJSONObj(res, 400, {error:"Server error; try again later"});
						console.log('error--queryHandle.js- bcrypt compare');
					}
					else {
						if (match){
							utils.textMsg(res,200, 'successfully logged in');							
						}
						else {
							utils.textMsg(res,400, "incorrect password; try again");
						}
					}
				} //bcrypt cbf
				) //bcrypt compare
			} //if username found in db
			else {
				utils.textMsg(res, 400, "invalid username; try again");
			} //else username not in db
		} //else query success
		pool.end();
	    } //cbf
	) //query
} //login

// route 6: takes un and pw, checks if un in db; if not, create user, hash pw, and store un+pwhash in db)
exports.createAdmin = function(pObj, res) {
	let pool = mysql.createPool(db_info);
	const un = pObj.username;
    const pw = pObj.password;

	pool.query("select * from Users where username=?",[un], function(error, results) {
		if (error){
			console.log('Error-queryHandle.js-mysql query createAdmin');
			utils.sendJSONObj(res, 400, {error:"Server error; try again later;"});
        }
        else {
			if (results.length >0) { 
				utils.textMsg(res, 400, "Username already exists; try another.");
			} 
			else { //username free; make the user
				bcrypt.hash(pw, 10, function(error, hash) {
					if (error) {
						console.log('error: queryHandle.js-- bcrypt.hash');
						utils.sendJSONObj(res, 400, {error:"Server error; try again later"});
					}
					else {
						pool.query("insert into Users (username, password) values (?, ?)", [un, hash], function(error, results){
							if (error) {
								console.log("error--queryhandle.js, createadmin mysql query inserting new user;");
								utils.sendJSONObj(res, 400, {error: "Server error; try again later."});
							}
							else {
								utils.textMsg(res, 200, "Admin account successfully created!");
							}
						} //cbf
						) //query
					}
				}); //hash
			 } 
		    } 
		    //pool.end();
       } //cbf
	) //query
} //createadmin
