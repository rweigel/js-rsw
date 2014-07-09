            if (page.injectJs("jquery.min.js")) {
                console.log("jQuery loaded...");
            }
            if (page.injectJs("date.js")) {
                console.log("jQuery loaded...");
            }
            if (page.injectJs("jquery.head.js")) {
                console.log("jQuery loaded...");
            }

	$.head("http://www.lanl-epdata.lanl.gov/lanl_ep_data/LanlGeoSummaryPlots/1998/19980318/19980318_LANL_GEO_LoE_00-24_1.png",{},function(headers) {
		$.each(headers,function(key,header){ console.log(key+':--:'+header);});
	    });
