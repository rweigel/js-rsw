var java = require("java");

java.classpath.push('autoplot.jar');

java.options.push('-Djava.awt.headless=true');
java.options.push('-Xmx1024m');

var strArray = java.newArray('java.lang.String',['-u','vap+jyds:https://raw.githubusercontent.com/autoplot/jyds/master/sscweb.jyds?timerange=2008-001','--format','dat']);
var result = java.callStaticMethodSync("org.virbo.autoplot.AutoplotDataServer", "main", strArray);
console.log(result)

var result = java.callStaticMethodSync("org.virbo.autoplot.AutoplotDataServer", "main", strArray);
console.log(result)

//doService( String timeRange, String suri, String step, boolean stream, String format, final PrintStream out, boolean ascii, Set outEmpty, ProgressMonitor mon ) throws Exception {
        