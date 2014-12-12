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
// Sets up the options menu html structure and displays the
// menu so that the script can receive input from the user.
// If this function is called when the menu already exists,
// it removes the menu from the page.
//-----------------------------------------------------------
function OptionsMenu(ref, options, optionNames, menuParentId, tag){

	var ready = function(){
	    return targetRef && options && optionNames && pID && tags && XMLTagList;
	};

	var formId = "smartTocOptionsMenu";
	var active = false;
	var XMLTagList = undefined;
	var closeButtonId = "closeSmartMenu";
	var createXMLButtonId = "createSmartXML";
	var visible = false;
	var checkBoxElements = {};
	var checkboxIds = "";
	var pID = menuParentId;
	var targetRef = ref;
	var thisref = this;
	var formHtml = "";
	var tags = tag;
	var settings = options;

	var createCheckboxes = function(){
		var str = "";
	    for (var i = 0; i < tags.length; i++){
	    	checkboxIds += "input#smart" + (i + 1).toString();
	    	checkboxIds += (i + 1 < tags.length) ? ", " : "";
	    	str += ((i % 2) == 0) ? "<tr>" : "";
	    	str += '<td><input type = "checkbox" id = "' +
	    	       "smart" + (i + 1).toString() + '" /> ' + 
	    	       tags[i] + '</td>';
	    	str += ((i % 2) == 1) ? '</tr>' : "";
	    }
	    str += ((tags.length % 2) == 1) ? "</tr>" : "";
	    return str;
	};
	
	this.setXMLTagList = function(list){
	    XMLTagList = list;
	};
	
	var createMenuHTML = function(){
    formHtml =
        '<form id  = "' + formId + '"> '+
        '<table align = "center"><tr><td><p style = "text-align: left;">This MediaWiki installation has a Smart Toc installed. ' +
        '</p></td></tr></table>' +
           '<table align = "center" style = "background-color: #C8C8C8; border-style: solid; border-width: 0.5em; border-color: #727272;">' +
              '<th style = "text-align: center; background-color: #A8A8A8;">Smart TOC Options</th>' + 
              '<tr><td style = "background-color: #E8E8E8;">' +
              '<table cellpadding = "2" id = "smartOptionsTableArea" align = "center" style = "background-color: #E8E8E8;">';
                 formHtml += createCheckboxes();
              formHtml +=
              '</table>' +
              '</tr>' +
              '<tr><td></td></tr>' +
              '<tr><td colspan = "3" style = "background-color: #A8A8A8;">' +
              '<table align = "center" style = "background-color: #A8A8A8;">' +
                 '<tr><td><input type = "button" id = "createSmartXML" value = "Save Settings" /></td>' +
                 '<td><input type = "button" id = "closeSmartMenu" value = "Close [F10]" /></td></tr>' +
              '</table>' +
              '</td></tr>' +
              '<tr align = "center"><td colspan = "3" style = "text-align: center;">' +
              '<table align = "center" style = "width: 100%; background-color: #C8C8C8; text-align: left;">' +
                 '<tr><td id = "smartTocExplanation"></td></tr>' +
                 '<tr><td id = "smartTocTextArea"></td></tr>' +
              '</table>' +
              '</tr>' +
              '</td></tr></table>' +
        '</form>';
	};
	
	var createTextArea = function(smartXML){
	    var smartTextField = '<textArea id = "smartTextArea" cols = "65" rows = "12"></textArea>';
	    
	    if (!($("#smartTocTextArea *").is("#smartTextArea"))){
	        $("#smartTocTextArea").prepend(smartTextField);
	    }
	     
	    $("#smartTextArea").attr("value", smartXML);
	};
    
    //-----------------------------------------------------------
	// The createXML function is used to generate the XML
	// settings structure that is sent to the textArea in the
	// options menu.  
	//-----------------------------------------------------------
	var createXML = function(){
	    var smartXML = '<span class = "smartTOCSettings" style = "display: none;">\n' +
	                   '<SmartTOCOptions> \n';
	    var xmlTagList = XMLTagList;
	    for (var i = 0; i < xmlTagList.length; i++){
	        smartXML += "<" + xmlTagList[i] + ">" + 
	        options[optionNames[i]] + "</" +
	        xmlTagList[i] + ">\n";
	    }
	    smartXML += "</SmartTOCOptions>\n</span>";
	    
	    return smartXML;
	};
    
    //-----------------------------------------------------------
	// The setCheckboxes function loops through the checkboxes
	// used for input in the options menu and sets them to
	// either checked or unchecked based on the current
	// value of each option.
	//-----------------------------------------------------------
	var setCheckboxes = function(options, optionNames){
	    var listOptions = $("#smartOptionsTableArea input");
	    listOptions.each(function(x){
	        this.checked = options[optionNames[x]];
	    });
	};
    
	/*
	this.displayPMenu = function(){
	    var formHtml;

	    if ($("div#content *").is("#presentModeOptionsMenu") === false){
	       formHtml =
	       '<form id  = "presentModeOptionsMenu"> '+
	       '<table align = "center"><tr><td><p style = "text-align: left;">This MediaWiki installation has a presentation mode that simulates a ' +
	       'PowerPoint-style presentation.<br>  In presentation mode, only one section ' +
	       'is shown at a time and sections are changed using the arrow keys.</p></td></tr></table>' +
	          '<table align = "center" style = "background-color: #C8C8C8; border-style: solid; border-width: 0.5em; border-color: #727272;">' +
	             '<th style = "text-align: center; background-color: #A8A8A8;">Presentation Mode Options</th>' + 
	             '<th />' +
	             '<th style = "background-color: #A8A8A8; text-align: center;">Key Bindings</th>' +
	             '<tr><td style = "background-color: #E8E8E8;">' +
	             '<table align = "center" style = "background-color: #E8E8E8;">' +
	                '<tr><td><input type = "checkbox" id = "op2" value = "1" /> Reveal list items incrementally</td></tr>' +
	                '<tr><td><input type = "checkbox" id = "op3" /> When going back a slide, show all list items</td></tr>' +
	                '<tr><td><input type = "checkbox" id = "op6" /> Show table of contents by default</td></tr>' +
	                '<tr><td><input type = "checkbox" id = "op5" /> Show h1 Sections in Presentation Mode</td></tr>' +
	                '<tr><td><input type = "checkbox" id = "op4" /> Show h3 Sections in Presentation Mode</td></tr>' +
	                '<tr><td><input type = "checkbox" id = "op9" /> Show Presentation Controls (Buttons)</td></tr>' +
	                '<tr><td><input type = "checkbox" id = "op7" /> Start presentation on page load</td></tr>' +
	                '<tr align = "center"><td><input type = "text" id = "op1" /> Text Size (% of normal)</td></tr>' +
	             '</table>' +
	       
	             '<td style = "width: 0.2em;" />' +
	             '<td style = "background-color: #E8E8E8;">' +
	             '<table align = "center" style= "background-color: #E8E8E8;">' +
	                '<th style = "background-color: #D8D8D8; text-align: center;">Key</th>' +
	                '<th style = "background-color: #D8D8D8; text-align: center;">Function</th>' +
	                '<tr><td style = "text-align: center;">F4</td><td>Display/Hide table of contents</td></tr>' +
	                '<tr><td style = "text-align: center;">F5</td><td>Enter/Exit Presentation</td></tr>' +
	                '<tr><td style = "text-align: center;">F6</td><td>Resize browser window to ' +
	                   '<select id = "presentF6Binding" title = "Not supported by all browsers">' +
	                      '<option id = "present800x600" value = "800x600">800x600</option>' +
	                      '<option id = "present1024x768" value = "1024x768">1024x768</option>' +
	                      '<option id = "present1280x1024" value = "1280x1024">1280x1024</option>' +
	                      '<option id = "present1920x1080" value = "1920x1080">1920x1080</option>' +
	                   '</select></td></tr>' +
	                '<tr><td style = "text-align: center;">F10</td><td>Show/Hide Presentation Mode Options</td></tr>' +
	                '<tr><td style = "text-align: center;">F11</td><td>Full Screen Mode</td></tr>' +
	                '<tr><td style = "text-align: center;">F12</td><td>Show [present] links</td></tr>' +
	                '<tr><td style = "text-align: center;">Right/Down</td><td>Next Section/Show next list item</td></tr>' +
	                '<tr><td style = "text-align: center;">Left/Up</td><td>Previous Section/Hide current list item</td></tr>' +
	                '<tr><td style = "text-align: center;">Esc</td><td>Exit Presentation</td></tr>' +
	             '</table>' +
	             '</td></tr>' +

	             '<tr><td></td></tr>' +
	             '<tr><td colspan = "3" style = "background-color: #A8A8A8;">' +
	             '<table align = "center" style = "background-color: #A8A8A8;">' +
	                '<tr><td><input type = "button" id = "createStateObject" value = "Save Settings" /></td>' +
	                '<td><input type = "button" id = "closeMenu" value = "Close [F10]" /></td></tr>' +
	             '</table>' +
	             '</td></tr>' +
	             '<tr align = "center"><td colspan = "3" style = "text-align: center;">' +
	             '<table align = "center" style = "width: 100%; background-color: #C8C8C8; text-align: center;">' +
	                '<tr><td id = "presentSettingsTDtag"></td></tr>' +
	                '<tr><td id = "presentationStateAreaTDTAG"></td></tr>' +
	             '</table>' +
	             '</tr>' +
	             '</td></tr></table>' +
	       '</form>';
	       
	       $("div#content").prepend(formHtml);
	       
	       window.scrollTo(0, 0);
	       
	       $("input#op2, input#op3, input#op6, input#op5, input#op4, input#op9, input#op7, input#op11").bind("click", function(event){
	           //updateOptions();
	           targetRef(options);
	       });
	       
	       //$("input#op1").bind("change", function(event){
	       //    updateOptions();
	       //});
	       
	       $("input#op1").bind("keyup", function(event){
	           //updateOptions();
	    	   targetRef(options);
	       });
	       $("#presentF6Binding").bind("change", function(event){
	           //updateOptions();
	    	   targetRef(options);
	       });
	       
	       $("input#closeMenu").bind("click", function(event){
	           this.displayPMenu();
	       });
	       $("input#createStateObject").bind("click", function(event){
	           //generateStateHtml(event);
	       });
	       
	       // Determines which tags can be displayed in presentation mode
	       //presentationCapability();
	       
	       $("input#op1").attr("value", settings.textSizeIncrease);
	       if (settings.incrementalListItemReveal){
	          $("input#op2").attr("defaultChecked", true);
	       }
	       if (settings.showListItemsBackwards){
	          $("input#op3").attr("defaultChecked", true);
	       }
	       if (settings.h3TagSlides){
	           $("input#op4").attr("defaultChecked", true);
	       }
	       if (presentation.toc.display.presentmode){
	    	   $("input#op6").attr("defaultChecked", true);
	       }
	       if (autoStartPresentation){
	          $("input#op7").attr("defaultChecked", true);
	       }
	       if (!presentation.state.h3SlidesPossible){
	           $("input#op4").attr("disabled", true);
	       }
	       if (settings.h1TagSlides){
	           $("input#op5").attr("defaultChecked", true);
	       }
	       if (settings.showControls){
	           $("input#op9").attr("defaultChecked", true);
	       }
	       if (settings.F6Resize === "800x600"){
	           $("#present800x600").attr("selected", true);
	       }
	       else if (settings.F6Resize === "1024x768"){
	           $("#present1024x768").attr("selected", true);
	       }
	       else if (settings.F6Resize === "1280x1024"){
	           $("#present1280x1024").attr("selected", true);
	       }
	       else if (settings.F6Resize === "1920x1080"){
	           $("#present1920x1080").attr("selected", true);
	       }
	    }
	    else{
	        $("#presentModeOptionsMenu").remove();
	    }
	};*/
	
    this.displayMenu = function(){
	    if (ready() && $(pID + " *").is("#" + formId) === false){
	       
	       $(pID).prepend(formHtml);
	       visible = true;
	       
	       window.scrollTo(0, 0);
	       
	       setCheckboxes(options, optionNames);
	       
	       checkBoxElements = $(checkboxIds);
	       
	       $(checkboxIds).bind("click", function(event){
	     	    checkBoxElements.each(function(x){
	     	        options[optionNames[x]] = (this.checked) ? true : false;
	     	    });
	          targetRef(options);
	       });
	       
	       $("#" + closeButtonId).bind("click", function(event){
	           thisref.displayMenu();
	       });
	       $("#" + createXMLButtonId).bind("click", function(event){
	           createTextArea(createXML);
	       });
	    }
	    else{
	        $("#" + formId).remove();
	        delete checkBoxElements;
	        visible = false;
	    }
    };
    var documentBindingTest = function(e){
		if (e.which === 121){
	        thisref.displayMenu();
	        return false;
	    }
	};
    this.start = function(){
        if (ready() && !active){
            active = true;
            createMenuHTML();
            $(document).bind("keydown", documentBindingTest);
        }
    };
    this.setCheckboxTags = function(t){
        tags = t;
        if (ready()){
           start();
        }
    };
    this.setTargetObject = function(r){
        targetRef = r;
    };
    this.setMenuId = function(id){
        if (visible){
           document.getElementById(formId).id = id;
        }
        formId = id;
        createMenuHTML();
    };
    this.getMenuId = function(){
        return formId;
    };
    this.setParentElement = function(p){
        pID = p;
        if (!/[\.#]+/.test(pID)){
    	    pID = "#" + pID;
    	}
        if (active && visible){
            thisref.displayMenu();
            thisref.displayMenu();
        }
    };
	
	if (!/[\.#]+/.test(pID)){
	    pID = "#" + pID;
	}
	if (ready()){
		   start();
	}
};

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
	this.updateOptions = function(ops){
		options = ops;
	    
	    update();
	    //alert(options.limitTitleLength);
	    if (options.limitTitleLength){
	       elements.bind("click", smartToc.restoreText);
	    }
	    else{
	       elements.unbind("click", smartToc.restoreText);
	    }
	    
	    setTimeout(shortenText, 100);
	};
	
	//-----------------------------------------------------------
	// The getXML function first checks for the existence of
	// an XML structure containing the settings for the
	// smartTOC script, and then attempts to match the valid
	// names for the settings tags with the tags found in the
	// structure.  If it finds a match, it can successfully
	// update the settings information in the smartToc object.
	//-----------------------------------------------------------
	var getXML = function(){
	
	    var xmlObject = $(".smartTOCSettings"),
	        xmlProperties = $(".smartTOCSettings *");
	    
	    if (xmlObject.length > 0){
	       
	       // If MediaWiki escapes the "<" and ">" characters and 
	       // the tags in the XML structure cannot be found, 
	       // the contents of the structure are obtained as a string
	       // through the jQuery text() function.  This restores the 
	       // escaped tags to their original states, and produces the
	       // valid XML code in string representation.  This valid
	       // code is then inserted into the XML parent tag, after
	       // which it will be possible for the code to be read.
	       if (!($(".smartTOCSettings *").is("SmartTOCOptions"))){
	           xmlObject.html(xmlObject.text());
	       }
	       
	       // Loops through every combination of valid XML tags and the
	       // actual XML tags found in the settings structure and updates
	       // the settings variables if it can find their matches in the XML.  
	       for (var i = 0; i < optionNames.length; i++){
	          for (var y = 0; y < xmlProperties.length; y++){
	             if (xmlProperties.get(y).nodeName.toUpperCase() == xmlTagList[i].toUpperCase()){
	                if (xmlProperties.get(y).textContent){
	                options[optionNames[i]] = 
	                (xmlProperties.get(y).textContent.toLowerCase() == "true") ? true : false;
	                }
	             }
	          }
	       }
	    }
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
	   getXML();
	
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
	
	this.setParentId(pId);
	running = false;
	
	if (pId && parentId) initializeFunction();
	//this.setParentId(pId || "toc");
}

//-----------------------------------------------------------
//The jQuery function which will execute when the page is 
//loaded. This sets up program by binding the fitting
//function (tocFitOnPage) to the window and calling that
//function for the first time upon page load.
//-----------------------------------------------------------
$(function() {
    var smart = new smartToc("toc", "content", "#p-tb ul");
    var tags = ["Show TOC",
	            "Limit titles to one line",
	            "Show H1 Sections",
	            "Dynamically Expand H1 Sections",
	            "Show H2 Sections",
	            "Dynamically Expand H2 Sections",
	            "Show H3 Sections",
	            "Dynamically Expand H3 Sections"];
    var xmlTagList = ["ShowTOC", "SnipLongTitles",
                      "ShowH1s", "SmartH1Reveal",
                      "ShowH2s", "SmartH2Reveal",
                      "ShowH3s", "SmartH3Reveal"];
    
    var menuObject = new OptionsMenu(smart.updateOptions, smart.options, smart.optionNames, "content", null);
    menuObject.setCheckboxTags(tags);
    menuObject.setXMLTagList(xmlTagList);
    menuObject.start();
    
    $("#smartTocLink").bind("click", function(event){
        menuObject.displayMenu();
    });
    menuObject.setMenuId("menuis");
    //menuObject.setParentElement("content");
    //document.onclick = function(e) { menuObject.setParentElement("content"); };
/*
    var next = document.getElementById("toc").cloneNode(true);
	next.id = "toc1";
	document.getElementById("toc").parentNode.appendChild(next);
	next.setAttribute("style", "position: absolute;");
    */
    //smartObjectInstance.setParentId("toc1");
});
