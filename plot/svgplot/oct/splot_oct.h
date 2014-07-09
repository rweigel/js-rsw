typedef struct {
  Type = "root";
  Id = "Figure1";	
  Visible = 1;     // Same meaning as SVG attribute
  Color[0] = 0;    // RGB 0-255
  Color[1] = 255;
  Color[2] = 0;
  Opacity = 0.5; // Same meaning as SVG opacity
  Box[0] = 0;    // upper left x 
  Box[1] = 0;    // upper left y 
  Box[2] = 100;  // lower right x
  Box[3] = 100;  // lower right y
  CurrentPoint[0] = 0; // Cursor position
  CurrentPoint[1] = 0; // Cursor position
} FigureStruct;

typedef struct {
  Type = "data";
  Id = "Data1";	
  Symbol = "circle";	
  Visible = 1;     // Same meaning as SVG attribute
  Color[0] = 0;    // RGB 0-255
  Color[1] = 255;
  Color[2] = 0;
  Opacity = 0.5; // Same meaning as SVG opacity
  *x;
  *y;
} DataStruct;

typedef struct {
  Type = "zoom";
  Id = "Zoom1";	
  Color[0] = 127;
  Color[1] = 127;
  Color[2] = 127;
  Box[0] = 0; // MouseDown x
  Box[1] = 0; // MouseDown y
  Box[2] = 0; // MouseUp x
  Box[3] = 0; // MouseUp y
  Opacity = 0.1; 
} ZoomStruct;
