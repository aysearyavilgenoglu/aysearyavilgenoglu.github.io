const NUM_FRAMES = 8;
const NUM_JUMP_FRAMES = 4;
const NUM_ROWS = 8;
const NUM_COLS = 8;
const FLOOR_COLORS = ["#f7d9d0", "#dce9f2", "#e9e2f4", "#e1eddf", "#f5ebc9"];

let frames = [];
let frames2 = [];
let colors = [];
let speeds = [];
let colWidth;
let rowHeight;

async function setup() {
  const canvas = createCanvas(800, 600);
  canvas.parent("sketch-holder");
  // I center every pose so the dancer stays inside its floor cell.
  imageMode(CENTER);
  frameRate(12);

  // I give every floor cell its own background color and starting speed.
  for (let i = 0; i < NUM_COLS; i++) {
    colors[i] = [];
    speeds[i] = [];
    for (let j = 0; j < NUM_ROWS; j++) {
      colors[i][j] = random(FLOOR_COLORS);
      speeds[i][j] = random(3, 8);
    }
  }

  colWidth = width / NUM_COLS;
  rowHeight = height / NUM_ROWS;

  for (let i = 0; i < NUM_FRAMES; i++) {
    frames.push(await loadImage("dance_frames/dance" + i + ".png"));
  }

  // I load the four jump poses so the floor can use a second animation.
  for (let i = 0; i < NUM_JUMP_FRAMES; i++) {
    frames2.push(await loadImage("jump_frames/jump" + i + ".png"));
  }
}

function draw() {
  background("#f8f7f4");
  const maxDist = dist(0, 0, width, height);

  for (let i = 0; i < NUM_COLS; i++) {
    for (let j = 0; j < NUM_ROWS; j++) {
      const x = i * colWidth;
      const y = j * rowHeight;
      const centerX = x + colWidth / 2;
      const centerY = y + rowHeight / 2;

      // I make each dancer speed up near the mouse and slow down farther away.
      const distance = dist(centerX, centerY, mouseX, mouseY);
      const distanceScale = constrain(map(distance, 0, maxDist, 0.5, 3), 0.5, 3);
      const speed = max(1, speeds[i][j] * distanceScale);

      noStroke();
      fill(colors[i][j]);
      rect(x + 3, y + 3, colWidth - 6, rowHeight - 6, 8);

      // I alternate the dance and jump animations like squares on a checkerboard.
      const danceFrames = (i + j) % 2 === 0 ? frames : frames2;
      animate(danceFrames, speed, x, y, colWidth, rowHeight);
    }
  }
}

function animate(danceFrames, speed, xPosition, yPosition, cellWidth, cellHeight) {
  const index = getFrameIndex(danceFrames, speed);
  const currentFrame = danceFrames[index];
  const scale = min(
    (cellWidth * 0.82) / currentFrame.width,
    (cellHeight * 0.88) / currentFrame.height,
  );

  image(
    currentFrame,
    xPosition + cellWidth / 2,
    yPosition + cellHeight / 2,
    currentFrame.width * scale,
    currentFrame.height * scale,
  );
}

// I use the chosen animation's own length so the shorter jump sequence loops safely.
function getFrameIndex(danceFrames, speed) {
  const slowFrame = floor(frameCount / speed);
  return slowFrame % danceFrames.length;
}
