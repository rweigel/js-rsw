function preload(images) {
    
    // preload images that are to appear in tooltip from arrays above
    if (document.images) {
	var theImgs = new Array();
	for (var i=0; i< images.length; i++) {
	    theImgs[i] = new Image();
	    theImgs[i].src = images[i];
	}
    }
}