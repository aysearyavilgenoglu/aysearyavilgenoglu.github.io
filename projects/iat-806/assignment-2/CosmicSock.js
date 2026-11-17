class CosmicSock {
  constructor(x, y, fallSpeed, tint) {
    this.x = x;
    this.y = y;
    this.fallSpeed = fallSpeed;
    this.tint = tint;
    this.size = random(34, 48);
    this.wiggle = random(TWO_PI);
    this.rotation = random(-0.2, 0.2);
  }

  update() {
    this.y += this.fallSpeed;
    this.wiggle += 0.045;
    this.x += sin(this.wiggle) * 0.65;
  }

  show() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation + sin(this.wiggle) * 0.12);
    scale(this.size / 42);

    noStroke();
    fill(0, 0, 0, 38);
    ellipse(2, 7, 42, 18);

    fill(this.tint);
    rect(-10, -19, 20, 42, 8);
    push();
    translate(5, 13);
    rotate(HALF_PI);
    rect(-9, -17, 18, 30, 8);
    pop();

    fill(255, 255, 255, 170);
    rect(-10, -19, 20, 6, 3);
    fill(46, 34, 76, 130);
    circle(-3, -8, 4);
    circle(5, 1, 3);
    circle(-2, 12, 3);

    fill("#fff1a8");
    circle(0, -28, 4);
    pop();
  }

  touchesBody(bodyMap, canvasWidth, canvasHeight) {
    const column = floor(
      (this.x / canvasWidth) * MASK_COLUMNS,
    );
    const row = floor((this.y / canvasHeight) * MASK_ROWS);

    for (let rowOffset = -2; rowOffset <= 2; rowOffset++) {
      for (let columnOffset = -2; columnOffset <= 2; columnOffset++) {
        const sampleColumn = constrain(column + columnOffset, 0, MASK_COLUMNS - 1);
        const sampleRow = constrain(row + rowOffset, 0, MASK_ROWS - 1);
        if (bodyMap[sampleRow * MASK_COLUMNS + sampleColumn]) return true;
      }
    }

    return false;
  }

  missed(canvasHeight) {
    return this.y - this.size > canvasHeight;
  }
}
