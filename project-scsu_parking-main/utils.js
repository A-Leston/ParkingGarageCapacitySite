// function written by Dr. Al Seesi from inclass AJAX example; serves object as JSON strng
exports.sendJSONObj = function(res,status,out) {
    res.writeHead(status, { "Content-Type" : "application/json" });
//    console.log(JSON.stringify(out));
    res.write(JSON.stringify(out));
    res.end();
}

// similar fnc to write basic text msg to client
exports.textMsg = function(res,status, out) {
    res.writeHead(status, {"Content-Type":"text/plain"});
    res.write(out);
    res.end();
}
