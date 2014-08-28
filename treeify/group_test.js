var request = require("request");
var group   = require("./js/group");

var url = "http://autoplot.org/bookmarks/SuperMAG.xml";
//var url = "http://viviz.org/gallery/images/autoplot-tests/";
var url = "http://tsds.org/get/?catalog=SSCWeb&return=autoplot-bookmarks";

// Fetch and parse links from URL
request(url, function (error, response, body) {
	if (!error && response.statusCode == 200) {
		console.log(response.headers);
		if (response.headers["content-type"].match("/xml")) {
			parseXML(body, json2indent);
		}
		if  (response.headers["content-type"].match("/html")) {
			parseHTML(body);
		}
	}
})

function parseHTML(body, callback) {
	jsdom = require("jsdom").jsdom;
	jsdom.env({
		html: body,
		scripts: ['http://code.jquery.com/jquery-1.5.min.js']
		}, function(err, window) {
			var $ = window.jQuery;
			// jQuery is now loaded on the jsdom window created from 'agent.body'
			var links = [];
			$("a").each(function(a){
				links.push($(this).text());
			});
			// filter out unrelevant links
			links = links.filter(function(url){
				return url.search(/vap\+cdaweb/) >= 0;
			})

			// var root = group.process(links.slice(99, 200));
			var root = group.process(links);
			callback(root);
	});
}

function parseXML(body, callback) {

	var xml2js = require('xml2js');

	parser = new xml2js.Parser();
	parser.parseString(body, function(err, res) {
		if (!err) {
			var links = extractURLs(res);
			console.log(links
				.join("!!")
				.concat("!!")
				.replace(/http:\/\/autoplot.org\/git\/jyds\/tsdsfe\.jyds\?http:\/\/tsds.org\/get\/\?catalog=/g,"")
				.replace(/&dataset=/g,".")
				.replace(/&parameters=/g,".")
				.replace(/&start.*?\!\!/g,"!!")
				.split("!!")
				.slice(0,-1));
			var root  = group.process(links);
			//console.log(root)
			callback(root);         
		}
	});

	// Extract links in XML document.
	function extractURLs(doc){
		//console.log(doc)
		var ret = [];
		for (var key in doc){
			if (key === "bookmark") {
				var urls = doc[key].map(function(item){
					return item.uri[0];
				});
				ret = ret.concat(urls);
			} else if (key === "bookmark-list" || key === "bookmark-folder"){
				if (Object.prototype.toString.call(doc[key]) === '[object Array]'){
					doc[key].forEach(function(item){
						ret = ret.concat(extractURLs(item));
					});
				} else {
					ret = ret.concat(extractURLs(doc[key]));
				}
			}
		}
		//console.log(ret)
		return ret;
	}
}

// Convert grouped JSON back to XML.
function json2xml(node){

	var builder = require("xmlbuilder");

	// var doc = builder.create();
	var ele = builder.create("bookmark-list").att("version", 1.1);
	node.items.forEach(function(item){
		var d=ele.ele("bookmark");
		d.ele("title", item.url);
		d.ele("url", item.url);
	})
	if(node.children){
		node.children.forEach(function(child){
			var d=ele.ele("bookmark-folder");
			d.ele("title", child.name);
			printXmlRecur(child, d);
		})    
	}
	return ele.end({ 'pretty': true, 'indent': '  ', 'newline': '\n' });

	function printXmlRecur(node, d){
		var ele = d.ele("bookmark-list");
		node.items.forEach(function(item){
			var d=ele.ele("bookmark");
			d.ele("title", item.url);
			d.ele("url", item.url);
		})
		if(node.children){
			node.children.forEach(function(child){
				var d=ele.ele("bookmark-folder");
				d.ele("title", child.name);
				printXmlRecur(child, d);
			})
		}
	}
}

// Convert grouped JSON to indented list.
function json2indent(node, level) {
	level=level||0;
	var indent = "";
	for(var i=0;i<level;i++){
		indent+="  ";
	}
	console.log(indent+node.name);
	indent+="  ";
	node.items.forEach(function(item){
		console.log(indent+item.url);
	})
	if(node.children) {
		node.children.forEach(function(child){
			json2indent(child, level+1);
		})
	}
}
