
// Do you want tip to move when mouse moves over link?
var tipFollowMouse = true;	
var offX = 0;	// how far from mouse to show tip
var offY = 0; 
var dom  = (document.getElementById) ? true : false;
var ns5  = (!document.all && dom || window.opera) ? true: false;
var ie5  = ((navigator.userAgent.indexOf("MSIE")>-1) && dom) ? true : false;
var ie4  = (document.all && !dom) ? true : false;

var t1,t2;          // for setTimeouts
var tooltip;
var tipcss;
var mouseX;
var mouseY;
var tipOn = false;  // check if over tooltip link
