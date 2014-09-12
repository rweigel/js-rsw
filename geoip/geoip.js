/*
npm install array-query
gunzip GeoLite2-City-Blocks.csv.gz
node geoip.js
*/
var query = require('array-query');
var fs = require('fs');

if (!fs.existsSync('GeoLite2-City-Blocks.json')) {
	console.log("Reading CSV file.");
	// Synchronous read.
	d = fs.readFileSync('GeoLite2-City-Blocks.csv');
	console.log("Done reading CSV file.");

	console.log("Parsing file to JSON.");
    var da = d.toString().split("\n");
	console.log("Done parsing file to JSON.");

	console.log("Creating array to be queried.  Length = "+da.length);
	var A = [];

	// Save fewer records:
	// for (var i = 1;i < 1000; i++) {
	for (var i = 1;i < da.length; i++) {
		row = da[i].split(",");
		A[i] = {};
		A[i].ip  = row[0].replace("::ffff:","");
		A[i].info = da[i];
	}
	console.log("Done creating array to be queried.");

	console.log("Converting array to JSON string.")
	var As = JSON.stringify(A);
	console.log("Done converting array to JSON string.")

	console.log("Saving array to be queried as JSON.");
	// Async write
	fs.writeFile("GeoLite2-City-Blocks.json", As, function () {
		console.log("Done saving array to be queried as JSON.");
	})


} else {
	console.log("Reading JSON file.");
	A = JSON.parse(fs.readFileSync('GeoLite2-City-Blocks.json'));
	console.log("Done reading JSON file.");
}

var ip = '199.124.111.1';
var ipa = ip.split(".");

for (var i = 0;i<ipa.length;i++) {
	var ippartial = ipa.slice(0,i+1).join(".");
	var q = query('ip').startsWith(ippartial).on(A).pop();
	console.log("Query: " + ippartial + "; Result: ");
	console.log(q);
	if (q) {
		var bestmatch = q;
	}
}

console.log("Best match: ");
console.log(bestmatch);
