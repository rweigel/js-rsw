include('math/lat2pixel.js');
include('math/lon2pixel.js');
include('misc/size.js');

function hotspot(img){

    rad    = 30;
    wh     = size(img);
    width  = wh[0];
    height = wh[1];

    hotspotStr = "";
    for (var i=0; i < INPUT.length; i++){
	areaStr = "<area shape='circle' onmouseover='showtip(event," + i + ",true,MESSAGES)' onmouseout='hidetip()' onclick='showtip(event, " + i + ",false,MESSAGES)'";
	coordStr = "coords='" + lon2pixel(INPUT[i][3],width) + "," + lat2pixel(INPUT[i][2],height) + "," + rad + "'>";
	hotspotStr += (areaStr + coordStr);
    }
    id = document.getElementById("map");
    id.innerHTML = id.innerHTML + hotspotStr;

    for (var i = 0; i < INPUT.length; i++) {
        $("#canvas").fillEllipse(lon2pixel(INPUT[i][3], width) - rad / 2.0, lat2pixel(INPUT[i][2], height) - rad / 2.0, rad, rad, {
            color: 'yellow',
            stroke: 2
        });
    }


    
}
