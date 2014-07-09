#include <octave/oct.h>
#include <lo-mappers.h>
#include <splot_oct.h>

DEFUN_DLD (splot_oct, args, ,"SPLOT_OCT Called by SPLOT. \
Do not call directly.")
{

  octave_value_list retval;

  static FigureStruct sFigure;
  static ZoomStruct sZoom;
  static DataStruct sData;

  Matrix x(args(0).matrix_value());
  Matrix y(args(1).matrix_value());
  int mrows_x = x.rows();
  int mrows_y = y.rows();

  for (j = 0; j < mrows_x; j++) {
    sData.x[j] = x(i);
    sData.y[j] = y(i);
  }
  
  if (SVGStatus) {
    SVGset(&sFigure); // Draw background box
    SVGset(&sData);   // Draw data
  }
  
} 
 
