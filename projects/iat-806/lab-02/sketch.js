let circleX = 50;
let circleY = 50;
let speedX = 5;
let speedY = 5;
let size = 100;
let sizeIncrement = 1;
let radius = size / 2;
let rightColor;
let leftColor;
let ballColor;
let paused = false;

function setup() {
  const canvas = createCanvas(800, 600);
  canvas.parent("sketch-holder");

  leftColor = color(255, 102, 140);
  rightColor = color(100, 210, 255);
  resetBall();
}

function draw() {
  // A soft translucent background creates a trail behind the moving ball.
  background(18, 22, 35, 28);

  if (!paused) {
    // The ball continues moving and changing size each frame.
    circleX = circleX + speedX;
    circleY = circleY + speedY;
    size = size + sizeIncrement;
    radius = size / 2;

    // Bounce off the left and right walls, and reverse the growth direction.
    if (circleX >= width - radius || circleX < radius) {
      speedX = speedX * -1;
      sizeIncrement = sizeIncrement * -1;
      leftColor = color(random(80, 255), random(80, 255), random(80, 255));
      rightColor = color(random(80, 255), random(80, 255), random(80, 255));
    }

    // Bounce off the top and bottom walls.
    if (circleY >= height - radius || circleY < radius) {
      speedY = speedY * -1;
    }
  }

  // The color depends on which side of the canvas the ball is on.
  if (circleX > width / 2) {
    ballColor = rightColor;
  } else {
    ballColor = leftColor;
  }

  fill(ballColor);
  noStroke();
  circle(circleX, circleY, size);
}

function mousePressed() {
  // Clicking gives the ball a new direction and a fresh color combination.
  speedX = random(-12, 12);
  speedY = random(-10, 10);
  leftColor = color(random(80, 255), random(80, 255), random(80, 255));
  rightColor = color(random(80, 255), random(80, 255), random(80, 255));
}

function keyPressed() {
  // Pressing space pauses or resumes the motion so the ball can rest.
  if (key === " ") {
    paused = !paused;
    return false;
  }

  // Press r to reset the ball to the center with a new motion.
  if (key === "r" || key === "R") {
    resetBall();
  }

  // Press b or s to make the ball bigger or smaller.
  if (key === "b" || key === "B") {
    size = min(size + 20, 220);
  }

  if (key === "s" || key === "S") {
    size = max(size - 20, 30);
  }
}

function resetBall() {
  circleX = width / 2;
  circleY = height / 2;
  speedX = random(-8, 8);
  speedY = random(-7, 7);
  size = 100;
  sizeIncrement = random(-2, 2);
  radius = size / 2;
}
