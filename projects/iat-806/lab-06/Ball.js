class Ball {
  constructor(x, y, c, r, maxR = 10) {
    // Remember the ball's position, original color, active color, and size.
    this.x = x;
    this.y = y;
    this.originalColor = c;
    this.color = c;
    this.highlightColor = "#ff5ca8";
    this.clicked = false;
    this.r = r;
    this.maxR = maxR;
  }

  // Change the ball's size, move it, and draw it for this frame.
  update(byHowMuch, active = false) {
    this.changeSize(byHowMuch);
    this.move(byHowMuch);
    this.respond(active);
    this.show();
  }

  // Choose the active color or restore the original color.
  respond(active) {
    if (active) {
      this.highlight();
    } else {
      this.deHighlight();
    }
  }

  // Check whether a point is within the ball's circular edge.
  contains(pointX, pointY) {
    const distance = dist(this.x, this.y, pointX, pointY);
    return distance < this.r;
  }

  // Turn this ball on with its highlight color.
  highlight() {
    this.color = this.highlightColor;
  }

  // Return this ball to the color it started with.
  deHighlight() {
    this.color = this.originalColor;
  }

  // Check the mask pixel under the ball to see if it belongs to a person.
  isOnBody(mask) {
    const maskX = constrain(
      floor((this.x / width) * mask.width),
      0,
      mask.width - 1,
    );
    const maskY = constrain(
      floor((this.y / height) * mask.height),
      0,
      mask.height - 1,
    );
    const pixel = mask.get(maskX, maskY);
    // With maskType "person", pixels on the person have transparent alpha.
    return pixel[3] < 128;
  }

  // Jitter in a random direction without letting the ball leave the canvas.
  move(byHowMuch) {
    this.x = constrain(
      this.x + random(-byHowMuch, byHowMuch),
      this.r,
      width - this.r,
    );
    this.y = constrain(
      this.y + random(-byHowMuch, byHowMuch),
      this.r,
      height - this.r,
    );
  }

  // Make a small random size change while keeping the ball within its limit.
  changeSize(byHowMuch) {
    this.r = constrain(
      this.r + random(-byHowMuch, byHowMuch),
      2,
      this.maxR,
    );
  }

  // Draw a glowing halo, colored ball, and small reflective spot.
  show() {
    noStroke();
    fill(red(this.color), green(this.color), blue(this.color), 24);
    circle(this.x, this.y, this.r * 4);
    fill(this.color);
    circle(this.x, this.y, this.r * 2);
    fill(255, 255, 255, 120);
    circle(this.x - this.r * 0.28, this.y - this.r * 0.32, this.r * 0.45);
  }
}

// Make a ball at a random position with a randomly selected bright color.
function createRandomBall() {
  const palette = ["#54e6ff", "#9d8aff", "#ff8acb", "#ffd166", "#7df7b5"];
  const ballX = random(0, width);
  const ballY = random(0, height);
  const ballColor = color(random(palette));
  const ballRadius = 10;

  return new Ball(ballX, ballY, ballColor, ballRadius);
}
