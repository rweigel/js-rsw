/*
 
 npm install array-query
 npm install express
 gunzip GeoLite2-City-Blocks.csv.gz
 
 # Start server
 node geoip.js
 (then browse to http://localhost:8083/)
 
 # Command line test
 
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

    var ip;  // make sure it is local. 
    
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

var http = require('http');

var serverCallback= function (req, res) {
  var body = "";
  req.on('data', function (chunk) {
    console.log('data: ' + chunk);
    chunk= chunk.toString();
    chunk= chunk.replace(/\%0D\%0A/gi,'\n');  //TODO: Why must I do this?  Who puts in the DOS newlines?
    body += chunk;
  });
  req.on('end', function () {
    body= body.replace('ipnumbers=','');  // TODO: Why must I do this?  Who puts in the ipnumbers=?  That must be a node thing.
    console.log('POSTed: ' + body);
    res.writeHead(200);
    
    var resultHTML= "";
    numbers= body.split("\n");
    
    console.log( "numbers:" + numbers );
    for ( var i=0; i<numbers.length; i++ ) {
        number= numbers[i].trim();
        console.log('in '+number+' out:');
        if ( number.length>0 ) {
            resultHTML+= number + " " + bestmatch( number ) + "<br>";
        }
    }
    
    
    var postHTML = 
  '<html><head><title>Enter IP address to Lat/Lon</title></head>\n' +
  '<body>\n' +
  '<h1>IP address look up based on GeoLite2-City-Blocks.20140805.csv</h1>\n' + 
  '<em><small>This is the JavaScript implementation.</small></em><br>\n' +
  '<form method="POST">' + 
  '    <textarea name="ipnumbers" rows="12" cols="20">128.255.33.127\n' +
    '209.181.207.107\n' +
    '204.121.60.11\n' +
    '</textarea><br>' +
  '    <input type="submit">' +
  '</form><br>' ;
  res.write(postHTML);
  res.write(resultHTML);
  res.write('</body></html>');
  res.end('');
    
  });
};

try {
    http.createServer(serverCallback).listen( 8083 ); //TODO: why can't I catch this error?
} catch ( err ) {
    console.log("Unable to start server: " + err );
}

