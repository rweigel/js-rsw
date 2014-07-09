SVGTERM=$(PWD)/SVGTerminal-0.2/svgterm-server.o

svgterm-server: 
	cd SVGTerminal ; make

splot: svgterm-server
	cd oct ; make "SVGTERM=$SVGTERM"

clean:
        - rm *.o

distclean: clean
        - rm *.oct
