import java.applet.*;
import java.awt.*;
import java.awt.event.*;

public class TestApplet extends Applet {

    Frame f = new Frame("Frame Title");

    public void init() {
        f.setSize(new Dimension(300, 180));
	f.setBackground(Color.blue);
	f.setVisible(true);
    }

    // Must navigate away from page to close pop-up.
    public void stop() {
        f.setVisible(false);
    }

}
