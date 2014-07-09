// Based on http://www.dynamicdrive.com/dynamicindex4/imagetooltip.htm
function inittip(MESSAGES) {

    for (var i=0;i < MESSAGES.length - 1;i++) {
	preload([ MESSAGES[i][0] , MESSAGES[i][1] ]);
    }

    tooltip = document.getElementById('tooltipdiv');
    tipcss  = tooltip.style;

    if (tooltip && tipFollowMouse) {
	document.onmousemove = trackMouse;
    }

}

function hidetip() {
	if (!tooltip) return;
	t2 = setTimeout("tipcss.visibility='hidden'",100);
	tipOn = false;
}

function showtip(evt,num,thumbnail,MESSAGES) {

    var startStr = '<img src="';
    var midStr   = '"><div class="tooltipcaption">';
    var endStr   = '</div>';
    
    if (!tooltip) return;
    if (t1) clearTimeout(t1);
    if (t2) clearTimeout(t2);
    tipOn = true;
    
    if (thumbnail)
	imgstr = MESSAGES[num][0];
    else
	imgstr = MESSAGES[num][1];
    
    tip = startStr + imgstr + midStr + MESSAGES[num][2] + endStr;
    tooltip.innerHTML = tip;

    positionTip(evt);    
    t1 = setTimeout("tipcss.visibility='visible'",10);
}

function trackMouse(evt) {

	standardbody = (document.compatMode=="CSS1Compat")? document.documentElement : document.body //create reference to common "body" across doctypes
	mouseX = (ns5)? evt.pageX: window.event.clientX + standardbody.scrollLeft;
	mouseY = (ns5)? evt.pageY: window.event.clientY + standardbody.scrollTop;
	if (tipOn) positionTip(evt);
}

function positionTip(evt) {
    
	standardbody = document.body;

	if (!tipFollowMouse) {
	    mouseX = (ns5) ? evt.pageX: window.event.clientX + standardbody.scrollLeft;
	    mouseY = (ns5) ? evt.pageY: window.event.clientY + standardbody.scrollTop;
	}

	var winWd = standardbody.clientWidth;
	var winHt = standardbody.clientHeight;

	var tpWd = document.getElementById('tooltipdiv').offsetWidth;
	var tpHt = document.getElementById('tooltipdiv').offsetHeight;

	if ( ((mouseX+offX+tpWd) > winWd) && ((mouseX-offX-tpWd) < 0) ){
	    tipcss.left = 0.0;
	} else if ((mouseX+offX+tpWd) > winWd) {
	    tipcss.left = mouseX-(tpWd+offX)+"px";
	} else {
	    tipcss.left = mouseX+offX+"px";
	}

	if ( ((mouseY+offY+tpHt) > winHt) && ((mouseY-offY-tpHt) < 0) ){
	    tipcss.top = 0.0;
	} else if ((mouseY+offY+tpHt) > winHt) {
	    tipcss.top = mouseY-(tpHt+offY)+"px";
	} else {
	    tipcss.top = mouseY+offY+"px";
	}


	t1 = setTimeout("tipcss.visibility='visible'",100);

}




