#include <octave/oct.h>
#include <lo-mappers.h>
#include <splot_oct.h>

DEFUN_DLD (sget_oct, args, ,"SGET_OCT Called by SGET. \
Do not call directly.")
{

  octave_value_list retval;
  
  char what = args(0).char_value();
  
  if (SVGStatus) {

    if (what == "Figure") {
      SVGget(&sFigure); 
      retval = sFigure
      return retval;
    }
    if (what == "Data") {
      SVGget(&sData);   
      retval = sData
      return retval;
    }
    if (what == "Zoom") {
      SVGget(&sZoom);   
      retval = sZoom;
      return retval;      
    }

  }
  
} 
 
