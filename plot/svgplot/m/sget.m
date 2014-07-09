function Properties = sget(what)
%SGET Get properties of element in SVG document  
%
%   sget("Figure"), sget("Data"), sget("Zoom")
%
%
%   See also SPLOT.

if ( strmatch(what,"Figure","exact") ) | 
   ( strmatch(what,"Data","exact") )   |
   ( strmatch(what,"Zoom","exact") )

   Properties = sget_oct(what);  
   
end
  