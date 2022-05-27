// fileServer toplevel

// Module exports one function that reads and serves up statis files

const fs = require('fs'),
    path = require('path'),
    utils = require('./utils');



exports.serve_static_file = function (fileName, res) {           
    fs.readFile(fileName,function(err,data) {
        if (err) { // readFile generates an err object
            let out = { error: "not_found",message: "'" + fileName + "' not found" };
            utils.sendJSONObj(res,404,out);
        }
        else { //readFile success
            let ct = content_type_for_path(fileName); //get contect type
            res.writeHead(200, { "Content-Type" : ct });
            res.write(data);
            console.log(fileName);
	    res.end();
        }
    });
}

//function returns content type based on file extension
function content_type_for_path (file) {
    var ext = path.extname(file);
    switch (ext.toLowerCase()) {
        case '.html': return "text/html";
        case ".js": return "text/javascript";
        case ".css": return 'text/css';
        case '.jpg': case '.jpeg': return 'image/jpeg';
        default: return 'text/plain';
    }
}
