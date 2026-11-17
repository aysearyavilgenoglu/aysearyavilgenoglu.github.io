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
    beginShape();
    vertex(-10, -19);
    vertex(10, -19);
    vertex(10, 4);
    bezierVertex(10, 11, 16, 13, 23, 16);
    bezierVertex(31, 20, 27, 29, 19, 29);
    vertex(-8, 29);
    bezierVertex(-19, 29, -21, 21, -13, 15);
    vertex(-8, 10);
    vertex(-10, 4);
    endShape(CLOSE);

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

  touchesBody(mask, canvasWidth, canvasHeight) {
    const maskX = constrain(
      floor(((canvasWidth - this.x) / canvasWidth) * mask.width),
      0,
      mask.width - 1,
    );
    const maskY = constrain(
      floor((this.y / canvasHeight) * mask.height),
      0,
      mask.height - 1,
    );
    return mask.get(maskX, maskY)[3] < 128;
  }

  missed(canvasHeight) {
    return this.y - this.size > canvasHeight;
  }
}
