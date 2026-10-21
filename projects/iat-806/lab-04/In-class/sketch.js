const NUM_FRAMES = 8;
const NUM_ROWS = 8;
const NUM_COLS = 8;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const CELL_COLORS = ["#f7d9d0", "#dce9f2", "#e9e2f4", "#e1eddf", "#f5ebc9"];

let frames = [];
let dancers = [];

async function setup() {
  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  canvas.parent("sketch-holder");
  frameRate(12);

  for (let i = 0; i < NUM_FRAMES; i++) {
    frames.push(await loadImage("dance" + i + ".png"));
  }

  for (let row = 0; row < NUM_ROWS; row++) {
    dancers[row] = [];
    for (let col = 0; col < NUM_COLS; col++) {
      dancers[row][col] = {
        color: random(CELL_COLORS),
        speed: floor(random(2, 7)),
        phase: floor(random(NUM_FRAMES)),
        scale: random(0.85, 1.05),
      };
    }
  }
}

function draw() {
  const cellWidth = width / NUM_COLS;
  const cellHeight = height / NUM_ROWS;

  background("#f8f7f4");
  imageMode(CENTER);

  for (let row = 0; row < NUM_ROWS; row++) {
    for (let col = 0; col < NUM_COLS; col++) {
      const x = col * cellWidth;
      const y = row * cellHeight;
      const dancer = dancers[row][col];
      const frameIndex =
        floor((frameCount + dancer.phase) / dancer.speed) % NUM_FRAMES;
      const dancerHeight = cellHeight * 0.88 * dancer.scale;
      const dancerWidth =
        (frames[frameIndex].width / frames[frameIndex].height) * dancerHeight;

      noStroke();
      fill(dancer.color);
      rect(x + 3, y + 3, cellWidth - 6, cellHeight - 6, 8);
      image(
        frames[frameIndex],
        x + cellWidth / 2,
        y + cellHeight / 2,
        dancerWidth,
        dancerHeight,
      );
    }
  }
}
