var rectanglecount = -1;
var groupcount = -1;
var textcount = -1;
var slidercount = -1;

function init() {

    var attrstyle = { "width":"100%" };
    set("svg0",attrstyle);
    var attrstyle = { "height":"100%" };
    set("svg0",attrstyle);
    var attrstyle = { "viewBox":"0 0 100 100" };
    set("svg0",attrstyle);

    gid = group("svg0");
    
    s0 = slider(40,40,40);

//	return;

if (0) {    
    r0 = rectangle(0,0,100,100,gid);
    r1 = rectangle(10,10,10,10,gid);
    r2 = rectangle(10,20,10,10,gid);
    r3 = rectangle(10,30,10,10,gid);

//    var attraction = { "onmousemove":"changecolor(evt)" };
//    set(r0,attraction);

	var attrstyle = { "fill":"blue" };
    set(r0,attrstyle);
    
	var attrstyle = { "fill":"red" };
    set(r1,attrstyle);

	//not working in batik 1.7
    //var attraction = { "ondblclick":"changecolor(evt)" };
    //set(r1,attraction);

    var attraction = { "ondblclick":"changecolor(evt)" };
    set(r1,attraction);
    
    //var attraction = { "onmouseup":"changecolor(evt)" };
    //set(r1,attraction);

    var attrstyle = { "fill":"yellow" };
    set(r2,attrstyle);

    var attraction = { "onmousedown":"changecolor(evt)" };
    set(r2,attraction);

    var attrstyle = { "fill":"green" };
    set(r3,attrstyle);

    var attraction = { "onmouseover":"changecolor(evt)" };
    set(r3,attraction);
    
    gid = group("svg0");
    t0 = text(10,20,"HELLO",gid);

//    var attrstyle = { "font-family":"monospace" };
    var attrstyle = { "font-family":"sans-serif" };
	set(t0,attrstyle);

	// Does nothing in FF 2.0, works in batik
	// Expected: See http://developer.mozilla.org/en/docs/SVG_in_Firefox
    var attrstyle = { "textLength":"10pt", "lengthAdjust":"spacingAndGlyphs" };
	set(t0,attrstyle);

	// Uncaught exception error in FF
	// textobj=document.getElementById("text0");
	// alert(textobj.getNumberOfChars());
	        
    var attrstyle = { "fill":"green" };
	set(t0,attrstyle);
}	
}

function changecolor(evt) {

	// Don't use evt.getTarget() (which is ASV-specific)
    var attrstyle = { "fill":"blue" };
    set(evt.target,attrstyle);
}

function isstring(x) {
  if ( typeof(x) == "string" ) {
    return true;
  } else {
    return false;
  }
}
  
function set(node,attr) {

	if (isstring(node)) {
	    var node = document.getElementById(node);
    }
   	for (var i in attr) {
		node.setAttributeNS(null, i, attr[i]);
	}    

}

function get(idstr) {
    return document.getElementById(idstr);
}

function append(parentnode,node) {
    parentnode.appendChild(node);
}

function text(x,y,string,parentid,attrstyle) {

    textcount = textcount + 1;

    if (arguments.length < 4) {
		var parentnode = get("svg0");
    } else {
		var parentnode = get(parentid);
    }


    var node  = document.createElementNS(namespace("svg"), 'text');
    var idstr = "text"+textcount;
    node.setAttributeNS(null, "id", idstr);
    text = document.createTextNode( string );
    node.appendChild( text );

    append(parentnode,node);

    if (arguments.length < 6) {
		var attrstyle = {"font-size":10, "font-family":"sans-serif", "font-weight":"normal", "fill":'black' };
    }
	var attrpos = {"x":x, "y":y, "text-anchor":"start"}; 

    set(idstr,attrpos);
    set(idstr,attrstyle);

    return idstr;
    
}
function slider(x,y,l,parentid,attrstyle) {

	slidercount = slidercount + 1;

    if (arguments.length < 4) {
		var parentid = "svg0";
    }


	var w = 1;
    gid = group();

	trackid = rectangle(x,y,l,w,gid);
	thumbid = rectangle(x+l/2,y-w,w,w+2,gid);

	attraction = { onmousedown:"doDrag(evt,gid,thumbid)" };
	set(gid,attraction);

	return gid;
	
}

function doDrag(evt,gid,thumbid) {

	var obj = evt.target;
	var pos = evt.clientX;
	alert(pos);
	set(thumbid,{fill:"white"});

}



function rectangle(x,y,width,height,parentid,attrstyle) 
{

	rectanglecount = rectanglecount + 1;

    if (arguments.length < 5) {
		var parentnode = get("svg0");
    } else {
		var parentnode = get(parentid);
    }

	var node  = document.createElementNS(namespace("svg"), 'rect');
    var idstr = "rectangle"+rectanglecount;
    node.setAttributeNS(null, "id", idstr);

	// Need to do this here instead of as a set() command below.
	// Otherwise batik complains that width (or height) is not set for rect
	// When append is done, batik seems to want width set first
    var attrpos = {"width":width, "height":height};
    for (var i in attrpos) {
		node.setAttributeNS(null, i, attrpos[i]);
    }

    append(parentnode,node);

    if (arguments.length < 6) {
		var attrstyle = { "fill":"black" };
    }

	//prefer to do it here (works in FF 2.0), but see above for batik problem
    var attrpos = {"width":width, "height":height, "x":x, "y":y};
    set(idstr,attrpos); 
    set(idstr,attrstyle);

    return idstr;

}

function group(parentid) {

    groupcount = groupcount + 1;

    if (arguments.length < 1) {
	var parentnode = get("svg0");
    } else {
	var parentnode = get(parentid);
    }

    var idstr = "group" + groupcount;
    var node = document.createElementNS(namespace("svg"), 'g');

    node.setAttributeNS(null, "id",idstr);
    append(parentnode,node);

    return idstr;

}

function namespace(name) {


    if (name.match("svg")) {
	return "http://www.w3.org/2000/svg";
    }
    if (name.match("xlink")) {
	return "http://www.w3.org/1999/xlink";
    }


}
