
var gCursorX = NumDataPoints-1;
var bDraggingLegend = false;

// specify the limits of the visible x-axis for the stats
var browserStartPoint = 0;
var browserEndPoint = NumDataPoints-1;
var BrowserCurrentMaxY = 0;
var bDraggingLatch = false;

var BrowserPieElements = null;


var KEY_LEFT = 37;
var KEY_RIGHT = 39;
var SHOW_PIE = 0;
var SHOW_LEGEND = 1;
var INTERACTIVE = 1;
var PLOT_WIDTH = 700.0;
var PLOT_HEIGHT = 300.0;
var PLOT_ULx = 40.0;
var PLOT_ULy = 40.0;
var WINDOW_WIDTH = 800;
var WINDOW_HEIGHT = 400;
var WINDOW_ULx = 0;
var WINDOW_ULy = 0;

//var osStartPoint = 0;
//var osEndPoint = NumDataPoints-1;
//var OSCurrentMaxY = 0;

var ns = {  
            svg:'http://www.w3.org/2000/svg', 
            xlink:'http://www.w3.org/1999/xlink',
            drag:'http://www.codedread.com/dragsvg'
         };
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
