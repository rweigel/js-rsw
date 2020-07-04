// wget http://autoplot.org/jnlp/latest/autoplot.jar
// npm install java
// (On OS-X, there are additional steps here)
// node javatest.js

var java = require("java");
// Works
java.newInstance("java.util.ArrayList", function(err, list2) {
  	list2.addSync("item1");
  	list2.addSync("item2");
  	console.log(list2.getSync(1)); // item1
});

var java = require("java");

java.classpath.push('autoplot.jar');

java.options.push('-Djava.awt.headless=true');
java.options.push('-Xmx1024m');

// An attempt to do the equivalent of
//java -Djava.awt.headless=true -jar autoplot.jar org.virbo.autoplot.AutoplotUI --script dumpMetadata.jyds	
// in node.js:
var strArray = java.newArray('java.lang.String',['--script','dumpMetadata.jyds']);
var result = java.callStaticMethodSync("org.autoplot.AutoplotUI", "main", strArray);
// Error: Could not create class org.virbo.autoplot.AutoplotUI
