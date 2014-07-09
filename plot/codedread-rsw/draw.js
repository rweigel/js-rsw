// This function takes the raw data, creates stacked paths that map to it, 
// creates y and x-axis tick marks and labels, then wipes out "wholegraph" 
// children and appends everything to it
function createTimeBasedChart()
{
    // set up global x-axis (including grippies)
    var xaxisGlobal = null;

    xaxisGlobal = drawTimeBasedXAxis(0,NumDataPoints-1);
    xaxisGlobal.appendChild(make('line', {x1:0, y1:(PLOT_HEIGHT), x2:(PLOT_WIDTH), y2:(PLOT_HEIGHT), stroke:"black", "stroke-width":"3px"}));
    xaxisGlobal.appendChild(make('line', {x1:(PLOT_WIDTH), y1:(PLOT_HEIGHT-5), x2:(PLOT_WIDTH), y2:(PLOT_HEIGHT+5), stroke:"black", "stroke-width":"3px"}));

    var scrollBar = make('rect', {id:"browser_scrollbar", x:0, y:(PLOT_HEIGHT-3), width:(PLOT_WIDTH), height:6,
                                  stroke:"none", fill:"blue"
//                                      , "fill-opacity":0.7
                                  });
    enableDrag(scrollBar);
    scrollBar.setAttributeNS(ns.drag, "constraintLeft",0);
    scrollBar.setAttributeNS(ns.drag, "constraintTop",0);
    scrollBar.setAttributeNS(ns.drag, "constraintRight", 0);
    scrollBar.setAttributeNS(ns.drag, "constraintBottom",0);
    xaxisGlobal.appendChild(scrollBar);

    var leftGrip = make('g', {id:'browser_leftgrip', fill:'url(#startButt)'});
    var	str_transform = 'translate(0,'+PLOT_HEIGHT+')';
    var leftGrippie = make('use', {"xlink:href":"#grippie", transform:str_transform});
    leftGrip.appendChild(leftGrippie);
    enableDrag(leftGrip);
    leftGrip.setAttributeNS(ns.drag, "constraintLeft",0);
    leftGrip.setAttributeNS(ns.drag, "constraintTop",0);
    leftGrip.setAttributeNS(ns.drag, "constraintRight",PLOT_WIDTH);
    leftGrip.setAttributeNS(ns.drag, "constraintBottom",0);
    xaxisGlobal.appendChild(leftGrip);

    var rightGrip = make('g', {id:'browser_rightgrip', fill:'url(#stopButt)'});
    var	str_transform = 'translate('+PLOT_WIDTH+','+PLOT_HEIGHT+')';
    var rightGrippie = make('use', {"xlink:href":"#grippie", transform:str_transform});
    rightGrip.appendChild(rightGrippie);
    enableDrag(rightGrip);
    rightGrip.setAttributeNS(ns.drag, "constraintLeft",-PLOT_WIDTH);
    rightGrip.setAttributeNS(ns.drag, "constraintTop",0);
    rightGrip.setAttributeNS(ns.drag, "constraintRight",0);
    rightGrip.setAttributeNS(ns.drag, "constraintBottom",0);
    xaxisGlobal.appendChild(rightGrip);
    xaxisGlobal.setAttributeNS(null, "transform", "translate(0,40)");

    if(xaxisGlobal) {
        var g = $('browser_timechartglobalaxis');
        removeChildren(g);
        g.appendChild(xaxisGlobal);
    }

    // Do Browser stat
    var browser_axes = $('browser_timechartaxes');
    var browser_graphUnscaled = $('browser_timechartseries');
    var browser_graph = $('browser_timechartseries_scaled');
    if(!browser_axes || !browser_graphUnscaled || !browser_graph) { return; }

    var browser_pathStrings = new Array();    
    var browser_newpaths = new Array();
    var browser_xaxis = null;
    var browser_yaxis = null;
    var browserOrder = new Array();
    
    var numBrowsers = 0;
    for(var browser in BrowserData) {
        browser_pathStrings[browser] = "M0,0 L";
        browserOrder[browser] = numBrowsers;
        ++numBrowsers;
    }

    BrowserCurrentMaxY = 0;
    for( var day = browserEndPoint; day >= browserStartPoint; --day) {
        var ptNum = (browserEndPoint - day);
        var thisDaySumY = 0;
        for(browser in BrowserData) {
            thisDaySumY += BrowserData[browser][day];
            browser_pathStrings[browser] += (ptNum) + "," + thisDaySumY + " ";
        }

        // determine maximum Y
        var max = parseInt(thisDaySumY/100 + 1) * 100;
        if(max > BrowserCurrentMaxY) { BrowserCurrentMaxY = max; }
        
    } // for each day

    for(browser in BrowserData) {
        browser_pathStrings[browser] += (browserEndPoint - browserStartPoint) + ",0 Z";
        browser_newpaths[browserOrder[browser]] = make('path', {"class":cssname(browser), "d":browser_pathStrings[browser]});
    }

    browser_yaxis = drawTimeBasedYAxis(BrowserCurrentMaxY);
    browser_xaxis = drawTimeBasedXAxis(browserStartPoint,browserEndPoint);
    
    // all done, wipe out allpaths, add our new paths to it in reverse order
    removeChildren(browser_graph);
    for(var loop = numBrowsers - 1; loop >= 0; --loop) 
    {
        browser_graph.appendChild(browser_newpaths[loop]);
    }
    
    var browser_numPts = (browserEndPoint - browserStartPoint);
    var browser_scaleX = PLOT_WIDTH / browser_numPts;
    var browser_scaleY = PLOT_HEIGHT / BrowserCurrentMaxY;
    var browser_translateX = PLOT_WIDTH;
    var browser_translateY = PLOT_HEIGHT;
    browser_graphUnscaled.setAttributeNS(null, "transform", "translate(" + browser_translateX + "," + browser_translateY + ") scale(-1,-1)");
    browser_graph.setAttributeNS(null, "transform", "scale(" + browser_scaleX + "," + browser_scaleY + ") ");

    // add the axes
    removeChildren(browser_axes);
    browser_axes.appendChild(browser_yaxis);
    browser_axes.appendChild(browser_xaxis);
}

// returns SVG elements that form the Y-axis
function drawTimeBasedYAxis(maxY)
{
    var ele = make('g', {id:"yaxis"});
    
    // determine the y-ticks
    var yinc = 0;
    if(maxY > 5000000) { yinc = 1000000; }
    else if(maxY > 1000000) { yinc = 200000; }
    else if(maxY > 200000) { yinc = 40000; }
    else if(maxY > 40000) { yinc = 8000; }
    else if(maxY > 8000) { yinc = 1500; }
    else if(maxY > 1500) { yinc = 300; } // this is the level of traffic as of Jan 13 05
    else if(maxY > 300) { yinc = 50; }
    else if(maxY > 50) { yinc = 10; }
    else { yinc = 1; }

    // text labels for y-axis
    var y = 0;
    while(y < maxY) {
        var ycoord = (PLOT_HEIGHT - PLOT_HEIGHT * y / maxY);
        ele.appendChild( make('line', {x1:(0-5), y1:ycoord, x2:(0+5), y2:ycoord, stroke:"black", "stroke-width":"3px"} ) );
                                       
        // faint line
        ele.appendChild( make('line', {x1:0, y1:ycoord, x2:(PLOT_WIDTH), y2:ycoord, stroke:"grey", "stroke-width":"1px", opacity:0.5}) );
        ele.appendChild( make('text', {x:(0-10), y:(ycoord+5), "text-anchor":"end", "font-size":12}, y));
                              
        y += yinc;
    }
    
    return ele;
}

// returns SVG elements that form the X-axis
function drawTimeBasedXAxis(start,end)
{
    // X-Axis

    // xticks will store an array of arrays where the first element is the label 
    // and the second element is which data point to display it against
    var xticks = new Array();
    var numPts = end - start;// + 1;
    
    var ele = make('g', {id:"xaxis"});
    
    if(numPts > (365*2)) {
        // do every year
        var monthday = Dates[ind].substr(5,5);
        
        xticks[0] = [ Dates[start].substr(0,4), 0 ];
        
        // loop through $dates
        for(var ind = start; ind <= end; ++ind) {
            // extract the first 4 digits as the year
            if( monthday == '01-01' ) {
                xticks[xticks.length] = [ Dates[ind].substr(0,4), ind-start ];
            }
        } // for each date
    }
    else if(numPts > 180) {
        // do every quarter
        //                        Jan       Feb       Mar       Apr       May       June
        var quarters = [null, "Winter", "Winter", "Spring", "Spring", "Spring", "Summer", 
        //                    July      Aug      Sept    Oct    Nov      Dec
                            "Summer", "Summer", "Fall", "Fall", "Fall", "Winter"];
        
        // loop through Dates
        for(var ind = start; ind <= end; ++ind) {
            var year = Dates[ind].substr(2,2);
            var month = Dates[ind].substr(5,2);
            if(month.substr(0,1) == '0') { month = month.substr(1,1); }

            var monthday = Dates[ind].substr(5,5);
            if(monthday == '03-01' || monthday == '06-01' || monthday == '09-01' || monthday == '12-01') {
                var quartstr = (quarters[month] + year);
                xticks[xticks.length] = [ quartstr, ind-start ];
            }
        } // for each date
    }
    else if(numPts > 60) {
        // do every month
        var months = [null, "Jan", "Feb", "Mar", "Apr", "May", "June", 
                        "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

        // loop through Dates
        for(var ind = start; ind <= end; ++ind) {
            var year = Dates[ind].substr(2,2);
            var month = Dates[ind].substr(5,2);
            if(month.substr(0,1) == '0') { month = month.substr(1,1); }

            var day = Dates[ind].substr(8,2);
            if(day == '01') {
                var monthstr = months[month] + year;
            
                xticks[xticks.length] = [ monthstr, ind-start ];
            }
        } // for each date
    }
    else if(numPts > 30) {
        // do every 10 days
        // loop through Dates
        xticks[0] = [ Dates[start].substr(5,5), 0 ];
        
        for(var ind = start; ind <= end; ++ind) {
            if(( (ind-start) % 10) == 0) {
                var day = Dates[ind].substr(5,5);
                xticks[xticks.length] = [ day, ind-start ];
            }
        } // for each date
    }
    else {
        // do every 5 days
        // loop through Dates
        xticks[0] = [ Dates[start].substr(5,5), 0 ];
        
        for(var ind = start; ind <= end; ++ind) {
            if(( (ind-start) % 5) == 0) {
                var day = Dates[ind].substr(5,5);
                xticks[xticks.length] = [ day, ind-start ];
            }
        } // for each date
    }
    
    ele.appendChild( make('line', {x1:0, y1:(PLOT_HEIGHT-5), x2:0, y2:(PLOT_HEIGHT+5), stroke:"black", "stroke-width":"3px"}) );
    ele.appendChild( make('line', {x1:(PLOT_WIDTH), y1:(PLOT_HEIGHT-5), x2:(PLOT_WIDTH), y2:(PLOT_HEIGHT+5), stroke:"black", "stroke-width":"3px"}) );
    for(var ind = 0; ind < xticks.length; ++ind) {
        ele.appendChild( make('line', {"x1":(PLOT_WIDTH * xticks[ind][1] / numPts),
                                       "y1":(PLOT_HEIGHT - 5),
                                       "x2":(PLOT_WIDTH * xticks[ind][1] / numPts),
                                       "y2":(PLOT_HEIGHT + 5),
                                       "stroke":"black", 
                                       "stroke-width":"3px"} ) );

        ele.appendChild( make('text', {"x":(PLOT_WIDTH * xticks[ind][1] / numPts),
                                       "y":(PLOT_HEIGHT + 20), 
                                       "text-anchor":"middle",
                                       "font-size":"12"}, xticks[ind][0] ) );
    }
    
    return ele;
}

