var request = require('request');
var jsdom   = require("jsdom").jsdom;
var crypto  = require('crypto');
var fs      = require('fs');


var form = {'catId':'2','reportId':'14','filter_type':'center','organ':'','strat':'','originalSlice0':'','filter_center_cd':'VA','filter_center_desc':'Virginia','slice5':'Virginia;Virginia;53;State','filter_cd':'VA','filter_desc':'Virginia','report_img':'','max_slice':5,'slice2':'','category':'2;Transplant','slice0':'','cube':'Transplant'};
var url = 'http://optn.transplant.hrsa.gov/latestData/rptData.asp';
var formsig = crypto.createHash("md5").update(url + form.toString()).digest("hex");	

if (fs.existsSync("./cache/"+formsig)) {
	console.log("Found cache file " + formsig)
	body = fs.readFileSync("./cache/"+formsig);
	extractdata(body.toString());
} else {
	console.log("Requesting data from " + url);
	request.post(url,{ "form": form },
			function (error, response, body) {
				if (!error && response.statusCode == 200) {
					//console.log(body);
					console.log("Done.");
					extractdata(body);
					fs.writeFileSync("./cache/"+formsig,body);
					console.log("Wrote " + formsig);
				}
			}
	);
}

function extractdata(body) {
	jsdom.env({
		html: body,
		scripts: ['http://code.jquery.com/jquery-1.5.min.js'],
		done: function(err, window) {

			var $ = window.jQuery;
			// jQuery is now loaded on the jsdom window created from 'agent.body'

			$('table .dataGrid thead tr:last').each(function (i,el) {
				var rowstr = "";
				$(this).find('th').each(function (i,el) {
					rowstr = rowstr + " " + $(this).text().replace(/\s/g,"_");
				});
				console.log(rowstr)
			});
			// This should not be needed, but without it selection of tbody does not work.
			$('table.dataGrid thead').remove();

			$('table.dataGrid tbody tr').each(function (i,el) {
				var rowstr = "";
				$(this).find('td').each(function (i,el) {
					rowstr = rowstr + " " + $(this).text();
				});
				console.log(rowstr)
			});

		}
	});
}
