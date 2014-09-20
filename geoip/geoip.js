/*
 
 npm install array-query
 npm install express
 gunzip GeoLite2-City-Blocks.csv.gz
 
 # Start server
 node geoip.js
 curl http://localhost:3000/?ip=1.228.1.1
 
 # Command line test
 node geoip.js 1.228.1.1
 
 */

var query = require('array-query');
var fs = require('fs');
var express = require('express');
var app = express();

if ( !fs.existsSync('GeoLite2-City-Blocks.json' ) ) {
    var currentTimeMillis = new Date().getTime();
    console.log("Reading CSV file.");
    // Synchronous read.
    d = fs.readFileSync('GeoLite2-City-Blocks.csv');
    console.log("Done reading CSV file. ("+ (new Date().getTime() - currentTimeMillis)+"ms)");

    console.log("Formatting file to JSON.");
    var da = d.toString().split("\n");
    console.log("Done formatting file to JSON.");

    console.log("Creating map to be queried.  Length = " + da.length);
    var A = {};

    // Save fewer records:
    //debug for (var i = 1;i < 1000; i++) {
    for (var i = 1; i < da.length; i++) {
        row = da[i].split(",");
        ip= row[0].replace("::ffff:", "");
        if ( ip.match('.*\.0\.0' ) ) ip= ip.substring(0,ip.length-4);
        if ( ip.match('.*\.0' ) ) ip= ip.substring(0,ip.length-2);
        A[ip] = row[6]+" " +row[7];
        //debug console.log( "" +  row[0].replace("::ffff:", "") + " " + ip + " " +  A[ip] );
    }
    console.log("Done creating array to be queried. ("+ (new Date().getTime() - currentTimeMillis)+"ms)");

    console.log("Converting map to JSON string.");
    var As = JSON.stringify(A);
    console.log("Done converting map to JSON string.");

    console.log("Saving map to be queried as JSON.");
    // Async write
    fs.writeFile("GeoLite2-City-Blocks.json", As, function() {
        console.log("Done saving map to be queried as JSON. ("+ (new Date().getTime() - currentTimeMillis)+"ms)" );
    });


} else {
    var currentTimeMillis = new Date().getTime();
    console.log("Reading database from JSON file.");
    A = JSON.parse(fs.readFileSync('GeoLite2-City-Blocks.json'));
    console.log("Done reading JSON file. ("+ (new Date().getTime() - currentTimeMillis)+"ms)" ) ;
}

if (!process.argv[2]) {
    app.get('/', function(req, res) {
        res.send( bestmatch(req.query.ip) || "(not found)" );
    });
    var server = app.listen(3000, function() {
        console.log('Listening on port %d', server.address().port);
    });
} else {
    bestmatch( process.argv[2] );
}

function bestmatch(ip) {
    var currentTimeMillis = new Date().getTime();
    var ipa = ip.split(".");
    var best = "";
    for (var i = ipa.length; i > 0; i--) {
        var ippartial = ipa.slice(0, i).join(".");
        var q = A[ippartial];
        console.log("Query: " + ippartial + "; Result: ");
        console.log(q);
        if (typeof(q) !== "undefined") {
            best = q;
            break;
        }
    }
    if (best) {
        console.log("Best match: ");
        console.log(best);
    }
    console.log("Time to load: " + (new Date().getTime() - currentTimeMillis));
    return best;
}

