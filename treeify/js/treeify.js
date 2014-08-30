// node.js
if (typeof(exports) !== "undefined" && require){
	// Require statements
}

var	debug = false;

function treeify(names,delim,level,parent) {

	var start = new Date().getTime();
	if (debug) console.log("Call treeify.");

	var delim = delim || "."
	if (arguments.length == 2) {
		//treeify.callback = level;
		level = 0;
		parent = "";
	}

	if (!treeify.n) {
		treeify.n = 0;
	} else {
		treeify.n = treeify.n+1;
	}

	if (debug) {
		console.log("treeify.js: Level = " + level);
		console.log("treeify.js: Names = ")
		console.log(names);
	}
	if (debug) console.log("parent: " + parent)
	
	names.sort();
	var cont = 0;

	var L  = new Array();
	var Lr = new Array();

	var a = 0;
	var N = 0;
	var k = 0;
	var D = new Object();

	if (names.length == 1) { 
		if (debug) {
			console.log("treeify.js: Names has one element");
			console.log(names[0]);
		}
		if (names[0].match(delim)) {
			if (debug) {
				console.log("treeify.js: Names has one element with delimeter");
				console.log(names);
			}
			return [names[0]]
		} else {
			if (debug) console.log("treeify.js: Names has one element without delimeter")
			return names;
		}
		return D;
	}

	done = true;
	for (var i = 0;i < names.length;i++) {
		if (names[i].match(delim)) {
			done = false;
			continue;
		}
	}
	if (done) {
		if (debug) console.log("treeify.js: No delimiters")
		//console.log(names);
		return ".";
	}
	
	var ilast = 0;
	for (var i = 0;i < names.length;i++) {
		var tmpa = [];

		tmpa  = names[i].split(delim);
		L[i]  = tmpa[0];
		Lr[i] = tmpa.slice(1).join(delim);

		if (Lr[i] != "") {
			cont = 1;
		}
		if (debug) console.log("parent " + i + parent)
		if (debug) {
			if (i > 0) {
				console.log("treeify.js: Current prefix: "+L[i]+"; Last prefix: "+L[i-1]);
			} else {
				console.log("treeify.js: Current prefix: "+L[i]+"; Last prefix: undefined");
			}
			console.log("treeify.js: Parent: " + parent)
		}
		
		if (debug) {
			console.log("treeify.js: Current remainder:")
			console.log(Lr)
		}
		
		if (cont == 0) {
			if (debug) console.log('treeify.js: cont=0');
			if (debug) console.log('treeify.js: parent='+parent)
			continue;
		}
		if (i == names.length-1 && L[i] == L[i-1]) {
			if (debug) {
				console.log("treeify.js: Creating new directory named " + L[i-1]);
				console.log("treeify.js: Call treeify.");
				console.log('treeify.js: ilast: '+ilast)
			}
			var lt = Lr.slice(ilast);
			D[L[i-1]] = treeify(lt,delim,level+1,L[i-1]);			
		} else if (i > 0 && L[i] != L[i-1]) {
			if (debug) {
				console.log("treeify.js: +Creating new directory named " + L[i-1]);
				console.log("treeify.js: +Call treeify.");
				console.log('treeify.js: +ilast: '+ilast)
			}
			var lt = Lr.slice(ilast,i);
			if (debug) console.log("a parent: " + parent);
			tmp = treeify(lt,delim,level+1,L[i-1]);
			if (debug) console.log("b parent: " + parent);
			if (tmp == ".") {
				if (debug) console.log(i);
				if (debug) console.log(ilast);
				if (debug) console.log(names.slice(ilast,i));
				D["."] = names.slice(ilast,i);
			} else {
				if (debug) console.log("treeify.js: Call treeify with remainder");
				if (debug) console.log("treeify.js: Parent: " + parent);
				D[L[i-1]] = treeify(lt,delim,level+1,L[i-1]);
			}
			if (i == names.length - 1 ) {
				if (debug) {
					console.log("treeify.js: Creating new directory named " + L[i]);
					console.log("treeify.js: Call treeify with remainder");
				}
				D[L[i]] = treeify(Lr.slice(i),delim,level+1,L[i]);
			}
			ilast = i;
		}  

	}
	
	if (Object.keys(D).length === 0) {
		return names
	}
	
	var stop = new Date().getTime();
	if (debug) console.log("Finished treeify in "+(stop-start)+" ms");

	//treeify.callback(D)
	return D;
}

// node.js
if (typeof(exports) !== "undefined" && require){
	exports.treeify = treeify;
}