// app.js

const http = require('http'),
    url = require('url'),
    fileServer = require('./fileServer.js'),
    q = require('./queryHandle.js'),
    utils = require('./utils.js');

function handle_incoming_request(req, res) {
        //debugging console.log(req.url); 
	    const path = url.parse(req.url).pathname;
        const queryObj = url.parse(req.url,"true").query;

	switch (path) {
		case "/getAllPercent": // called by homepage for garage % full progress bars
			q.getAllPercent(queryObj, res);
			break;
			
	    case "/getGarageNames": // called from admin page to populate dropdown menu w/garages' names
			q.getGarageNames(res);
			break;

	    case "/getFloorData": // called from admin page to get each floor's CurrentOccupancy (CO) for specific garage
			q.getFloorData(queryObj, res);
			break;

	    case "/updateGarage": // called from admin page to update a garage's COs w/user-inputted values
			q.updateGarage(queryObj, res);
			break;

        case "/" :	// homepage
            fileServer.serve_static_file("./public_html/garages.html",res);
            break;

	    case "/login": // called from login page to compare inputted credentials with w/db
         	let body = "";
			req.on('data', chunk => {body+=chunk});
			req.on('end', () => 
			{ const postObj = JSON.parse(body);
			  console.log(postObj);
			  q.login(postObj, res);
			});
			break;

	    case "/createAdmin": // called from admin page to register new admin acct (un, hashed pw) in db
			let body2 = "";
			req.on('data', chunk => {body2+=chunk});
			req.on('end', () =>
			{ const postObj = JSON.parse(body2);
			  console.log(postObj);
			  q.createAdmin(postObj, res);
			});
			break;

        default:
            fileServer.serve_static_file("./public_html"+path,res);
            break;
        }
}

const server = http.createServer(handle_incoming_request);
server.listen(80,function() {console.log("port 80")});
