let turtleImage;
let x;
let y;
let angle;
let step;
let maxRadius;
let trail;
let drawingFinished;
let particles;

function preload() {
  turtleImage = loadImage("assets/img/IMG_6303.jpeg");
}

function setup() {
  const canvas = createCanvas(760, 520);
  canvas.parent("turtle-canvas");
  background(255);
  frameRate(10);

  trail = createGraphics(width, height);
  trail.clear();
  trail.stroke("#d12525");
  trail.strokeWeight(3.2);
  trail.noFill();

  particles = [];

  x = width / 2;
  y = height / 2;
  angle = -90;
  step = 12;
  maxRadius = min(width, height) * 0.42;
  drawingFinished = false;
}

function draw() {
  background(255);

  if (!drawingFinished && dist(width / 2, height / 2, x, y) <= maxRadius) {
    const nextX = x + cos(radians(angle)) * step;
    const nextY = y + sin(radians(angle)) * step;

    trail.line(x, y, nextX, nextY);
    spawnHeartParticles(x, y);

    x = nextX;
    y = nextY;
    angle += 16;
    step += 0.6;

    if (dist(width / 2, height / 2, x, y) > maxRadius) {
      drawingFinished = true;
    }
  }

  updateParticles();
  image(trail, 0, 0);
  drawParticles();

  if (!drawingFinished) {
    drawCircularHead();
  }
}

function spawnHeartParticles(px, py) {
  for (let i = 0; i < 3; i++) {
    particles.push({
      x: px,
      y: py,
      vx: random(-1.4, 1.4),
      vy: random(-1.1, 1.1),
      size: random(2.5, 6),
      alpha: random(180, 255),
      drift: random(0.01, 0.08),
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    p.x += p.vx;
    p.y += p.vy;

    p.vx += random(-p.drift, p.drift);
    p.vy += random(-p.drift, p.drift);

    if (p.x < -20) p.x = width + 20;
    if (p.x > width + 20) p.x = -20;
    if (p.y < -20) p.y = height + 20;
    if (p.y > height + 20) p.y = -20;

    p.alpha = constrain(p.alpha + random(-8, 8), 120, 255);
  }
}

function drawParticles() {
  for (const p of particles) {
    push();
    noStroke();
    fill(200, 0, 0, p.alpha);
    drawMiniHeart(p.x, p.y, p.size);
    pop();
  }
}

function drawMiniHeart(px, py, s) {
  beginShape();
  vertex(px, py);
  bezierVertex(
    px - s * 2.2,
    py - s * 3.2,
    px - s * 4.4,
    py - s * 1.4,
    px,
    py + s * 3.6,
  );
  bezierVertex(px + s * 4.4, py - s * 1.4, px + s * 2.2, py - s * 3.2, px, py);
  endShape(CLOSE);
}

function drawCircularHead() {
  const headSize = 52;
  const circleMask = createGraphics(headSize, headSize);
  circleMask.clear();
  const ctx = circleMask.drawingContext;
  ctx.save();
  ctx.beginPath();
  ctx.arc(headSize / 2, headSize / 2, headSize / 2, 0, Math.PI * 2);
  ctx.clip();
  circleMask.imageMode(CENTER);
  circleMask.image(turtleImage, headSize / 2, headSize / 2, headSize, headSize);
  ctx.restore();

  push();
  imageMode(CENTER);
  image(circleMask, x, y, headSize, headSize);
  pop();
}
