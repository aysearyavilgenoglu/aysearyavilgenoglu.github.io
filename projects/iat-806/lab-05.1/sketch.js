let balls = [];
const numBalls = 180;
const connectionDistance = 84;

// Create a canvas and fill it with randomly generated balls.
function setup() {
  const canvas = createCanvas(800, 560);
  canvas.parent("sketch-holder");
  pixelDensity(1);

  for (let i = 0; i < numBalls; i++) {
    balls.push(createRandomBall());
  }
}

// Draw a deep-space background, connect nearby balls, and update the swarm.
function draw() {
  background(10, 17, 35);
  drawConnections();

  for (const ball of balls) {
    ball.update(2);
  }
}

// Draw fine lines between nearby balls to create moving constellations.
function drawConnections() {
  strokeWeight(1);

  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const first = balls[i];
      const second = balls[j];
      const distance = dist(first.x, first.y, second.x, second.y);

      if (distance < connectionDistance) {
        stroke(88, 217, 231, map(distance, 0, connectionDistance, 55, 0));
        line(first.x, first.y, second.x, second.y);
      }
    }
  }
}

// Highlight the ball under the mouse and reset all the others.
function mousePressed() {
  for (const ball of balls) {
    ball.respond(ball.contains(mouseX, mouseY));
  }
}
