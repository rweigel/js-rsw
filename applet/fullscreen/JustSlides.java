/* JustSlides version 1.0.0
 *
 * A basic slideshow using Java Swing
 *
 * Copyright (c) 2003, Ian Goldby
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 * 3. Neither the name of the author nor any contributors may be used to
 *    endorse or promote products derived from this software without specific
 *    prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

import java.awt.*;
import java.awt.event.*;
import javax.swing.*;
import java.util.ArrayList;
import img.transport.*;

public class JustSlides extends JApplet
{
  int slideNumber = 0;     // The slide currently on the screen
  int numSlides = 0;       // Number of slides
  ArrayList slides = new ArrayList();
  Timer timer;
  static int TICKS_PER_SEC = 8;
  int ticksToGo;
  int delaySecs;
  float busyVal = 0.0f;
  boolean autoAdvance;
  SlidePanel slidePanel;
  JPanel statusPanel;       // The entire status line at the bottom
  JLabel captionPanel;      // The slide caption in the middle of the status
  TrButton startButton, prevButton, nextButton, pauseButton, playButton;
                            // The transport buttons

  class Slide
  {
    private Image image;
    private String name;
    private String caption;
    private MediaTracker mt;
    private JApplet comp;

    public Slide(String name, String caption, JApplet comp)
    {
      this.name = name;
      this.caption = caption;
      this.image = null;
      this.comp = comp;
      this.mt = new MediaTracker(comp);
    }

    // Start loading the image associated with the slide
    public void startLoading()
    {
      if (name.length() > 0 && image == null)
      {
        image = comp.getImage(getDocumentBase(), name);
        if (image == null)
        {
          /* Some browsers tell us immediately if the file was not found */
          unload();
          slidePanel.setMessage("Slide missing!");
        }
        else
        {
          mt.addImage(image, 0);
          mt.checkID(0, true); // Start loading this image right away
        }
      }
    }
    
    public boolean isLoaded()
    {
      return mt.checkID(0);
    }
    
    public void unload()
    {
      if (image != null)
      {
        mt.removeImage(image);
        image = null; // Delete the image
      }
    }

    // Display the slide, waiting if necessary for it to fully load
    // first. If it fails to load, display a message.
    public void display()
    {
      // Make sure image is fully loaded, waiting if necessary.
      try { mt.waitForID(0); }
      catch (InterruptedException ex) { }

      if (mt.isErrorID(0))
      {
        unload();
        slidePanel.setMessage("Slide missing!");
      }

      // Update the enabled/disabled status of the transport buttons
      updateButtons();

      // Display the slide
      slidePanel.setImage(image);

      // Update the caption at the bottom of the screen
      captionPanel.setText(caption);
    }
  }
  
  private void updateButtons()
  {
    // Previous and Start
    if (slideNumber < 2)
    {
      prevButton.setEnabled(false);
      startButton.setEnabled(false);
    }
    else
    {
      prevButton.setEnabled(true);
      startButton.setEnabled(true);
    }
    
    // Previous when cached image not yet loaded
    if (prevButton.isBusy())
      prevButton.setEnabled(false);
      
    // Pause
    if (autoAdvance)
      pauseButton.setEnabled(true);
    else
      pauseButton.setEnabled(false);

    // Play
    if (!autoAdvance && slideNumber < numSlides-1)
      playButton.setEnabled(true);
    else
      playButton.setEnabled(false);

    // Next
    if (slideNumber < numSlides-1 && !nextButton.isBusy())
      nextButton.setEnabled(true);
    else
      nextButton.setEnabled(false);
  }

  public String[][] getParameterInfo()
  {
    String[][] info = {
      // Parameter Name     Kind of Value   Description
        {"autoadvance",     "yes/no",       "Auto-advance the slide show"},
        {"time",            "int",          "Time between slides in seconds"},
        {"dir",             "string",       "Subdirectory containing the slides"},
        {"1",               "string",       "Slide 1 filename,Caption"},
        {"2",               "string",       "Slide 2 filename,Caption"},
        {"3",               "string",       "Slide 3 filename,Caption"},
        {"...",             "...",          "... etc"},
    };
    return info;
  }
  
  public String getAppletInfo()
  {
    return "JustSlides - a slide show Java Applet, Copyright 2003 Ian Goldby, http://www.goldby.net/ian/\nYou may distribute this code under the terms of the BSD license.";
  }

  public void init()
  {
    String str;

    // How many seconds between slides?
    str = getParameter("time");
    delaySecs = 10; // Default 10 secs
    try
    {
      if (str != null)
        delaySecs = Integer.parseInt(str);
    }
    catch (Exception e) { }
    
    // Start with autoadvance on?
    str = getParameter("autoadvance");
    autoAdvance = false;
    if (str != null)
    {
      if (str.equalsIgnoreCase("yes"))
        autoAdvance = true;
    }
    
    // Subdirectory for slides
    String dir = getParameter("dir");
    if (dir == null)
      dir = "";

    // Slide 0 is always the Loading... slide. It has no associated image
    slides.add(new Slide("", "Just Slides (c) 2003 Ian Goldby", this));

    // Read in list of slides
    numSlides = 1;
    String file;
    String caption;
    int comma;
    while ((str = getParameter(String.valueOf(numSlides))) != null)
    {
      comma = str.indexOf(',');
      if (comma == -1)
        comma = str.length();
      file = str.substring(0, comma);
      if (comma < (str.length()-1))
        caption = str.substring(comma+1);
      else
        caption = "";
      slides.add(new Slide(dir + "/" + file, caption, this));
      numSlides++;
    }

    // Set up a timer that calls this object's action handler.
    timer = new Timer(1000/TICKS_PER_SEC, new TimerAdvance());
    timer.setCoalesce(true); // If application doesn't keep up, combine
                             // pending messages into a single message.

    // Create the slide area
    slidePanel = new SlidePanel();
    slidePanel.setBackground(Color.black);
    slidePanel.setForeground(Color.yellow);
    slidePanel.setOpaque(true);

    // Create the status panel
    statusPanel = new JPanel();
    statusPanel.setLayout(new BoxLayout(statusPanel, BoxLayout.X_AXIS));
    statusPanel.setBorder(BorderFactory.createEmptyBorder());
    statusPanel.setBackground(Color.black);
    statusPanel.setOpaque(true);

    // (The ContentPane's default layout is BorderLayout.)
    getContentPane().add(slidePanel, BorderLayout.CENTER);
    getContentPane().add(statusPanel, BorderLayout.SOUTH);

    // Create the slide caption next
    captionPanel = new JLabel(" ", JLabel.CENTER);
    captionPanel.setBackground(Color.black);
    captionPanel.setForeground(Color.white);
    captionPanel.setOpaque(true);
    captionPanel.setBorder(BorderFactory.createEmptyBorder(0, 4, 0, 0));
    // If there is not enough width, allow caption to be truncated
    captionPanel.setMinimumSize(new Dimension(0, captionPanel.getMinimumSize().height*5/4));
    // Buttons size themselves to the minimum size of the status panel
    statusPanel.setMinimumSize(new Dimension(0, captionPanel.getMinimumSize().height));

    // Add the caption, and transport buttons to the status bar
    statusPanel.add(captionPanel);
    // Add the stretchy glue to take up the free space
    statusPanel.add(Box.createHorizontalGlue());
    ActionListener buttonListener = new ButtonListener();
    Dimension d = new Dimension(captionPanel.getMinimumSize().height, captionPanel.getMinimumSize().height);
    startButton = addTransportButton(TrButtonType.START, d, statusPanel, buttonListener);
    prevButton  = addTransportButton(TrButtonType.PREVIOUS, d, statusPanel, buttonListener);
    pauseButton = addTransportButton(TrButtonType.PAUSE, d, statusPanel, buttonListener);
    playButton  = addTransportButton(TrButtonType.PLAY, d, statusPanel, buttonListener);
    nextButton  = addTransportButton(TrButtonType.NEXT, d, statusPanel, buttonListener);
    playButton.setEnabled(false); // Starts off in play mode

    // Start loading the first slide
    firstSlide();
  }

  private TrButton addTransportButton(TrButtonType type, Dimension d,
                                      Container container, ActionListener listener)
  {
    TrButton button = new TrButton(type, d, Color.cyan, Color.black);
    if (listener != null)
    {
      button.addActionListener(listener);
      button.setActionCommand(button.getType().toString());
    }
    container.add(button);

    return button;
  }

  // Invoked by the browser only.  invokeLater not needed
  // because startAnimation can be called from any thread.
  public void start()
  {
    if (numSlides > 1)
      startTimer();
  }

  // Invoked by the browser only.  invokeLater not needed
  // because stopAnimation can be called from any thread.
  public void stop()
  {
    stopTimer();
  }

  // Can be invoked from any thread.
  public synchronized void startTimer()
  {
    // Start animating!
    if (!timer.isRunning())
    {
      timer.setInitialDelay(0);
      timer.start();
    }

    updateButtons();
  }

  // Can be invoked from any thread.
  public synchronized void stopTimer()
  {
    // Stop the animating thread.
    if (timer.isRunning() && !nextButton.isBusy() && !prevButton.isBusy())
      timer.stop();

    updateButtons();
    playButton.setCountdown(1.0f); // Not counting down
  }

  // Goes to the next slide.
  private void nextSlide()
  {
    if (slideNumber < numSlides-1)
    {
      // Unload the previous slide (if any)
      if (slideNumber > 1)
        ((Slide)slides.get(slideNumber-1)).unload();
      // Display next slide
      slideNumber++;
      ((Slide)slides.get(slideNumber)).display();
      // Start loading the next slide after this (if any)
      if (slideNumber < numSlides-1)
      {
        ((Slide)slides.get(slideNumber+1)).startLoading();
      // If the slide is not already loaded, start the timer to enable
      // the animation effect.
        if (!((Slide)slides.get(slideNumber+1)).isLoaded())
          startTimer();
      }
    }
  }

  // Goes to the previous slide.
  private void previousSlide()
  {
    if (slideNumber > 1) // 1 is the first real slide.
    {
       // Unload the next slide (if any)
       if (slideNumber < numSlides-1)
         ((Slide)slides.get(slideNumber+1)).unload();
       // Display previous slide
       slideNumber--;
       ((Slide)slides.get(slideNumber)).display();
       // Start loading the previous slide before this (if any)
       if (slideNumber > 1)
         ((Slide)slides.get(slideNumber-1)).startLoading();
       // If the slide is not already loaded, start the timer to enable
       // the animation effect.
      if (!((Slide)slides.get(slideNumber-1)).isLoaded())
        startTimer();
    }
  }
  
  // Goes to the first slide.
  private void firstSlide()
  {
    // Unload the old next cached slide (if any)
    if (slideNumber > 2 && slideNumber < numSlides-1)
      ((Slide)slides.get(slideNumber+1)).unload();
    // Unload the old current slide (if any)
    if (slideNumber > 3)
      ((Slide)slides.get(slideNumber)).unload();
    // Unload the old previous cached slide (if any)
    if (slideNumber > 4)
      ((Slide)slides.get(slideNumber-1)).unload();

    slideNumber = 0;
    if (numSlides > 1)
    {
      slidePanel.setMessage("Loading...");
      ((Slide)slides.get(0)).display();
      ((Slide)slides.get(1)).startLoading();
    }
    else
      slidePanel.setMessage("No slides");
    ticksToGo = 0;
    startTimer();
  }

  // The action listener that responds to the timer event
  class TimerAdvance implements ActionListener
  {
    public void actionPerformed(ActionEvent e)
    {
      ticksToGo--;

      if (autoAdvance) // Update the countdown animation
        playButton.setCountdown((float)ticksToGo/(float)(delaySecs*TICKS_PER_SEC));

      // Update the busy animation counter
      busyVal = (busyVal + 0.1f) % 1.0f;
      // If the previous image hasn't finished loading animate the previous button.
      if (slideNumber > 1 && !((Slide)slides.get(slideNumber-1)).isLoaded())
        prevButton.setBusy(busyVal);
      else
        prevButton.setNotBusy();
      // If the next image hasn't finished loading, animate the next button, then just
      // exit - we couldn't autoadvance even if we wanted to.
      if (slideNumber < numSlides-1 && !((Slide)slides.get(slideNumber+1)).isLoaded())
      {
        nextButton.setBusy(busyVal);
        updateButtons();
        return;
      }
      else
        nextButton.setNotBusy();

      // If autoadvance is off, just stop the timer and return
      // (but do autoadvance to the first slide anyway)
      if (!autoAdvance && slideNumber > 0 && !prevButton.isBusy())
      {
        stopTimer();
        updateButtons();
        return;
      }

      // If it's not yet time for the next slide, just return
      if (ticksToGo > 0)
      {
        updateButtons();
        return;
      }
      
      // Display the next slide
      nextSlide();
      playButton.setCountdown(1.0f); // Immediately reset the countdown
                                     // (don't wait for first tick)

      if (slideNumber >= numSlides-1) // End of show
      {
        stopTimer();
        autoAdvance = false;
      }
      else
        ticksToGo = delaySecs * TICKS_PER_SEC;

      updateButtons();
    }
  }

  // The action listener that responds to button presses
  class ButtonListener implements ActionListener
  {
    public void actionPerformed(ActionEvent e)
    {
      String actionCommand = e.getActionCommand();

      if (actionCommand.equals(TrButtonType.PLAY.toString()))
      {
        autoAdvance = true;
        ticksToGo = 0;
        startTimer();
      }
      else if (actionCommand.equals(TrButtonType.PAUSE.toString()))
      {
        autoAdvance = false;
        stopTimer(); // (Doesn't actually stop it if still needed for 'busy' animation)
      }
      else if (actionCommand.equals(TrButtonType.START.toString()))
        firstSlide();
      else if (actionCommand.equals(TrButtonType.PREVIOUS.toString()) ||
               actionCommand.equals(TrButtonType.NEXT.toString()))
      {
        autoAdvance = false;
        stopTimer(); // (Doesn't actually stop it if still needed for 'busy' animation)

        if (actionCommand.equals(TrButtonType.PREVIOUS.toString()))
          previousSlide();
        else if (actionCommand.equals(TrButtonType.NEXT.toString()))
          nextSlide();
      }
    }
  }
}

// Class to implement displaying slides
//
class SlidePanel extends JPanel
{
  Image image;
  String message;

  public SlidePanel()
  {
    image = null;
    message = "Loading...";
  }

  public void setImage(Image image)
  {
    this.image = image;
    repaint();
  }

  public void setMessage(String message)
  {
    this.message = message;
    repaint();
  }
  
  public void paintComponent(Graphics g)
  {
    // Draw the background
    super.paintComponent(g);
    Graphics2D g2 = (Graphics2D)g; // So we can antialias text

    // Get the available drawing area
    int cw, ch, cx, cy;
    Insets insets = getInsets();
    cx = insets.left;
    cy = insets.top;
    cw = getWidth() - cx - insets.right;
    ch = getHeight() - cy - insets.bottom;

    if (image == null)
    {
      int x, y;
      RenderingHints hints =
        new RenderingHints(RenderingHints.KEY_TEXT_ANTIALIASING,
                           RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
      g2.addRenderingHints(hints);
      Font font = getFont();
      font = font.deriveFont(font.BOLD, 24.0f);
      g2.setFont(font);
      g2.setColor(Color.yellow);
      FontMetrics metrics = g2.getFontMetrics();
      int w = metrics.stringWidth(message);
      int h = metrics.getHeight();
      g2.drawString(message, (cw-w)/2, (ch-h)/2);
    }
    else
    {
      double scale;
      int width, height, x, y;
      
      RenderingHints hints =
        new RenderingHints(RenderingHints.KEY_INTERPOLATION,
                           RenderingHints.VALUE_INTERPOLATION_BICUBIC);
      g2.addRenderingHints(hints);

      // Calculate optimum image size
      scale = (double)cw/(double)image.getWidth(this);
      if ((double)image.getHeight(this) * scale > (double)ch)
        scale = (double)ch/(double)image.getHeight(this);
      width = (int)(scale * image.getWidth(this));
      height = (int)(scale * image.getHeight(this));
      x = cx + (cw - width)/2;
      y = cy + (ch - height)/2;
      // Draw the image
      g2.drawImage(image, x, y, x + width, y + height,
                   0, 0, image.getWidth(this), image.getHeight(this), this);
    }
  }
}
