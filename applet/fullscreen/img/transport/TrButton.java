/* Custom transport buttons class version 1.0.0
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
package img.transport;

import java.awt.*;
import java.awt.event.*;
import java.awt.geom.*;
import javax.swing.*;
import img.transport.*;

/**
 * Implements a set of buttons for transport controls.
 * setCountdown() can be called in a loop with parameter from 0.0
 * to 1.0 to provide a progress indicator.
 * In addition, setBusy() can be called in a loop with parameter from
 * 0.0 to 1.0 to animate a button to show that something is happening.
 */
public class TrButton extends JButton
{
  private TrButtonType type;
  private float countDown;
  private float busy;

  public TrButton(TrButtonType type)
  {
    this.type = type;
    setContentAreaFilled(true);
    setBorderPainted(false);
    super.setRolloverEnabled(true);
    this.countDown = 1.0f;
    this.busy = -1.0f;
  }

  public TrButton(TrButtonType type, Dimension d, Color fg, Color bg)
  {
    this.type = type;
    setContentAreaFilled(true);
    setBorderPainted(false);
    super.setPreferredSize(d);
    super.setMinimumSize(d);
    super.setMaximumSize(d);
    super.setForeground(fg);
    super.setBackground(bg);
    super.setRolloverEnabled(true);
    this.countDown = 1.0f;
    this.busy = -1.0f;
  }

  public void setType(TrButtonType type)
  {
    this.type = type;
  }
  
  public TrButtonType getType()
  {
    return type;
  }

  public void setCountdown(float countDown)
  {
    if (countDown < 0.0f)
      countDown = 0.0f;
    if (countDown > 1.0f)
      countDown = 1.0f;
    this.countDown = countDown;
    repaint();
  }

  public void setBusy(float busy)
  {
    if (busy < 0.0f)
      busy = 0.0f;
    if (busy > 1.0f)
      busy = 1.0f;
    this.busy = busy;
    repaint();
  }
  
  public void setNotBusy()
  {
    this.busy = -1.0f;
    repaint();
  }
  
  public boolean isBusy()
  {
    if (this.busy < 0.0f)
      return false;
    else
      return true;
  }

  public void paintComponent(Graphics g)
  {
    Graphics2D g2 = (Graphics2D)g;
    g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
    g2.setRenderingHint(RenderingHints.KEY_STROKE_CONTROL, RenderingHints.VALUE_STROKE_PURE);

    // Clear the drawing area
    super.paintComponent(g);

    Dimension d = getSize();
    double w = (double)Math.min(d.width, d.height);
    float bdr = 0.1f*(float)w;
    float dia = 0.8f*(float)w;
    BasicStroke stroke = new BasicStroke(dia*0.1f);
    if (!model.isEnabled())
      g2.setColor(Color.gray);
    else if (model.isRollover())
      g2.setColor(Color.white);
    else
      g2.setColor(super.getForeground());

    GeneralPath path = new GeneralPath(GeneralPath.WIND_EVEN_ODD, 20);
    if (countDown == 1.0)
      path.append(new Ellipse2D.Float(bdr, bdr, dia, dia), false);
    else
      path.append(new Arc2D.Float(bdr, bdr, dia, dia,
                                  90.0f, -360.0f*countDown, Arc2D.OPEN), false);

    /* The 'wobble' transformation */
    if (busy >= 0.0f)
    {
      double theta = 2.0*Math.PI*(0.25 - busy);
      double st = Math.sin(theta);
      double ct = Math.cos(theta);
      final double am1 = -0.15;
      AffineTransform wobble = new AffineTransform(1.0+am1*ct*ct,
                                                  -am1*ct*st,
                                                  -am1*ct*st,
                                                  1.0+am1*st*st,
                                                  w*am1*ct*(st-ct)/2.0,
                                                  w*am1*st*(ct-st)/2.0);
      path.transform(wobble);
    }

    if (type == TrButtonType.START)
    {
      path.moveTo(bdr + dia*0.5f, bdr + dia*0.2f);
      path.lineTo(bdr + dia*0.5f, bdr + dia*0.8f);
      path.lineTo(bdr + dia*0.15f, bdr + dia*0.5f);
      path.closePath();
      path.moveTo(bdr + dia*0.75f, bdr + dia*0.2f);
      path.lineTo(bdr + dia*0.75f, bdr + dia*0.8f);
      path.lineTo(bdr + dia*0.4f, bdr + dia*0.5f);
      path.closePath();
    }
    if (type == TrButtonType.PREVIOUS)
    {
      path.moveTo(bdr + dia*0.7f, bdr + dia*0.2f);
      path.lineTo(bdr + dia*0.7f, bdr + dia*0.8f);
      path.lineTo(bdr + dia*0.35f, bdr + dia*0.5f);
      path.closePath();
      path.moveTo(bdr + dia*0.3f, bdr + dia*0.2f);
      path.lineTo(bdr + dia*0.3f, bdr + dia*0.8f);
    }
    else if (type == TrButtonType.PLAY)
    {
      path.moveTo(bdr + dia*0.4f, bdr + dia*0.2f);
      path.lineTo(bdr + dia*0.4f, bdr + dia*0.8f);
      path.lineTo(bdr + dia*0.75f, bdr + dia*0.5f);
      path.closePath();
    }
    else if (type == TrButtonType.PAUSE)
    {
      path.moveTo(bdr + dia*0.4f, bdr + dia*0.2f);
      path.lineTo(bdr + dia*0.4f, bdr + dia*0.8f);
      path.moveTo(bdr + dia*0.6f, bdr + dia*0.2f);
      path.lineTo(bdr + dia*0.6f, bdr + dia*0.8f);
    }
    else if (type == TrButtonType.NEXT)
    {
      path.moveTo(bdr + dia*0.3f, bdr + dia*0.2f);
      path.lineTo(bdr + dia*0.3f, bdr + dia*0.8f);
      path.lineTo(bdr + dia*0.65f, bdr + dia*0.5f);
      path.closePath();
      path.moveTo(bdr + dia*0.7f, bdr + dia*0.2f);
      path.lineTo(bdr + dia*0.7f, bdr + dia*0.8f);
    }

    g2.setStroke(stroke);
    g2.draw(path);
  }
}
