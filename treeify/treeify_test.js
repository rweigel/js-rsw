// node.js
if (typeof(exports) !== "undefined" && require){
	treeify = require(__dirname + "/js/treeify").treeify;
	runtest(1,true);
	runtest(2,true);
	runtest(3,true);
	runtest(4,true);
}

function runtest(i,debug) {

	if (i == 1) {
		console.log("__________________________________________")
		console.log("Demo "+i)
		var start = new Date().getTime();
		console.log("Call treeify.");
		d1 = ["cri.AAT3","cri.AATB","cri_c.AAT3","cri_c.AAT3.minute","cri_c.AATB.minute"];
		D1 = treeify(d1,0);
		var stop = new Date().getTime();
		console.log("Finished treeify in "+(stop-start)+" ms");
		if (debug) console.log("Treeify result for : "+d1);
		if (debug) console.log(D1)
		if (debug) json2indent(D1);

		return D1;
	}

	if (i == 2) {
		console.log("__________________________________________")
		console.log("Demo "+i)
		var start = new Date().getTime();
		console.log("Call treeify");
		d2 = ["A.B.C","A.B.D","A.Z.Z","D.Z.Z"];
		D2 = treeify(d2,0);
		var stop = new Date().getTime();
		console.log("Finished treeify in "+(stop-start)+" ms");
		if (debug) console.log("Treeify result for : "+d2);
		if (debug) console.log(D2)
		if (debug) json2indent(D2);
		
		return D2;
	}

	if (i == 3) {
		console.log("__________________________________________")
		console.log("Demo "+i)
		var start = new Date().getTime();
		console.log("Call treeify");
		d3 = ["A.B.C","D.Z.Z","A.B.D","A.Z.Z"];
		D3 = treeify(d3,0);
		var stop = new Date().getTime();
		console.log("Finished treeify in "+(stop-start)+" ms");
		if (debug) console.log("Treeify result for : "+d3);
		if (debug) console.log(D3)
		json2indent(D3);

		return D3;
	}

	if (i == 4) {
		console.log("__________________________________________")
		console.log("Demo "+i)
		var d4 = [];
		var start = new Date().getTime();

		// node.js
		if (typeof(exports) !== "undefined" && require){
			var data = require('./js/testdata.js').testdata();
		} else {
			var data = testdata();
		}

		console.log("Start placing in array");
		for (var i = 0;i < data.length;i++) {
			d4[i] = data[i].value.replace("_",".");
		}		
		var stop = new Date().getTime();
		console.log("Finished placing in array "+(stop-start)+" ms");

		var start = new Date().getTime();
		console.log("Call treeify");
		D4 = treeify(d4,0);
		var stop = new Date().getTime();
		console.log("Finished treeify in "+(stop-start)+" ms");
		if (debug) console.log("Treeify result for : "+JSON.stringify(d4, null, 4));
		if (debug) json2indent(D4);

		return D4
	}
}

function json2indent(obj,level) {
	level=level||0;
	var indent = " ";
	for(var i=0;i<level;i++){
		indent+=" ";
	}

	if (level == 0) {
		console.log("root")
	}
	function isarray(a) {
		if( Object.prototype.toString.call( a ) === '[object Array]' ) {
			return true;
		}
		return false;
	}

	for (key in obj) {
		if (isarray(obj[key])) {
			console.log(indent + key)
			for (var i = 0; i < obj[key].length; i++) {
				console.log(indent + indent + obj[key][i]);
			}
		} else {
			console.log(indent + key)
			json2indent(obj[key],level+1)
		}

	}
}
