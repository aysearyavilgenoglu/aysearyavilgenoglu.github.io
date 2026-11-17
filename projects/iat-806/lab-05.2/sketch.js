let strokes = [];
let cursorBallSize = 18;
const BEND_RADIUS = 100;
const BURST_COLORS = [
  "#ff3b30",
  "#ff7a00",
  "#ffc400",
  "#e83e8c",
  "#8a2be2",
  "#1769ff",
  "#00a878",
];

function setup() {
  const canvas = createCanvas(800, 600);
  canvas.parent("sketch-holder");
  canvas.elt.addEventListener("contextmenu", (event) => event.preventDefault());
  colorMode(RGB);
  noFill();
}

function draw() {
  background(255);

  for (const strokeData of strokes) {
    drawStroke(strokeData);
  }

  noStroke();
  fill("#111827");
  circle(mouseX, mouseY, cursorBallSize + 5);
  fill("#ffffff");
  circle(mouseX, mouseY, cursorBallSize);
  fill("#ef476f");
  circle(mouseX, mouseY, cursorBallSize * 0.42);
}

function drawStroke(strokeData) {
  strokeData.progress = min(1, strokeData.progress + strokeData.speed);
  const visiblePointCount = max(2, floor(18 * strokeData.progress));

  noFill();
  stroke(strokeData.color);
  strokeWeight(lerp(0.35, strokeData.weight, strokeData.progress));
  strokeCap(ROUND);
  strokeJoin(ROUND);

  beginShape();
  for (let i = 0; i <= visiblePointCount; i++) {
    vertex(strokeData.points[i].x, strokeData.points[i].y);
  }
  endShape();
}

function mousePressed() {
  if (!isInsideCanvas()) return false;

  if (mouseButton.left) {
    spreadLines(mouseX, mouseY);
  } else if (mouseButton.right) {
    bendLines(mouseX, mouseY, 0, 0);
  }

  return false;
}

function mouseDragged() {
  if (!isInsideCanvas()) return false;

  if (mouseButton.right) {
    bendLines(mouseX, mouseY, mouseX - pmouseX, mouseY - pmouseY);
  }

  return false;
}

function isInsideCanvas() {
  return mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
}

// I send random ink lines outward from a click and grow them from tiny to full length.
function spreadLines(x, y) {
  const lineCount = 110;
  const maxLength = max(width, height) * 1.15;

  for (let i = 0; i < lineCount; i++) {
    const angle = random(TWO_PI);
    const length = random(maxLength * 0.45, maxLength);
    const curve = random(-45, 45);
    const phase = random(TWO_PI);
    const points = [];

    for (let step = 0; step <= 18; step++) {
      const progress = step / 18;
      const bend =
        sin(progress * PI) * curve +
        sin(progress * TWO_PI + phase) * progress * 9;
      const pointX =
        x + cos(angle) * length * progress - sin(angle) * bend;
      const pointY =
        y + sin(angle) * length * progress + cos(angle) * bend;
      points.push({
        x: constrain(pointX, 0, width),
        y: constrain(pointY, 0, height),
      });
    }

    strokes.push({
      points,
      progress: 0,
      speed: random(0.035, 0.075),
      color: random(BURST_COLORS),
      weight: random(1.2, 3),
    });
  }
}

// I bend existing line points near the mouse, or pull them with a right-button drag.
function bendLines(x, y, dragX, dragY) {
  for (const strokeData of strokes) {
    for (const point of strokeData.points) {
      const distance = dist(x, y, point.x, point.y);
      if (distance >= BEND_RADIUS) continue;

      const influence = (1 - distance / BEND_RADIUS) ** 2;
      if (dragX === 0 && dragY === 0) {
        const direction = point.x < x ? -1 : 1;
        point.x += direction * influence * 16;
        point.y += influence * 10;
      } else {
        point.x += dragX * influence * 1.5;
        point.y += dragY * influence * 1.5;
      }
      point.x = constrain(point.x, 0, width);
      point.y = constrain(point.y, 0, height);
    }
  }
}
