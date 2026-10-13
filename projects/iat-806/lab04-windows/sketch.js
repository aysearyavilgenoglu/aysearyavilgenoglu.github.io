// Window City
// Click a window: it opens and someone pops out.
// Click the sky (or scroll): zoom out, and more buildings appear.

// ---------- ARRAYS ----------
let buildings = [];   // every building in the city
let stars = [];       // star positions for the night sky
const COLORS = ["#e8a87c", "#c38d9e", "#41b3a3", "#e27d60", "#85cdca", "#f6d186", "#a3a1c9"];
const MOODS = ["happy", "laugh", "sleep", "wave"];

// ---------- SETTINGS ----------
let zoom = 1;         // how close we are right now
let targetZoom = 1;   // where the zoom is moving to (makes it smooth)
let night = false;    // day or night
const GROUND = 50;    // height of the street at the bottom

function setup() {
  createCanvas(900, 600);
  // random stars, a different sky every time
  for (let i = 0; i < 90; i++) {
    stars.push({ x: random(width), y: random(height - 150), s: random(1, 3) });
  }
}

function draw() {
  // move zoom a little closer to targetZoom every frame
  zoom = lerp(zoom, targetZoom, 0.1);

  // make sure there are buildings everywhere we can see
  fillCity();

  drawSky();

  // the "camera": everything inside push/pop gets zoomed
  push();
  translate(width / 2, height - GROUND);
  scale(zoom);
  translate(-width / 2, 0);
  for (let b of buildings) {
    drawBuilding(b);
  }
  pop();

  drawStreet();

  // hand cursor when the mouse is over a window
  let w = findWindow(mouseX, mouseY);
  if (w) {
    cursor(HAND);
  } else {
    cursor(ARROW);
  }

  drawHelp();
}

// ---------- MY FUNCTIONS ----------

// makes one new building at position x, with random size, shape and color
function makeBuilding(x) {
  let b = {
    x: x,
    w: random(80, 150),
    h: random(160, 420),
    type: random(["rect", "round"]),
    col: random(COLORS),
    roof: random() < 0.4,       // some rectangle buildings get a triangle roof
    windows: []
  };

  let ww = 24;                               // window width
  let wh = b.type === "round" ? 24 : 30;     // round windows are circles
  let cols = max(1, floor((b.w - 10) / (ww + 10)));
  let rows = max(1, floor((b.h - 40) / 44));
  let gapX = (b.w - cols * ww) / (cols + 1);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      b.windows.push({
        x: gapX + c * (ww + gapX),  // position inside the building
        y: 22 + r * 44,
        w: ww,
        h: wh,
        open: false,
        t: 0,                       // 0 = closed, 1 = fully open (for animation)
        person: random() < 0.85,    // most windows have someone inside
        mood: random(MOODS),
        lightOn: random() < 0.4     // at night some windows are lit
      });
    }
  }
  return b;
}

// adds buildings on the left and right until the whole screen is full
function fillCity() {
  let left = width / 2 - width / 2 / zoom;
  let right = width / 2 + width / 2 / zoom;

  if (buildings.length === 0) {
    buildings.push(makeBuilding(width / 2 - 60));
  }

  // add to the right
  let last = buildings[buildings.length - 1];
  while (last.x + last.w < right + 50) {
    last = makeBuilding(last.x + last.w + random(6, 30));
    buildings.push(last);
  }

  // add to the left
  let first = buildings[0];
  while (first.x > left - 50) {
    let b = makeBuilding(0);
    b.x = first.x - b.w - random(6, 30);
    buildings.unshift(b);
    first = b;
  }
}

function drawBuilding(b) {
  noStroke();
  if (night) {
    fill(lerpColor(color(b.col), color(20, 20, 50), 0.6));
  } else {
    fill(b.col);
  }

  if (b.type === "rect") {
    rect(b.x, -b.h, b.w, b.h);
    if (b.roof) {
      triangle(b.x - 6, -b.h, b.x + b.w + 6, -b.h, b.x + b.w / 2, -b.h - b.w * 0.45);
    } else {
      // antenna with a blinking light
      stroke(60);
      strokeWeight(3);
      line(b.x + b.w * 0.7, -b.h, b.x + b.w * 0.7, -b.h - 35);
      noStroke();
      if (frameCount % 60 < 30) {
        fill(255, 60, 60);
      } else {
        fill(120, 30, 30);
      }
      circle(b.x + b.w * 0.7, -b.h - 35, 8);
    }
  } else {
    // round building: a tower with a dome on top
    rect(b.x, -b.h, b.w, b.h);
    arc(b.x + b.w / 2, -b.h, b.w, b.w * 0.8, PI, TWO_PI);
  }

  for (let win of b.windows) {
    // open windows move toward 1, closed ones toward 0
    if (win.open) {
      win.t = lerp(win.t, 1, 0.15);
    } else {
      win.t = lerp(win.t, 0, 0.2);
    }
    drawWindow(b, win);
  }
}

function drawWindow(b, win) {
  let x = b.x + win.x;
  let y = -b.h + win.y;
  let round = b.type === "round";

  // the glass
  noStroke();
  if (win.t > 0.02) {
    fill(255, 225, 140);                 // open: warm light
  } else if (night && win.lightOn) {
    fill(255, 210, 110, 170);            // night: some lights are on
  } else if (night) {
    fill(35, 45, 80);
  } else {
    fill(160, 200, 230);
  }
  if (round) {
    ellipse(x + win.w / 2, y + win.h / 2, win.w, win.h);
  } else {
    rect(x, y, win.w, win.h);
  }

  // the person grows in as the window opens
  if (win.person && win.t > 0.02) {
    push();
    translate(x + win.w / 2, y + win.h * 0.55);
    scale(win.t);
    drawPerson(win.w * 0.8, win.mood);
    pop();
  }

  // curtains slide open on rectangle windows
  if (!round && win.t < 0.98) {
    fill(night ? color(90, 60, 110) : color(230, 120, 140));
    let cw = (1 - win.t) * win.w / 2;
    rect(x, y, cw, win.h);
    rect(x + win.w - cw, y, cw, win.h);
  }

  // window frame
  noFill();
  stroke(60, 50, 60);
  strokeWeight(2);
  if (round) {
    ellipse(x + win.w / 2, y + win.h / 2, win.w, win.h);
  } else {
    rect(x, y, win.w, win.h);
    // window sill
    line(x - 3, y + win.h + 2, x + win.w + 3, y + win.h + 2);
  }
  noStroke();
}

// the little person: black hair with two buns (that's me!)
function drawPerson(s, mood) {
  // hair
  fill(25);
  circle(-s * 0.38, -s * 0.48, s * 0.35);
  circle(s * 0.38, -s * 0.48, s * 0.35);
  rect(-s / 2, -s / 2, s, s * 0.95, s * 0.15);
  // face
  fill(246, 206, 178);
  rect(-s * 0.37, -s * 0.28, s * 0.74, s * 0.7, s * 0.25);
  // bangs
  fill(25);
  arc(-s * 0.15, -s * 0.28, s * 0.5, s * 0.3, 0, PI);
  arc(s * 0.15, -s * 0.28, s * 0.5, s * 0.3, 0, PI);
  // cheeks
  fill(245, 160, 150);
  circle(-s * 0.22, s * 0.15, s * 0.14);
  circle(s * 0.22, s * 0.15, s * 0.14);

  stroke(25);
  strokeWeight(max(1, s * 0.05));
  noFill();
  if (mood === "laugh") {
    // > < eyes, big open mouth, tears
    line(-s * 0.2, -s * 0.03, -s * 0.1, s * 0.02);
    line(-s * 0.2, s * 0.07, -s * 0.1, s * 0.02);
    line(s * 0.2, -s * 0.03, s * 0.1, s * 0.02);
    line(s * 0.2, s * 0.07, s * 0.1, s * 0.02);
    noStroke();
    fill(130, 30, 40);
    arc(0, s * 0.18, s * 0.28, s * 0.25, 0, PI);
    fill(110, 185, 240);
    circle(-s * 0.3, s * 0.1 + (frameCount % 20) * s * 0.01, s * 0.08);
    circle(s * 0.3, s * 0.1 + (frameCount % 20) * s * 0.01, s * 0.08);
  } else if (mood === "sleep") {
    // closed eyes and a "z"
    line(-s * 0.2, s * 0.03, -s * 0.08, s * 0.03);
    line(s * 0.08, s * 0.03, s * 0.2, s * 0.03);
    circle(0, s * 0.24, s * 0.06);
    noStroke();
    fill(80);
    textSize(s * 0.35);
    text("z", s * 0.4, -s * 0.4 - (frameCount % 40) * s * 0.01);
  } else {
    // happy or wave: dot eyes and a smile
    noStroke();
    fill(25);
    circle(-s * 0.14, s * 0.02, s * 0.09);
    circle(s * 0.14, s * 0.02, s * 0.09);
    stroke(205, 60, 55);
    noFill();
    arc(0, s * 0.16, s * 0.2, s * 0.14, 0, PI);
    if (mood === "wave") {
      // a waving arm
      let a = sin(frameCount * 0.2) * 0.5;
      stroke(246, 206, 178);
      strokeWeight(s * 0.1);
      line(s * 0.4, s * 0.4, s * 0.4 + cos(-1.2 + a) * s * 0.4, s * 0.4 + sin(-1.2 + a) * s * 0.4);
    }
  }
  noStroke();
}

// turns the mouse position into a position in the zoomed city,
// then checks if it is inside a window. Gives back that window, or null.
function findWindow(mx, my) {
  let wx = (mx - width / 2) / zoom + width / 2;
  let wy = (my - (height - GROUND)) / zoom;
  for (let b of buildings) {
    if (wx > b.x && wx < b.x + b.w) {
      for (let win of b.windows) {
        let x = b.x + win.x;
        let y = -b.h + win.y;
        if (wx > x && wx < x + win.w && wy > y && wy < y + win.h) {
          return win;
        }
      }
    }
  }
  return null;
}

function drawSky() {
  if (night) {
    background(20, 24, 55);
    noStroke();
    fill(255);
    for (let s of stars) {
      circle(s.x, s.y, s.s);
    }
    // crescent moon: a circle with a sky-colored circle on top
    fill(250, 240, 200);
    circle(width - 100, 90, 60);
    fill(20, 24, 55);
    circle(width - 85, 80, 55);
  } else {
    background(185, 222, 240);
    noStroke();
    fill(255, 215, 90);
    circle(width - 100, 90, 70);
  }
}

function drawStreet() {
  noStroke();
  fill(night ? 40 : 75);
  rect(0, height - GROUND, width, GROUND);
  // road lines
  stroke(240, 220, 120);
  strokeWeight(4);
  for (let x = 0; x < width; x += 60) {
    line(x, height - GROUND / 2, x + 30, height - GROUND / 2);
  }
  noStroke();
}

function drawHelp() {
  fill(night ? 255 : 30);
  noStroke();
  textSize(13);
  text("click window = open  ·  click sky / scroll = zoom out  ·  SPACE = open random  ·  N = night  ·  C = close all  ·  +/- = zoom  ·  R = new city", 12, 20);
}

// ---------- MOUSE ----------
function mousePressed() {
  let w = findWindow(mouseX, mouseY);
  if (w) {
    w.open = !w.open;          // open it, or close it if it was open
  } else {
    targetZoom = max(0.15, targetZoom * 0.8);   // clicked the sky: zoom out
  }
}

function mouseWheel(event) {
  if (event.deltaY > 0) {
    targetZoom = max(0.15, targetZoom * 0.9);
  } else {
    targetZoom = min(2.5, targetZoom * 1.1);
  }
  return false; // stop the page from scrolling
}

// ---------- KEYBOARD ----------
function keyPressed() {
  if (key === " ") {
    // open 15 random windows
    for (let i = 0; i < 15; i++) {
      let b = random(buildings);
      let win = random(b.windows);
      win.open = true;
    }
  } else if (key === "n" || key === "N") {
    night = !night;
  } else if (key === "c" || key === "C") {
    for (let b of buildings) {
      for (let win of b.windows) win.open = false;
    }
  } else if (key === "+" || key === "=") {
    targetZoom = min(2.5, targetZoom * 1.25);
  } else if (key === "-") {
    targetZoom = max(0.15, targetZoom * 0.8);
  } else if (key === "r" || key === "R") {
    buildings = [];
    targetZoom = 1;
  }
}
