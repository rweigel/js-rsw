var swlstudents = 
					[
      						{"name":"Steve Brown","link":"brown.onair.cc"},
    						{"name":"Xin Cheng","link":"cheng.onair.cc"},
    						{"name":"Georgios Cintzoglou","link":"cintzoglou"},
    						{"name":"Brian Curtis","link":"curtis.onair.cc"},
    						{"name":"Patrick Dandenalult","link":"dandenault.onair.cc"},
    						{"name":"Phil Hess","link":"hess.onair.cc"},
    						{"name":"Shea Hess Webber","link":"hesswebber.onair.cc"},
    						{"name":"Andrew Kercher","link":"kercher.onair.cc"},
    						{"name":"Prabal Saxena","link":"saxena.onair.cc"},
    						{"name":"Victoir Veibell","link":"veibell.onair.cc"},
    						{"name":"Paul Whitehouse","link":"whitehouse.onair.cc"}
    					]
var current = 
	[
		{"name":"Victoir Veibell","link":"veibell.onair.cc"},
		{"name":"Andrew Kercher","link":"kercher.onair.cc"},
	 	{"name":"Brian Curtis","link":"curtis.onair.cc"},
	 	{"name":"Karl Battams","link":"battams.onair.cc"},
	 	{"name":"James McCracken","link":"mccracken.onair.cc"}
	]

dietercurrent = 
	[
		{"name":"Steve Brown","link":"brown.onair.cc"},	 
	 ]
	 
jiecurrent = 
	[
		{"name":"Phil Hess","link":"hess.onair.cc"},
		{"name":"Paul Whitehouse","link":"whitehouse.onair.cc"},
		{"name":"Xin Cheng","link":"cheng.onair.cc"},
		{"name":"Georgios Cintzoglou","link":"cintzoglou"},	 
	 ]
	
var former = 
	[
		{"name":"Rachel Nep","link":""},
		{"name":"William Rowland","link":"http://www.ngdc.noaa.gov/stp/contacts.html"},
	 	{"name":"Randy Bell","link":"http://www.ctbto.org/the-organization/the-provisional-technical-secretariat-pts/organizational-structure-of-the-pts/curriculum-vitaew-randy-bellinternational-data-centre/"}
	]

var swlfac = 
	[
		{"name":"Erdal Yigit","link":"yigit.onair.cc"},
	    {"name":"Jie Zhang","link":"zhang.onair.cc","children":[{"name":"Current MS and PhD Students","children":jiecurrent}]},
		{"name":"Dieter Bilitza","link":"bilitza.onair.cc","children":[{"name":"Current MS and PhD Students","children":dietercurrent}]},
		{"name":"Art Poland","link":"poland.onair.cc"},
		{"name":"Bob Meier","link":"meier.onair.cc"},
		{"name":"John Shebalin","link":"shebalin.onair.cc"},
		{"name":"Phil Richards","link":"richards.onair.cc"},
		{"name":"John Mariska","link":"mariska.onair.cc"},
	]
	
var json = {

		"name": "Bob Weigel","link":"http://weigel.onair.cc",
		 "children": [{"name":"Former MS and PhD Students","children":former},
		              {"name":"Current MS and PhD Students","children":current},
		              {"name":"Space Weather Lab (Director)","link":"http://spaceweather.gmu.edu/","children":
		            	  	[{"name":"Faculty","link":"http://www.spaceweather.gmu.edu/category/lab-faculty/faculty-directory/","children":swlfac},
		   				   {"name":"Students","link":"http://www.spaceweather.gmu.edu/category/students/student-directory/","children":swlstudents}
		   			   ]},
		   				{"name":"SPACS (Faculty Member)","link":"http://spacs.gmu.edu/","children":[{"name":"Ernest Baretto","link":"http://spacs.gmu.edu/profile/ernest-barreto/"},{"name":"Peter Becker","link":"http://spacs.gmu.edu/profile/peter-a-becker/"}]}
		   			   ]
		              
}
