let balls = [];
let video;
let bodySegmentation;
let segmentationResult = null;
let segmentationOptions = {
  maskType: "person",
};

const ballCount = 110;
const connectionDistance = 92;
const jitterAmount = 0.8;

// Create the balls and webcam, then load the model before starting detection.
async function setup() {
  const canvas = createCanvas(900, 560);
  canvas.parent("sketch-holder");
  pixelDensity(1);

  for (let i = 0; i < ballCount; i++) {
    balls.push(createRandomBall());
  }

  setCameraStatus("Allow camera access to activate the body interaction.");
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  bodySegmentation = await ml5.bodySegmentation(
    "BodyPix",
    segmentationOptions,
  );
  bodySegmentation.detectStart(video, gotResults);
  setCameraStatus("Camera ready — move behind the glowing balls.");
}

// Draw a dark glowing background, nearby connections, and every ball.
function draw() {
  background(8, 11, 24);

  noStroke();
  fill(54, 74, 145, 18);
  circle(width * 0.5, height * 0.48, height * 1.25);

  drawConnections();

  for (const ball of balls) {
    const onBody =
      segmentationResult && ball.isOnBody(segmentationResult.mask);
    ball.update(jitterAmount, Boolean(ball.clicked || onBody));
  }

  if (segmentationResult) {
    for (const ball of balls) {
      const onBody = ball.isOnBody(segmentationResult.mask);
      ball.respond(onBody || ball.contains(mouseX, mouseY));
    }
  }
}

// Connect nearby balls with faint lines to form shifting constellations.
function drawConnections() {
  strokeWeight(1);

  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const first = balls[i];
      const second = balls[j];
      const distance = dist(first.x, first.y, second.x, second.y);

      if (distance < connectionDistance) {
        stroke(117, 170, 255, map(distance, 0, connectionDistance, 65, 0));
        line(first.x, first.y, second.x, second.y);
      }
    }

  }
}

// Keep clicked balls active until the next click while preserving body response.
function mousePressed() {
  for (const ball of balls) {
    ball.clicked = ball.contains(mouseX, mouseY);
  }
}

// Save the newest segmentation output for draw() to use.
function gotResults(result) {
  if (result) {
    segmentationResult = result;
  }
}

// Show camera and model status beside the sketch.
function setCameraStatus(message) {
  const status = document.querySelector("#camera-status");
  if (status) {
    status.textContent = message;
  }
}
