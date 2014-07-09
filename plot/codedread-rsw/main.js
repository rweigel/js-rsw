function init() 
{

  var lh;


  figure();
  axes();

  if (1) {
  legend();
      
  lh = get("legend");
  set(lh,"Position","40,40");
  set(lh,"Interactive","off");
  set(lh,"Interactive","on");
  set(lh,"Visible","on");
  set(lh,"Title","Legend Title");
  set(lh,"Visible","off");	
  set(lh,"Visible","on");	
  }

} // init()

function axes()
{

  var handle = get("figure");
  handle.appendChild( make( 'g', { "id":"axes" } ) );

  handle = get("axes");
  handle.appendChild( make( 'rect', { "id":"axesrect", "x":PLOT_ULx, "y":PLOT_ULy, "width":PLOT_WIDTH, "height":PLOT_HEIGHT, "fill":"blue", "stroke":"black", "stroke-width":"5px", "fill-opacity":0.2, "rx":0, "ry":0 } ) );


}

function legend()
{

  var handle = get("figure");
  handle.appendChild( make( 'g', { "id":"legend" } ) );

  var x = 10, y = 20, h = 11, w = 30, dy = 0, c;
  handle = get("legend");      

  set(handle,"Color","white");
  set(handle,"Position","20,20");

  for (var browser in BrowserData)
    {
      c = cssname( browser );
      browser = browser.replace( '/', ' ' );
      handle.appendChild( make( 'rect', { "x":x, "y":y, "width":w, "height":h, "class":c } ) );
      handle.appendChild( make( 'text', { "x":x+w+x, "y":y+8, "font-size":'10', "fill":'black' }, browser ) );
      y += h + dy;
    }

}

function figure()
{

  var svgnode = $("svgsvg");
  svgnode.appendChild( make( 'g', { "id":"figure" } ) );
  
  if (svgnode)
    {
      set(gcf(), "Color", "blue");
      return 1;
    }
  else
    {
      return 0;
    }

}

function gcf()
{
  return get("figure");
}

function get( id )
{
  return document.getElementById( id );
}

function set( handle , parameter, value)
{

  if (handle == get("legend")) 
    {

      if (parameter == "Position") 
	{
	  handle.setAttribute("transform","translate("+value+")");
	}

      if (parameter == "Interactive") 
	{
	  if (value == "on")
	    enableDrag(handle);
	  if (value == "off")
	    disableDrag(handle);
	}

      // Need to use insertBefore or equivalent here to put background as first child of legend
      // This does not work: handle.parentNode.insertBefore(handle,handle.parentNode.firstChild);
      if (parameter == "Color") {
	handle.appendChild( make( 'rect', { "rx":"10", "ry":"10", "x":0, "y":0, "width":118, "height":235, "fill":value, "fill-opacity":"0.80" } ) );
      }

      if (parameter == "Title") 
	{
	handle.appendChild( make( 'text', { "x":59, "y":15, "stroke":"none", "fill":'black', "font-size":12, "text-anchor":"middle" }, value ) );
	}

      if (parameter == "Visible") 
	{
	  if (value == "on")     
	    if (handle) {
	      handle.setAttributeNS(null, "display", "inline");
	    }
	  if (value == "off")     
	    if (handle) {
	      handle.setAttributeNS(null, "display", "none");
	    }
	}
    }
  

  if (handle == get("figure")) 
    {

      if (parameter == "Color") 
	{
	handle.appendChild( make( 'rect', { "x":WINDOW_ULx, "y":WINDOW_ULy, "width":WINDOW_WIDTH, "height":WINDOW_HEIGHT, "fill":value } ) );
	}
    }

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

function cssname( name )
{
  //return name.replace( /[. /]/g, '' );
}

