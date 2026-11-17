class Ball {
  // Store the starting position, colors, radius, and maximum radius.
  constructor(x, y, c, r, maxR = 10) {
    this.x = x;
    this.y = y;
    this.originalColor = c;
    this.color = c;
    this.highlightColor = "red";
    this.r = r;
    this.maxR = maxR;
  }

  // Resize, move, and draw the ball for this frame.
  update(byHowMuch) {
    this.changeSize(byHowMuch);
    this.move(byHowMuch);
    this.show();
  }

  // Set the ball to its active or original color.
  respond(active) {
    if (active) {
      this.highlight();
    } else {
      this.deHighlight();
    }
  }

  // Return whether a point is inside the ball.
  contains(pointX, pointY) {
    const distance = dist(this.x, this.y, pointX, pointY);
    return distance < this.r;
  }

  // Turn the ball's highlight color on.
  highlight() {
    this.color = this.highlightColor;
  }

  // Restore the ball's starting color.
  deHighlight() {
    this.color = this.originalColor;
  }

  // Check the mask pixel under the ball for a person.
  isOnBody(mask) {
    const pixel = mask.get(floor(this.x), floor(this.y));
    return pixel[3] < 128;
  }

  // Jitter the ball in a random direction.
  move(byHowMuch) {
    this.x += random(-byHowMuch, byHowMuch);
    this.y += random(-byHowMuch, byHowMuch);
  }

  // Randomly change the ball's radius within its size limits.
  changeSize(byHowMuch) {
    this.r = constrain(
      this.r + random(-byHowMuch, byHowMuch),
      2,
      this.maxR,
    );
  }

  // Draw the ball with a soft colored halo.
  show() {
    noStroke();
    fill(red(this.color), green(this.color), blue(this.color), 24);
    circle(this.x, this.y, this.r * 4);
    fill(this.color);
    circle(this.x, this.y, this.r * 2);
    fill(255, 255, 255, 130);
    circle(this.x - this.r * 0.28, this.y - this.r * 0.32, this.r * 0.42);
  }
}

// Create a ball with a random position and a bright color.
function createRandomBall() {
  const ballX = random(0, width);
  const ballY = random(0, height);
  const ballColor = color(20, 130, 140 + random(-100, 100), 190);
  const ballRadius = 10;

  return new Ball(ballX, ballY, ballColor, ballRadius);
}
