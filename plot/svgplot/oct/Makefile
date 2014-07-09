all: *.oct

splot_oct.oct: *.cc *.h
        mkoctfile -v splot_oct.cc $(SVGTERM)

sget_oct.oct: sget_oct.cc *.h
        mkoctfile -v sget_oct.cc $(SVGTERM)

set_oct.oct: set_oct.cc *.h
        mkoctfile -v sset_oct.cc $(SVGTERM)

clean:
        - rm *.o

distclean: clean
        - rm *.oct
