function getDimensions(dim){
    if (dim === "height"){
       if (window.innerHeight){
          return window.innerHeight;
       }
       else if (document.documentElement.clientHeight){
          return document.documentElement.clientHeight;
       }
       else if (document.body.clientHeight){
          return document.body.clientHeight;
       }
    }
    else if (dim === "width"){
       if (window.innerWidth){
          return window.innerWidth;
       }
       else if (document.documentElement.clientWidth){
          return document.documentElement.clientWidth;
       }
       else if (document.body.clientWidth){
          return document.body.clientWidth;
       }
    }
    return undefined;
}

//-----------------------------------------------------------
// Filename: Smarttoc.js
// Date: 12/24/2010
// Instructions: In order to use this script on a MediaWiki
// page, copy the following line of html code into the
// head section and replace the src value with the
// path to the smarttoc.js file on your server -
//
// <script type="text/javascript" src="smarttoc.js"></script>
//
// Note: This script requires jQuery to run, so jQuery
// must be imported before the smarttoc.js file is imported.
//
// Description: This code uses the jQuery library to
// resize the table of contents in MediaWiki
// in order to fit the table on the page.  It displays
// as many entries as it can without causing overflow.
// It also provides the options to limit the length of
// an entry in the table of contents, and to individually
// show or hide the H1, H2, and H3 tag groups in the table.
//-----------------------------------------------------------

//-----------------------------------------------------------
// This is the global object literal which is used to store
// the variables needed by the script, as well as provide
// a namespace for the functions.
//-----------------------------------------------------------
function smartToc(pId, mId, mpId){

	var smartTocReference = this,
	    parentId = "",
	    menuParentId = mId || "content",
	    linkParentId = mpId || "#p-tb ul",
	    options = {
                  showTOC: true,
                  limitTitleLength: true,
                  showH1Sections: true,
                  H1Dynamic: true,
                  showH2Sections: true,
                  H2Dynamic: true,
                  showH3Sections: false,
                  H3Dynamic: false
                  },
        optionNames = ["showTOC", "limitTitleLength",
                       "showH1Sections", "H1Dynamic",
                       "showH2Sections", "H2Dynamic",
                       "showH3Sections", "H3Dynamic"],
        xmlTagList = ["ShowTOC", "SnipLongTitles",
                      "ShowH1s", "SmartH1Reveal",
                      "ShowH2s", "SmartH2Reveal",
                      "ShowH3s", "SmartH3Reveal"],
        elements = {},
        text = [],
        running = true,
        number = 0,
        scroll = 0,
        sections = {},
        sectionNum = 0,
        elementS = {},
        HSections = [],
        iteration = 0,
        answer = 0,
        level = 0,
        sensitivity = 145,
        placeholder = '<li class = "presentdots" class = "toclevel2" '+
                      'style = "display: block;">' +
                      '<a>' +
                        '<span class = "toctext" ' +
                        'style = "cursor: pointer;">...</span>' +
                      '</a>' +
                      '</li>',
        xml = {getFromServer: false,
               saveToServer: false,
               requestObject: {},
               requestMode: "",
               XMLText: "",
               fileExtension: ".smartXML"},
        pageName = "";

	//-----------------------------------------------------------
	// Updates the html code for the table of contents to
	// reflect any changes in conditions, such as the page
	// being resized or an option being set.
	//-----------------------------------------------------------
	var update = function(){
	    show();
	    fitOnPage();
	};
	
	//-----------------------------------------------------------
	// This function either shows or hides the table of contents
	// depending on the current option value for table
	// visibility.
	//-----------------------------------------------------------
	var show = function(){
	    if (options.showTOC){
	       $(parentId).show();
	    }
	    else{
	       $(parentId).hide();
	    }
	};
	
	//-----------------------------------------------------------
	// Creates a link in the Tools menu which will allow the
	// user to view the options menu for the smart Toc 
	// project when clicked.
	//-----------------------------------------------------------
	var setupLink = function(){
	    var linkHtml = '<li id = "smartTocLink">' +
	    '<a title = "Edit Smart TOC Options [F10]" style = "cursor: pointer;">' + 
	    'Smart TOC Options</a></li>';
	    $(linkParentId).prepend(linkHtml);
	};
	
	//-----------------------------------------------------------
	// Retrieves the text contents of the sections in the table
	// of contents in order to be able to restore a shortened
	// title to its original state.
	//-----------------------------------------------------------
	var getText = function(){
	    elements = $("table" + parentId + " li.toclevel-1 > a > span, " +
	                 "table" + parentId + " li.toclevel-2 > a > span," +
	                 "table" + parentId + " li.toclevel-3 > a > span");
	    for (var i = 0; i < elements.length; i++){
	        text[i] = elements.get(i).textContent;
	    }
	};
	
	//-----------------------------------------------------------
	// The restoreText function is used to replace the
	// shortened version of a long title in the table of
	// contents with the full, original text. If the user clicks
	// on the shortened element, or if the option to limit
	// the length of the titles is turned off, this code will
	// execute.
	//-----------------------------------------------------------
	var restoreText = function(event){
	    for (var i = 0; i < text.length; i++){
	        if (event.target == elements.get(i) ||
	           (!options.limitTitleLength) || event == "override"){
	            elements.get(i).textContent = text[i];
	        }
	    }
	 };
	
	//-----------------------------------------------------------
	// This function determines whether a title in the table
	// of contents is too long.  If it finds that one is too 
	// long, it cuts off the last portion of the text and 
	// places "..." at the end to indicate that the title
	// was shortened.  The user can click on them to 
	// display them in their entirety.
	//-----------------------------------------------------------
	var shortenText = function(){
	
	    var textParsedBySpace, tableHeight, counter, finval = 0;
	
	    if (text.length === 0){
	        getText();
	    }
	    else{
	        restoreText("override");
	    }
	    
	    if (options.limitTitleLength){
	       for (var i = 0; i < elements.length; i++){
	
	           tableHeight = $("table" + parentId).get(0).clientHeight;
	           
	           elements.get(i).textContent = "oneline";
	
	           if ($("table" + parentId).get(0).clientHeight == tableHeight){
	              elements.get(i).textContent = text[i];
	           }
	           else{
	              textParsedBySpace = text[i].split(" ");
	              tableHeight = $("table" + parentId).get(0).clientHeight;
	              counter = 0;
	              elements.get(i).textContent = "";
	              while (counter < textParsedBySpace.length)
	              {
	                 elements.get(i).textContent += textParsedBySpace[counter] + " ";
	                 if ($("table" + parentId).get(0).clientHeight > tableHeight){
	                    finval = counter;
	                    break;
	                 }
	                 counter += 1;
	              }
	              elements.get(i).textContent = "";
	              for (var t = 0; t < finval; t++){
	                 if (t + 1 < finval){
	                    elements.get(i).textContent += textParsedBySpace[t] + " ";
	                 }
	                 else{
	                    elements.get(i).textContent += textParsedBySpace[t];
	                    elements.get(i).textContent = elements.get(i).textContent.slice(0, -4) + "...";
	                 }
	              }
	           }
	       }
	    }
	    else{
	       restoreText("restoreFull");
	    }
	};
	
	//-----------------------------------------------------------
	// The tocFitOnPage function executes whenever the window is
	// resized and determines which sections of the table of 
	// contents the user wants to display based on their input, 
	// and also alters the size of the table of contents such
	// that it can fit on the page without scrolling.
	//-----------------------------------------------------------
	var fitOnPage = function(){
	
	    var fit = true;
	    var headerContents = [$("table" + parentId + " li.toclevel-1"),
	                          $("table" + parentId + " li.toclevel-2"),
	                          $("table" + parentId + " li.toclevel-3")];
	    var headerOptions = 
	        [[options.showH1Sections, options.H1Dynamic],
	         [options.showH2Sections, options.H2Dynamic],
	         [options.showH3Sections, options.H3Dynamic]];
	    var sectNum = 0;
	    var elementArray = [];
	    var currentHSection = 0;
	    var count = 0, count2 = 0, index = 0;
	    
	    number = 0;
	
	    sections = [$("table" + parentId + " li.toclevel-1"),
	                $("table" + parentId + " li.toclevel-2"),
	                $("table" + parentId + " li.toclevel-3")];
	
	    if ($("table" + parentId).css("display") != "none"){
	
	       if ($("table" + parentId + " *").is(".presentdots")){
	           $(".presentdots").remove();
	       }
	       
	       $("table" + parentId + " ol li ol").show();
	       $("table" + parentId + " li.toclevel-1, " +
	         "table" + parentId + " li.toclevel-2, " +
	         "table" + parentId + " li.toclevel-3").hide();
	       
	       elementS = $();
	       
	       count = 0;
	       count2 = 0;
	       index = 0;
	
	       while (count < headerContents.length){
	          if (headerOptions[count][1] && headerOptions[count][0]){
	             elementS.add(headerContents[count]);
	             while (count2 < headerContents[count].length){
	                elementArray[index] = headerContents[count].get(count2);
	                index += 1;
	                count2 += 1;
	             }
	          }
	          //HSections[count] = index;
	          HSections[count] = headerContents[count].length;
	          //alert(HSections[count]);
	          count += 1;
	          count2 = 0;
	       }
	       
	       sectNum = 0;
	       fit = true;
	       number = 0;
	       iteration = 0;
	
	       while ((fit && sectNum < headerContents.length)){
	          //if (headerOptions[sectNum][0] && headerOptions[sectNum][1]){
	          if (headerOptions[sectNum][1]){
	              fit = displayUntilOverflow(headerContents[sectNum],
	                                         $("#column-one"));
	          }
	          else if (headerOptions[sectNum][0] && (!headerOptions[sectNum][1])){
	              headerContents[sectNum].show();
	          }
	          else{
	              fit = false;
	          }
	          sectNum += 1;
	       }
	    }
	    else{
	       $("table" + parentId + " ol li ol").show();
	    }
	};
	//-----------------------------------------------------------
	// This function is used by the tocFitOnPage function to 
	// perform the operations on each part of the TOC necessary
	// to fit it to the page.  For arguments, it accepts a 
	// jQuery object containing the sections to show, and
	// the parent object whose size will change as the sections
	// are displayed.
	//-----------------------------------------------------------
	var displayUntilOverflow = function(set, parent){
	
	   var SectionFits = false,
	       parentHeight = 0,
	       windowHeightValue = 0,
	       currentSectionNum = 0,
	       leeway = 3;
	   
	   currentSectionNum = 0;
	   iteration += 1;
	
	   answer = "li.toclevel-" + iteration;
	
	   set.each(function(x){
	
		  var height1 = parent.get(0).clientHeight,
		      height2 = parent.get(0).scrollHeight,
		      windowHeightCurrent;
		  
		  windowHeightCurrent = getDimensions("height");
		  
	      $(this).show();  // Displays the current entry in the table of contents
	
	      number += 1;
	      currentSectionNum += 1;
	      
	      
	      //alert(wind  + " " + parseInt(parseInt($("#toc").get(0).clientHeight)));
	      // If the parent element becomes too large to fit on the page, the
	      // current entry in that element is hidden, an element containing the
	      // text "..." is added in its place to indicate that there are
	      // some hidden sub-elements in that section, and then this 
	      // is bound to a function that shows the entire section of 
	      // sub-elements if the user clicks on the "..." element.
	      if (windowHeightCurrent < parseInt($(parentId).get(0).clientHeight) + sensitivity){
	
	            $(this).hide();  // Hides last element shown
	            elementS.slice(number-leeway, number).hide();
	
	            if (currentSectionNum > leeway) {
	               $(this).after(placeholder);  // Inserts the ... item in last place
	            }
	            else{
	               elementS.slice(number-leeway, number-(leeway - 1)).after(placeholder);
	            }
	
	            if ((currentSectionNum - leeway <= 0) && (iteration - 1 >= 1)){
	               answer = "li.toclevel-" + (iteration - 1);
	            }
	            
	            var firstChild, ghs;
	            
	            $("li.toclevel-1").each(function(y){
	               firstChild = $(this).find("li.toclevel-2").get(0);
	               ghs = $(this).find(".presentdots");
	               if (firstChild && ghs.length == 0){
	                  if (firstChild.style.display == "none"){
	                     $(firstChild).before(placeholder);
	                  }
	               };
	            });
	            
	            $(".presentdots").bind("click", function(e){
	                $(".presentdots").remove();
	                $(answer).show();
	                shortenText();
	            });
	            
	            SectionFits = false;
	            return false;  // break out of the jQuery each loop
	      }
	      SectionFits = true;
	   });
	   return SectionFits; 
	};
	
	//-----------------------------------------------------------
	// The updateOptions function updates the values of the 
	// variables for the options to either true or false
	// depending on whether the corresponding checkbox in the 
	// menu is checked or unchecked.  It then updates the
	// table of contents to reflect the changes.
	//-----------------------------------------------------------
	this.updateOptions = function(){
		
		// Displays new version of table of contents
	    update();
	    
	    // Updates binding of shortened text lines
	    if (options.limitTitleLength){
	       elements.bind("click", restoreText);
	    }
	    else{
	       elements.unbind("click", restoreText);
	    }
	    
	    // Must wait a small amount before cutting line length to avoid errors
	    setTimeout(shortenText, 100);
	};
	
	//var menu = new OptionsMenu(this, options, optionNames, menuParentId);
	
	this.options = options;
	this.optionNames = optionNames;
	
	//Sets up the bindings for the window and document so that
	//F10 brings up the menu, and the table of contents is resized
	//upon page resize.
	$(window).bind("resize", update);
	setupLink();
	
	var initializeFunction = function(){
		
	   running = true;
	   getText();
	   //getXML();
	
	   // Update the table of contents html for the first time upon page load
	   // using the values collected from the XML, or the coded defaults if
	   // no settings XML could be found.
	   update();
	
	   elements.bind("click", restoreText);
	   shortenText();
	};
	
	this.setParentId = function(pId){
		if (!/[\.#]+/.test(pId)){
		    pId = "#" + pId;
		}
	    parentId = pId;
	    //elements.unbind("click", restoreText);
	    getText();
	    initializeFunction();
	};
	this.getParentId = function(){
	    return parentId;
	};
	//this.setOptionsMenu();
	
	// Constructor operation
	this.setParentId(pId);
	running = false;
	
	//if (pId && parentId) initializeFunction();
	//this.setParentId(pId || "toc");
}

//-----------------------------------------------------------
// The jQuery function which will execute when the page is 
// loaded. This sets up program by creating an instance
// of the smartToc object and binding it to the page.
//-----------------------------------------------------------
$(function() {
    var smart = new smartToc("toc", "content", "#p-tb ul");
    
    var tagOptions = [{text: "Show TOC", xmlTag: "ShowTOC", type: "checkbox"},
                      {text: "Limit titles to one line", xmlTag: "SnipLongTitles", type: "checkbox"},
                      {text: "Show H1 Sections", xmlTag: "ShowH1s", type: "checkbox"},
                      {text: "Dynamically Expand H1 Sections", xmlTag: "SmartH1Reveal", type: "checkbox"},
                      {text: "Show H2 Sections", xmlTag: "ShowH2s", type: "checkbox"},
                      {text: "Dynamically Expand H2 Sections", xmlTag: "SmartH2Reveal", type: "checkbox"},
                      {text: "Show H3 Sections", xmlTag: "ShowH3s", type: "checkbox"},
                      {text: "Dynamically Expand H3 Sections", xmlTag: "SmartH3Reveal", type: "checkbox"}];

    var clientDesc = "This MediaWiki installation has a Smart TOC installed. ";
    
    var menuObject = new OptionsMenu(smart.updateOptions,   // Callback function called when option changes
    		                         1,                     // Style in which to add the menu items
    		                         smart.options,         // Pointer to client data to be updated in menu
    		                         smart.optionNames,     // Ordered names for the client data properties
    		                         "content",             // id of menu parent
    		                         "Smart TOC",           // Name of client program/class
    		                         clientDesc,            // Description of client program
    		                         tagOptions,            // Options to be displayed in menu
    		                         121);                  // Key that toggles menu (if undefined no binding occurs)

    menuObject.initialize();
    menuObject.getXML();      // Retrieves default settings if available
    smart.updateOptions();    // Updates SmartTOC with loaded XML values
    
    $("#smartTocLink").bind("click", function(event){
        menuObject.displayMenu();
    });
});
