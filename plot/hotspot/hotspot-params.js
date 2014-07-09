//Small plot (sparkline) parameters
var swidth  = 300;
var sheight = 40;
//Large plot parameters
var lwidth  = 700;
var lheight = 400;

largeDimension = '&width=' + lwidth + '&height=' + lheight;
smallDimension = '&width=' + swidth + '&height=' + sheight;

BASE   = 'OMNI_OMNIHR';
CAP    = 'Default caption';
var INPUT  =  [
     		[1,0, 80,170,''],
	      		[2,0,  0,  0,'Figure 2'],
	      		[3,0,-20,-60,'Figure 3']
		      ];

urlBase1 = 'http://virbo.org/cache/AutoplotServlet/SimpleServlet?url=tsds.http%3A%2F%2Ftimeseries.org%2Fget.cgi%3FStartDate%3D19950101%26EndDate%3D20080831%26ext%3Dbin%26out%3Dtsml%26ppd%3D1440%26filter%3Dmean';
urlBase2 = '&process=&renderType=&color=%230000ff&fillcolor=%23000000&foregroundColor=%23000000&backgroundColor=%23ffffff&column=5em%2C100%25-3em&row=3em%2C100%25-3em&font=sans-14&format=image%2Fpng';

var MESSAGES = new Array();
for (var i=0; i < INPUT.length; i++){
    if (INPUT[i][6] == '') {
	caption = CAP;
    } else {
	caption = '<b>[Click to expand]</b> ' + INPUT[i][4];
    }
    name       = BASE + "-" + INPUT[i][0] + "-v" + INPUT[i][1];
    paramValue = '%26param1%3D' + name;
    urlBase    = urlBase1 + paramValue + urlBase2;
    largeURL   = urlBase + largeDimension;
    smallURL   = urlBase + smallDimension;
    MESSAGES[i] = new Array(smallURL, largeURL, caption );
}