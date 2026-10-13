let frames = [];
let myAge = 10;
let myName = "Alireza";
let myStudentsAges = [];
let numFrames = 8;

let numRows = 8;
let numCols = 8;
let rowheight = 420 / numRows;
let colWidth = 800 / numCols;

async function setup() {
  createCanvas(800, 420);

  for (let i = 0; i < numFrames; i++) {
    let fileName = "dance" + i + ".png";

    frames.push(await loadImage(fileName));
  }
}

function draw() {
  background(120);

  for (let i = 0; i < numCols; i++) {
    for (let j = 0; j < numRows; j++) {
      colors[i] = [];
      for (let j = 0; j < numRows; j++) {
        colors[i][j] = random(1, 255);
      }
      console.log(colors);
      colWidth = width / numCols;
      rowHeight = height / numRows;

      for (let i = 0; i < numFrames; i++) {
        let fileName = "dance_frames/dance" + i + ".png";
        frames.push( await loadImage(fileName));
        
      }
    }
    function draw(){
      
    }

  }
}

animate(frames, 10, 55, 115, 160, 200);
animate(frames, 3, 320, 115, 160, 200);
animate(frames, 4, 585, 115, 160, 200);

function animate(
  imageFrames,
  frameInterval,
  xPosition,
  yPosition,
  imageWidth,
  imageHeight,
) {
  let slowFrame = floor(frameCount / frameInterval);
  let index = slowFrame % imageFrames.length;

  image(imageFrames[index], xPosition, yPosition, imageWidth, imageHeight);
  fill(255);
  text(index, xPosition, yPosition - 10);
}
