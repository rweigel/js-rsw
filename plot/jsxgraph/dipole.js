function dipole(el,N) {

  // Plot parameters
  // board.boundingbox array format: [xmin,ymax,xmax,ymin]
  let pparams = {
            line: {strokeColor:'red', strokeWidth:2, withLabel:false},
            board: {showCopyright: false, axis:true, boundingbox:[-11,11,11,-11]},
            ppoints: {strokeWidth: 0, fillColor: 'red', withLabel: false},
            npoints: {strokeWidth: 0, fillColor: 'green', withLabel: false}            
          };

  // Integration parameters
  const domrect = document.getElementById(el).getBoundingClientRect();
  const xlims = [pparams.board.boundingbox[0],pparams.board.boundingbox[2]];
  const ylims = [pparams.board.boundingbox[3],pparams.board.boundingbox[1]];
  let iparams = {
            dt: 0.05,
            minR: 0.1,
            maxT: 50000,
            xlims: xlims,
            ylims: ylims,
            pixelWidth: (xlims[1]-xlims[0])/domrect.width,
            pixelHeight: (ylims[1]-ylims[0])/domrect.height,
            sources: dipoles(N,0.125),
            startPoints: startPoints(xlims,ylims,10)
  };

  let board = JXG.JSXGraph.initBoard(el,pparams.board);

  for (let i = 0;i < iparams.sources.length;i++) {
    if (iparams.sources[i][2] > 0) {
      board.create('point', iparams.sources[i].slice(0,2), pparams.ppoints);
    } else {
      board.create('point', iparams.sources[i].slice(0,2), pparams.npoints);
    }
  }

  console.log("Starting Integration.")
  document.getElementById("status"+el.substr(-1)).textContent="Starting Integration";
  const Np = iparams.startPoints.length;
  for (let i = 0;i < Np;i++) {
    // Set timeout so display is updated (not able to control update frequency, however)
    // Use JSXGraph options to update drawing?
    //setTimeout(function() {
      let XY = integrate(iparams.startPoints[i][0],iparams.startPoints[i][1],iparams);
      board.create('curve', XY[0], pparams.line);
      board.create('curve', XY[1], pparams.line);
      board.update();
      document.getElementById("status"+el.substr(-1)).textContent="Traced line "+(i+1)+" of "+Np;
      if (i == Np-1) {
        document.getElementById("status"+el.substr(-1)).textContent="Integration finished";
      }
    //},0)
  }
  console.log("Integration finished");
}

function dipoles(N,d) {
  let xyq = [];
  const shift = (N-1)/2;
  for (let i = 0; i < N;i++) {
    xyq[i] = [0,i+d-shift,1];     
  }
  for (let i = 0; i < N;i++) {
    xyq[i+N] = [0,i-d-shift,-1];     
  }
  return xyq;
}

function startPoints(xlims,ylims,N) {
  let p = [];
  const dx = (xlims[1]-xlims[0])/(N-1);
  const dy = (ylims[1]-ylims[0])/(N-1);
  for (let i = 0; i < N; i++) {
    p[5*i+0] = [xlims[0]+i*dx,ylims[0]]; // Bottom border
    p[5*i+1] = [xlims[0]+i*dx,ylims[1]]; // Top border
    p[5*i+2] = [xlims[0],ylims[0]+i*dy]; // Left border   
    p[5*i+3] = [xlims[1],ylims[0]+i*dy]; // Right border   
    p[5*i+4] = [xlims[0]+i*dx,0]; // x = 0
  }
  return p;
}

function field(x,y,params) {

    if (!params.sources || params.sources.length == 0) {
      console.log("Error: No sources given.")
      return [Math.NaN,Math.NaN,r];
    }

    let Ex = 0;
    let Ey = 0;
    let r,r2,R,xc,yc,Q;
    let rmin;

    for (let n = 0; n < params.sources.length; n++) {
  
      xc = params.sources[n][0];
      yc = params.sources[n][1];
      Q  = params.sources[n][2];

      r2 = (x-xc)*(x-xc) + (y-yc)*(y-yc);
      R = Math.pow(r2,1.5);
      r = Math.sqrt(r2);
      if (n == 0) {rmin = r} else {rmin = Math.min(r,rmin)}
      if (r <= params.minR 
          || x < params.xlims[0] || x > params.xlims[1] 
          || y < params.ylims[0] || y > params.ylims[1]) {
        Ex = NaN;
        Ey = NaN;
      } else {
        Ex = Ex + Q*(x-xc)/R;
        Ey = Ey + Q*(y-yc)/R;        
      }
    }

    return [Ex,Ey,rmin];
}

function integrate(xo,yo,params) {

  const dt = params.dt;
  const minR = params.minR;
  //const xo = params.starts[0][0];
  //const yo = params.starts[0][1];

	let continuea = true;
  let continuef = true;
  let continueb = true;

  // Only keep positions on trace separated by more than pixel hypotenuse length.
  let dlmin = Math.sqrt(params.pixelWidth*params.pixelWidth+params.pixelHeight*params.pixelHeight);
  let dlftmp = 0;
  let dlbtmp = 0;

  let dlf = 0; let tf = 0;
  let dlb = 0; let tb = 0;
  let tmp = 0;

  let xf = xo; let yf = yo;
  let xb = xo; let yb = yo;
  let Xf = []; let Yf = [];
  let Xb = []; let Yb = [];

  let t = 0;
  while (t < params.maxT) {
    if (continuef) { // Forward
      let Ef = field(xf,yf,params);
      if (isNaN(Ef[0])) {
        continuef = false;
      } else {
        Xf[tf] = xf;
        Yf[tf] = yf;
        dxf = dt*Ef[2]*Ef[0];
        dyf = dt*Ef[2]*Ef[1];
        xf = xf + dxf; 
        yf = yf + dyf;	
      }
      tmp = Math.sqrt(dxf*dxf+dyf*dyf);
      dlf = dlf + tmp;
      dlftmp = dlftmp + tmp;
      if (dlftmp > dlmin) { // Keep position.
        tf = tf + 1;
        dlftmp = 0;
      }
    }
    if (continueb) { // Backward
      let Eb = field(xb,yb,params);
      if (isNaN(Eb[0])) {
        continueb = false
      } else {
        Xb[tb] = xb;
        Yb[tb] = yb;
        dxb = dt*Eb[2]*Eb[0];
        dyb = dt*Eb[2]*Eb[1];
        xb = xb - dxb; 
        yb = yb - dyb;
        tmp = Math.sqrt(dxb*dxb+dyb*dyb);
        dlb = dlb + tmp;
        dlbtmp = dlbtmp + tmp;
        if (dlbtmp > dlmin) { // Keep position.
          tb = tb + 1;
          dlbtmp = 0;
        }
      }
    }

    if (continuef == false && continueb == false) {
      break;
    }
   t = t + 1;
  }
  if (t == params.maxT) {
    console.log("Max number of steps ("+params.maxT+") reached for [xo,yo]=["+xo+","+yo+"]");
  }
  return [[Xf,Yf],[Xb,Yb]];
}