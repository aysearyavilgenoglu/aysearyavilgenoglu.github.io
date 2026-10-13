let shapes = [];

function setup() {
  createCanvas(600, 600);

  // create a grid of random black/white abstract shapes
  for (let x = 50; x < width; x += 80) {
    for (let y = 50; y < height; y += 80) {
      let type = floor(random(3)); // 0 = circle, 1 = rect, 2 = triangle
      let size = random(30, 60);
      let isWhite = random() > 0.5;
      shapes.push({ x, y, type, size, isWhite });
    }
  }
}

function draw() {
  background(0);

  for (let s of shapes) {
    let d = dist(mouseX, mouseY, s.x, s.y);
    let hovering = d < s.size;

    if (hovering) {
      fill(220, 30, 30); // red when the mouse is over it
    } else if (s.isWhite) {
      fill(255);
    } else {
      fill(0);
      stroke(255);
      strokeWeight(2);
    }

    if (!hovering && s.isWhite) noStroke();
    if (hovering) noStroke();

    if (s.type === 0) {
      circle(s.x, s.y, s.size);
    } else if (s.type === 1) {
      rectMode(CENTER);
      rect(s.x, s.y, s.size, s.size);
    } else {
      triangle(
        s.x,
        s.y - s.size / 2,
        s.x - s.size / 2,
        s.y + s.size / 2,
        s.x + s.size / 2,
        s.y + s.size / 2,
      );
    }
  }
}
