import java.applet.*;
import java.awt.*;
import java.awt.event.*;

public class TestApplet0 extends Applet {

    public void init() {
	//resize(150,25);
    }
    public void paint(Graphics g) {
	g.drawString("Hello world!", 0, 0);
	setBackground(Color.blue);
    }

}
