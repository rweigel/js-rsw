
$.head("filecheck.html",{},function(headers) {
	$.each(headers,function(key,header){ console.log(key+':--:'+header);});
});

pjs.addSuite({
    // single URL or array
    url: 'http://www.lanl-epdata.lanl.gov/lanl_ep_data/LanlGeoSummaryPlots/1998/19980310/19980310_LANL_GEO_LoE_00-24_1.png',
    // single function or array, evaluated in the client
    scraper: function() {
        return $('h1#firstHeading').text();
    }
});