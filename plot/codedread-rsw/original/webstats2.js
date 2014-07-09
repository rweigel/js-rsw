/*
    WebStats Scripts
 
    Original Version Copyright(c) 2006, Jeff Schiller (http://blog.codedread.com/).
    
    Several enhancements provided by Johan Sundstrom (http://ecmanaut.blogspot.com/)
    and the full article about how this came to be is available at
    http://ecmanaut.blogspot.com/2006/01/svg-challenge-taken.html
    
    BIZARRE NOTE: ASV's scripting engine does not like the way Johan's last name is 
    spelled so I have modified it.

    Permission is hereby granted to use and/or modify this software as long as 
    credits are given to the creators listed above.

    Reference: http://www.rad-e8.com/log/i/0912diag_ua.jpg

    Enhancements since the last iteration:
    
    - Added all of Johan's enhancements (including the CSS, the better text, more labels)
    - Made the legend draggable (bug: in IE after you drag, it requires 2 clicks to move the horiz cursor)
    - Fixed colour scheme for all browsers
    - Made the horizontal cursor draggable, pie chart updates as you drag (slowly at this time)
    - Moved time-based chart drawing to client side
    - Made grippies part of a scrollbar that allows panning (slick but slow)
*/

var ns = {  
            svg:'http://www.w3.org/2000/svg', 
            xlink:'http://www.w3.org/1999/xlink',
            drag:'http://www.codedread.com/dragsvg'
         };
var KEY_LEFT = 37;
var KEY_RIGHT = 39;
// TO DO: KEY_UP and DOWN here

var css = {
    // My Colours
    // Scheme is:  The most recent browser version matches the primary colour
    //             of the given browser's logo.  Earlier versions get lighter
    //             as they go back in time.  Pre-Release version gets darker.
    //             "Other" is the darkest.
    // Oranges
    FirefoxOther:   { fill: 'rgb(232,116,0)' },
    Firefox20x:     { fill: 'rgb(255,128,0)' }, 
    Firefox15x:     { fill: 'rgb(255,150,45)' }, // current
    Firefox10x:     { fill: 'rgb(255,170,85)' },

    // Cyans
    SafariOther:    { fill: 'rgb(54,194,241)' }, 
    Safari20x:      { fill: 'rgb(60,197,242)' }, 
    Safari13x:      { fill: 'rgb(75,202,243)' }, // current
    Safari12x:      { fill: 'rgb(100,208,244)' }, 
    Safari11x:      { fill: 'rgb(136,219,247)' }, 
    
    // Reds
    OperaOther:     { fill: 'rgb(158,20,23)' },
    Opera90x:       { fill: 'rgb(178,23,25)' },
    Opera85x:       { fill: 'rgb(200,26,30)' }, // current
    Opera80x:       { fill: 'rgb(222,29,34)' },
    Opera7x:        { fill: 'rgb(232,68,72)' },

    // Canary yellow, like their logo
    Konqueror:      { fill: 'rgb(255,243,0)' }, 
    
    // Blues
    IEOther:        { fill: 'rgb(0,60,100)' },
    IE70x:          { fill: 'rgb(0,79,131)' },
    IE60x:          { fill: 'rgb(0,90,151)' },
    IE55x:          { fill: 'rgb(0,115,191)' },
    IE5x:           { fill: 'rgb(0,133,221)' },

    // Other Browsers and OS    
    Other:          { fill: 'rgb(160,160,160)' },

//    // Windows Family
//    Windows2000:        { fill: 'rgb(0,0,255)' },
//    WindowsXP:          { fill: 'rgb(0,0,192)' },
//    Windows2003Server:  { fill: 'rgb(0,0,160)' },
//    WindowsVista:       { fill: 'rgb(0,0,128)' },
//    WindowsOther:       { fill: 'rgb(0,0,80)' },
//
//    // Mac
//    Mac:            { fill: 'rgb(0,160,0)' },
//
//    // Linux
//    Linux:          { fill: 'rgb(160,0,0)' },
//    

    OuterRing:    { fill: '#777', stroke: 'none' },
    InnerRing:    { fill: 'none', stroke: '#FFF', "stroke-opacity": '0.35', "stroke-width": '1.4px' },
    BrVerFill:    { fill: '#FFF', stroke: 'none', "fill-opacity": '0.1' },
    BrPctFill:    { fill: '#FFF', stroke: 'none', "fill-opacity": '0.1' },
    PieTitle:     { fill: '#000', stroke: 'none', "text-anchor": 'middle', "font-size": '16px' },
    PieSubTitle:  { fill: '#000', stroke: 'none', "text-anchor": 'middle', "font-size": '12px' },
    label:        { fill: '#FFF', stroke: 'none', "text-anchor": 'middle', "font-size": '9px', "text-shadow": '#666 1px 1px 1px' },
    browser:      { "font-weight": 'bold', "font-size": '11px', "text-shadow": '#000 1px 1px 1px' },
    wedge:        { stroke: 'none' },
    
    RollingAve:   { fill: 'none', stroke: 'black', "stroke-width": '1', "stroke-dasharray": "3,2" }
};

var gCursorX = NumDataPoints-1;
var bDraggingLegend = false;

// specify the limits of the visible x-axis for the stats
var browserStartPoint = 0;
var browserEndPoint = NumDataPoints-1;
var BrowserCurrentMaxY = 0;

//var osStartPoint = 0;
//var osEndPoint = NumDataPoints-1;
//var OSCurrentMaxY = 0;

// for some reason, Opera seems not to apply CSS styles to created nodes. :-(
function forceStyles( attr )
{
    var all = attr["id"]+' '+attr["class"], id, type, styles, selector = /\S+/g;
    while( id = selector.exec( all ) )
    {
        if( (styles = css[id[0]]) )
        for( type in styles ) // (attr[type] ? attr[type]+';' : '' ) + 
            attr[type] = styles[type];
    }
  return attr;
}

function $( id )
{
  return document.getElementById( id );
}

function make( name, attr, text, url )
{
    var node = document.createElementNS( ns.svg, name );
    var name = '', atns;
    if(attr) {
        attr = forceStyles( attr );
        for( var i in attr )
        {
            atns = (/^(.*):/.exec( i )||[,null])[1];
            node.setAttributeNS( atns && ns[atns], i, attr[i] );
        }
    }
    if( text )
    {
        text = document.createTextNode( text );
        node.appendChild( text );
        if( url )
        {
            var a = make( 'a', { 'xlink:href':url } );
            a.appendChild( node );
            return a;
        }
    }
    return node;
}

function removeChildren( node )
{
  while( node.hasChildNodes() )
  node.removeChild( node.firstChild );
}

function cssname( name )
{
  return name.replace( /[. /]/g, '' );
}

function draggingLegend() {
    bDraggingLegend = true;
}

// SVG file will have the raw data in:
// - NumDataPoints is the number of data points
// - BrowserData maps series names to arrays of values
// - Colors maps series names to RGB color strings
function init() 
{
    var svgnode = $("svgsvg");
    if(svgnode) {
        svgnode.addEventListener("click", clickGraph, false);
        svgnode.addEventListener("keydown", getKey, false);
        
        var legend = $("browser_legend");
        if(legend) {
            legend.addEventListener("mousedown", draggingLegend, false);
        }
        
        // set up a listener for the horizontal cursor being dragged
        addDragEventListener("dragstart", dragStart);
        addDragEventListener("dragmove", dragMove);
        addDragEventListener("dragdrop", dragDrop);

        createTimeBasedChart();
        
        // set up pie chart elements
        BrowserPieElements = new PieElementsContainer();

        drawPieChart();
        drawLegend();
        showLegend();
    }
}

// TO DO: KEY_UP and KEY_DOWN changes the currently selected stat
function getKey(evt) {
    switch(evt.keyCode) {
    case KEY_LEFT:
        evt.preventDefault();
        if(gCursorX > browserStartPoint) {
            --gCursorX;
            // update cursor
            var cur = $("browser_horizcurs");
            if(cur) {
                var x = 400*(gCursorX-browserStartPoint)/(browserEndPoint-browserStartPoint);
                cur.setAttributeNS(null, "transform", "translate(" + x + ",0)");
                cur.setAttributeNS(ns.drag, "x", x);
            }

            // update pie chart
            drawPieChart();
        }
        break;
    case KEY_RIGHT:
        evt.preventDefault();
        if(gCursorX < browserEndPoint) {
            ++gCursorX;
            // update cursor
            var cur = $("browser_horizcurs");
            if(cur) {
                var x = 400*(gCursorX-browserStartPoint)/(browserEndPoint-browserStartPoint);
                cur.setAttributeNS(null, "transform", "translate(" + x + ",0)");
                cur.setAttributeNS(ns.drag, "x", x);
            }

            // update pie chart
            drawPieChart();
        }
        break;
    }
}

var bDraggingLatch = false;

function dragMove(evt) {
    if(!bDraggingLatch) {
        bDraggingLatch = true;
        
        if(evt.dragEnt == $('browser_horizcurs')) {
            var newCursorX = browserStartPoint + Math.round( (evt.userx/400) * (browserEndPoint-browserStartPoint) );
            if(newCursorX >= browserStartPoint && newCursorX <= browserEndPoint) {
                gCursorX = newCursorX;
                drawPieChart();
            }
        }
        else if(evt.dragEnt == $('browser_leftgrip') || evt.dragEnt == $('browser_rightgrip')) {
            var left = parseFloat($('browser_leftgrip').getAttributeNS(ns.drag,"x"));
            var right = 400 + parseFloat($('browser_rightgrip').getAttributeNS(ns.drag,"x"));
            changeGlobalXAxisBounds(left,right);
        }
        else if(evt.dragEnt == $('browser_scrollbar') ) {
            var left = parseFloat($('browser_scrollbar').getAttributeNS(ns.drag,"x"));
            var right = left + parseFloat($('browser_scrollbar').getAttributeNS(null, "width"));
            changeGlobalXAxisBounds(left,right);
        }
        else {
            // moving legend - who cares
        }
        
        bDraggingLatch = false;
    }
}

function dragStart(evt) {
    if( evt.dragEnt == $('browser_leftgrip') || 
        evt.dragEnt == $('browser_rightgrip') ||
        evt.dragEnt == $('browser_scrollbar')
        ) 
    {
        // remove axes
        var axes = $('browser_timechartaxes');
        removeChildren(axes);
    }
}

// recreate axes
function dragDrop(evt) {
    if( evt.dragEnt == $('browser_leftgrip') || 
        evt.dragEnt == $('browser_rightgrip') ||
        evt.dragEnt == $('browser_scrollbar')
        ) 
    {
        // this will change the MaxY and the gCursorX
        reflowTimeBasedAxesAndPie();

        // this will potentially rescale in the y-direction
        var left = parseFloat($('browser_leftgrip').getAttributeNS(ns.drag,"x"));
        var right = 400 + parseFloat($('browser_rightgrip').getAttributeNS(ns.drag,"x"));
        changeGlobalXAxisBounds(left,right);
    }
}

function clickGraph(evt) {
    // only process if the click was on the graph (not the legend)
    if(bDraggingLegend) { 
        bDraggingLegend = false;
        return;
    }
            
    var p = document.documentElement.createSVGPoint();
    p.x = evt.clientX;
    p.y = evt.clientY;

    var screenCTMInv = getScreenCTM().inverse();
    p = p.matrixTransform(screenCTMInv);
    
    if(p.x >= 0 && p.y >= 0 && p.x <= 400 && p.y <= 300) {
        // determine the data point to use
        gCursorX = browserStartPoint + Math.round( (p.x/400) * (browserEndPoint-browserStartPoint) );

        // actual X will be aligned with the data points
        var actualX = (400 * (gCursorX-browserStartPoint)) / (browserEndPoint-browserStartPoint);
        
        // update cursor
        var cur = $('browser_horizcurs');
        if(cur) {
            cur.setAttributeNS(null, "transform", "translate(" + actualX + ",0)");
            cur.setAttributeNS(ns.drag, "x", actualX);
        }
        
        // update pie chart
        drawPieChart();
    }
}

function changeGlobalXAxisBounds(left, right) {
    // modify the constraints of each grip
    var leftgrip = $('browser_leftgrip');
    var rightgrip = $('browser_rightgrip');
    var scrollBar = $('browser_scrollbar');

    if(!leftgrip || !rightgrip || !scrollBar) { return; }

    leftgrip.setAttributeNS(null, "transform", "translate(" + left + ")");
    leftgrip.setAttributeNS(ns.drag, "x", left);
    leftgrip.setAttributeNS(ns.drag,"constraintRight",(right - (10 * 400 / NumDataPoints)));
    
    rightgrip.setAttributeNS(null, "transform", "translate(" + (right - 400) + ")");
    rightgrip.setAttributeNS(ns.drag, "x", (right - 400));
    rightgrip.setAttributeNS(ns.drag,"constraintLeft",(-400 + left + (10 * 400 / NumDataPoints)));
    
    // change the scrollbar dimensions:
    var w = (right - left);

    scrollBar.setAttributeNS(null, "width", w);
    scrollBar.setAttributeNS(null, "transform", "translate(" + left + ")");

    scrollBar.setAttributeNS(ns.drag, "x", left);
    scrollBar.setAttributeNS(ns.drag, "constraintLeft",0);
    scrollBar.setAttributeNS(ns.drag, "constraintRight", 400-w);
    
    reflowTimeBasedGraph(left,right);
}

function reflowTimeBasedAxesAndPie() 
{
    // next, run through the raw data, determine the max Y (find the y-limit)
    // it's too bad there is no way around this 
    var maxY = 0;
    for(var day = browserStartPoint; day <= browserEndPoint; ++day) {
        var thisDaySumY = 0;
        for(browser in BrowserData) {
            thisDaySumY += BrowserData[browser][day];
        }

        // determine maximum Y
        var max = parseInt(thisDaySumY/100 + 1) * 100;
        if(max > maxY) { maxY = max; }
    }
    BrowserCurrentMaxY = maxY;

    // next, re-create the x and y axes elements
    var axes = $('browser_timechartaxes');
    var yaxis = drawTimeBasedYAxis(maxY);
    var xaxis = drawTimeBasedXAxis(browserStartPoint,browserEndPoint);

    // next, determine if the horizontal cursor needs to be shifted
    var bNeedToRedrawPieChart = false;
    if(gCursorX < browserStartPoint) { 
        gCursorX = browserStartPoint; 
        bNeedToRedrawPieChart = true;
    }
    else if(gCursorX > browserEndPoint) { 
        gCursorX = browserEndPoint; 
        bNeedToRedrawPieChart = true;
    }

    // update horizontal cursor
    var cur = $("browser_horizcurs");
    if(cur) {
        var x = 400*(gCursorX-browserStartPoint)/(browserEndPoint-browserStartPoint);
        cur.setAttributeNS(null, "transform", "translate(" + x + ",0)");
        cur.setAttributeNS(ns.drag, "x", x);
    }
    if(bNeedToRedrawPieChart) {
//        setTimeout("drawPieChart()", 1);
        drawPieChart();
    }
    
    // next, remove the x and y axes
    removeChildren(axes);
    // next, add in the new x- and y- axes elements
    axes.appendChild(yaxis);
    axes.appendChild(xaxis);
}

function reflowTimeBasedGraph(left,right)
{
    // first, determine the data points that the grippies map to
    browserStartPoint = Math.round( (left/400) * (NumDataPoints-1) );
    browserEndPoint = Math.round( (right/400) * (NumDataPoints-1) );

    // next, re-transform the paths
    var numPts = (browserEndPoint - browserStartPoint);
    var scaleX = 400.0 / numPts;
    var scaleY = 300.0 / BrowserCurrentMaxY;
    // translateX by 400.0 will always align the right-most point (most recent) with
    // the right edge of the graph - we need to shove it further right by 
    // (NumDataPoints - 1 - browserEndPoint) points
    var nudge = (NumDataPoints - 1 - browserEndPoint)*400/numPts;
    var translateX = 400.0 + nudge;
    var translateY = 300.0;
    var graphUnscaled = $('browser_timechartseries');
    graphUnscaled.setAttributeNS(null, "transform", "translate(" + translateX + "," + translateY + ")  scale(-1,-1)");
    var graph = $('browser_timechartseries_scaled');
    graph.setAttributeNS(null, "transform", "scale(" + scaleX + "," + scaleY + ") ");
}

function drawLegend()
{
  var x = 10, y = 20, h = 11, w = 30, dy = 0, c; // dy = 5
  var g = $( 'browser_legend' );
  if( !g ) return;
  for(var browser in BrowserData)
  {
    c = cssname( browser );
    browser = browser.replace( '/', ' ' );
    g.appendChild( make( 'rect', { "x":x, "y":y, "width":w, "height":h, "class":c } ) );
    g.appendChild( make( 'text', { "x":x+w+x, "y":y+8, "font-size":'10', "fill":'#DEDEDE' }, browser ) );
    y += h + dy;
  }

//  g = $( 'os_legend' );
//  y = 20;
//  for(var os in OSData)
//  {
//    c = cssname( os );
//    os = os.replace( '/', ' ' );
//    g.appendChild( make( 'rect', { "x":x, "y":y, "width":w, "height":h, "class":c } ) );
//    g.appendChild( make( 'text', { "x":x+w+x, "y":y+8, "font-size":'10', "fill":'#DEDEDE' }, os ) );
//    y += h + dy;
//  }
}

function showLegend() 
{
    var legend = $("browser_legend");
    if(legend) {
        legend.setAttributeNS(null, "display", "inline");
    }
//    legend = $("os_legend");
//    if(legend) {
//        legend.setAttributeNS(null, "display", "inline");
//    }
}

function hideLegend() 
{
    var legend = $("browser_legend");
    if(legend) {
        legend.setAttributeNS(null, "display", "none");
    }
//    legend = $("os_legend");
//    if(legend) {
//        legend.setAttributeNS(null, "display", "none");
//    }
}

// This function takes the raw data, creates stacked paths that map to it, 
// creates y and x-axis tick marks and labels, then wipes out "wholegraph" 
// children and appends everything to it
function createTimeBasedChart()
{
    // set up global x-axis (including grippies)
    var xaxisGlobal = null;

    xaxisGlobal = drawTimeBasedXAxis(0,NumDataPoints-1);
    xaxisGlobal.appendChild(make('line', {x1:0, y1:300, x2:400, y2:300, stroke:"black", "stroke-width":"3px"}));
    xaxisGlobal.appendChild(make('line', {x1:400, y1:300-5, x2:400, y2:300+5, stroke:"black", "stroke-width":"3px"}));

    var scrollBar = make('rect', {id:"browser_scrollbar", x:0, y:(300-3), width:400, height:6,
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
    var leftGrippie = make('use', {"xlink:href":"#grippie", transform:'translate(0,300)'});
    leftGrip.appendChild(leftGrippie);
    enableDrag(leftGrip);
    leftGrip.setAttributeNS(ns.drag, "constraintLeft",0);
    leftGrip.setAttributeNS(ns.drag, "constraintTop",0);
    leftGrip.setAttributeNS(ns.drag, "constraintRight",400);
    leftGrip.setAttributeNS(ns.drag, "constraintBottom",0);
    xaxisGlobal.appendChild(leftGrip);

    var rightGrip = make('g', {id:'browser_rightgrip', fill:'url(#stopButt)'});
    var rightGrippie = make('use', {"xlink:href":"#grippie", transform:'translate(400,300)'});
    rightGrip.appendChild(rightGrippie);
    enableDrag(rightGrip);
    rightGrip.setAttributeNS(ns.drag, "constraintLeft",-400);
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
    var browser_scaleX = 400.0 / browser_numPts;
    var browser_scaleY = 300.0 / BrowserCurrentMaxY;
    var browser_translateX = 400.0;
    var browser_translateY = 300.0;
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
        var ycoord = (300 - 300 * y / maxY);
        ele.appendChild( make('line', {x1:(0-5), y1:ycoord, x2:(0+5), y2:ycoord, stroke:"black", "stroke-width":"3px"} ) );
                                       
        // faint line
        ele.appendChild( make('line', {x1:0, y1:ycoord, x2:400, y2:ycoord, stroke:"grey", "stroke-width":"1px", opacity:0.5}) );
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
    
    ele.appendChild( make('line', {x1:0, y1:(300-5), x2:0, y2:(300+5), stroke:"black", "stroke-width":"3px"}) );
    ele.appendChild( make('line', {x1:400, y1:(300-5), x2:400, y2:(300+5), stroke:"black", "stroke-width":"3px"}) );
    for(var ind = 0; ind < xticks.length; ++ind) {
        ele.appendChild( make('line', {"x1":(400 * xticks[ind][1] / numPts),
                                       "y1":(300 - 5),
                                       "x2":(400 * xticks[ind][1] / numPts),
                                       "y2":(300 + 5),
                                       "stroke":"black", 
                                       "stroke-width":"3px"} ) );

        ele.appendChild( make('text', {"x":(400 * xticks[ind][1] / numPts),
                                       "y":(300 + 20), 
                                       "text-anchor":"middle",
                                       "font-size":"12"}, xticks[ind][0] ) );
    }
    
    return ele;
}


function PieElementsContainer() {
    var r = 125, cx = 150, cy = 150;
    
    this.elem = $('browser_piegroup'); //make('g', {id:'Top'});
//    this.elem.setAttributeNS(null, 'transform', 'translate(450,0)');//display', 'none');
//    $('browser_stat').appendChild(this.elem);
    
    this.elem.appendChild( make('circle', {id:'OuterRing', cx:cx, cy:cy, r:cx }) );
    this.AllWedges = this.elem.appendChild( make( 'g', {id:'AllWedges', 
                                                        transform:'rotate(90,150,150)'}) );
    var LabelG = make( 'g', {id:'LabelG'} );
    var ele = 0;
    var browsers = {}, name;
    this.BrowserWedgePaths = new Object();
    this.BrowserPctLabels = new Object();
    this.BrowserVerLabels = new Object();
    this.BrowserFamilyLabels = new Object();
    for(var browser in BrowserData) {

        // create wedge path elements
        var attr = { id:("WEDGE" + browser), 'class':"wedge " + cssname(browser) };
        if(!ele) {
            attr['cx'] = cx; attr['cy']=cy; attr['r'] = r;
            ele = make( 'circle', attr );            
        }
        else {
            ele = make( 'path', attr );
        }
        this.BrowserWedgePaths[browser] = this.AllWedges.appendChild(ele);
        
        // create labels (percentages and version)
        this.BrowserPctLabels[browser] = LabelG.appendChild(make('text', { 'class':'label pct'}, '%'));

        var version = browser.split( '/' )[1];
        if( version == 'Other' ) version = 'X';
        
        this.BrowserVerLabels[browser] = LabelG.appendChild(make('text', { 'class':'label version'}, version));
        
        name = browser.replace( /\/.*/, '' );
        if(!this.BrowserFamilyLabels[name]) {
            this.BrowserFamilyLabels[name] = LabelG.appendChild( make('text', {'class':'label browser'}, name) );
        }

    } // for(var browser in BrowserData)
    
    this.AllWedges.appendChild( LabelG );
    this.elem.appendChild( make('circle', {'id':'InnerRing', 'cx':cx, 'cy':cy, 'r':r-1 }) );
    this.elem.appendChild( make('circle', {'id':'BrVerFill', 'cx':cx, 'cy':cy, 'r':r-15 }) );
    this.elem.appendChild( make('circle', {'id':'BrPctFill', 'cx':cx, 'cy':cy, 'r':r-30 }) );    
    
    this.Title = this.elem.appendChild( make('text', {id:'PieTitle',x:150,y:325}, 'Distribution for '));
    this.SubTitle = this.elem.appendChild( make('text', {id:'PieSubTitle',x:150,y:340}, 'Total Hits: '));
}

var BrowserPieElements = null;

// TO DO:  Fix this function for sparse data (see soverygood.com)
function drawPieChart()
{
    if(document.documentElement.suspendRedraw) {
        document.documentElement.suspendRedraw(200);
    }
    
    var TotalBrowserHits = 0;
    for(var browser in BrowserData) {
        TotalBrowserHits += BrowserData[browser][gCursorX]||0;
    }

    var pct = 0, prevBrowserPct = 0;
    var r = 125, cx = 150, cy = 150;
    var startx = 0, starty = 0, endx = 0, endy = 0;
    var theta = 0, delta = 0;
    var ele = 0;
    var attr = null;
    var pf = 26, vf = 13; // percent and version radial offsets, in pixels

    var browsers = {}, name;
  
    for(var browser in BrowserPieElements.BrowserWedgePaths) {
        BrowserPieElements.BrowserWedgePaths[browser].setAttributeNS(null, "display", "none");
        BrowserPieElements.BrowserPctLabels[browser].setAttributeNS(null, "display", "none");
        BrowserPieElements.BrowserVerLabels[browser].setAttributeNS(null, "display", "none");
    }
    
    for(var browser in BrowserData) {
        pct = prevBrowserPct + (BrowserData[browser][gCursorX]||0) / TotalBrowserHits;
        if(pct == prevBrowserPct) { continue; }

        name = browser.replace( /\/.*/, '' );
        browsers[name] = (browsers[name]||0) + pct - prevBrowserPct;
    
        // starting point:
        theta = (2 * Math.PI) * prevBrowserPct;
        delta = -theta;
        startx = cx - Math.cos(theta) * r; // negative sign is to mirror horizontally
        starty = cy - Math.sin(theta) * r; // negative sign is because y is in the down direction

        // end point:
        theta = (2 * Math.PI) * pct;
        delta += theta;
        endx = cx - Math.cos(theta) * r; // negative sign is to mirror horizontally
        endy = cy - Math.sin(theta) * r; // negative sign is because y is in the down direction

        attr = { 'class':"wedge " + cssname(browser) };
         
        BrowserPieElements.BrowserWedgePaths[browser].setAttributeNS(null, "display", "inline");
        BrowserPieElements.BrowserWedgePaths[browser].setAttributeNS(null, "d", 
                  "M" + startx + "," + starty + " " + // elliptical arc to the end point
                  "A" + r + "," + r + " 0 " +  // radii and x-axis-rotation
                  ( (delta > Math.PI || delta < 0) ? 1 : 0 ) + // large-arc-flag 
                  " 1 " + // sweep-flag
                  endx + "," + endy + " " + 
                  "L" + cx + "," + cy + " Z");

        // Now draw percentage label 
        var thisPct = Math.round(100.0*(pct-prevBrowserPct));
        if(thisPct > 2.0) {
            theta -= ( (delta/2) );
            var lx = Math.cos(theta);
            var ly = Math.sin(theta);
            var angle = (theta * 180.0 / Math.PI) - 90;
            var version = browser.split( '/' )[1];
            if( version == 'Other' ) version = 'X';

            removeChildren(BrowserPieElements.BrowserPctLabels[browser]);
            BrowserPieElements.BrowserPctLabels[browser].appendChild(document.createTextNode(thisPct + "%"));
            var str = 'translate('+(cx-lx*(r-pf))+','+(cy-ly*(r-pf))+') ' + 'rotate('+ angle +') ';
            BrowserPieElements.BrowserPctLabels[browser].setAttributeNS(null, "display", "inline");
            BrowserPieElements.BrowserPctLabels[browser].setAttributeNS(null, "transform", str);

            str = 'translate('+(cx-lx*(r-vf))+','+(cy-ly*(r-vf))+') ' + 'rotate('+ angle +') ';
            BrowserPieElements.BrowserVerLabels[browser].setAttributeNS(null, "transform", str);
            BrowserPieElements.BrowserVerLabels[browser].setAttributeNS(null, "display", "inline");
        }
//        else {
//            BrowserPieElements.BrowserPctLabels[browser].setAttributeNS(null, "display", "none");
//            BrowserPieElements.BrowserVerLabels[browser].setAttributeNS(null, "display", "none");
//        }

        prevBrowserPct = pct;

    } // for each series

    // Now draw browser name labels
    prevBrowserPct = pct = 0;
    for(var browser in browsers)
    {
        pct = browsers[browser];
        theta = (prevBrowserPct + pct/2) * Math.PI * 2;
        var labx = cx - Math.cos(theta) * (r+7.8);
        var laby = cy - Math.sin(theta) * (r+7.8);
        
        var str = 'translate('+ labx +','+ laby +') '+
                    'rotate('+ ((theta * 180.0 / Math.PI) - 90) +') ';
        BrowserPieElements.BrowserFamilyLabels[browser].setAttributeNS(null, "transform", str);
        
        prevBrowserPct += pct;
    }

    // add titles
    var date = Dates[gCursorX];
                         
    removeChildren(BrowserPieElements.Title);
    BrowserPieElements.Title.appendChild(document.createTextNode('Distribution for ' + date));
    
    removeChildren(BrowserPieElements.SubTitle);
    BrowserPieElements.SubTitle.appendChild(document.createTextNode('Total Browser Hits: ' + TotalBrowserHits));
    
    if(document.documentElement.unsuspendRedrawAll) {
        document.documentElement.unsuspendRedrawAll();
    }
} // end drawPieChart()
