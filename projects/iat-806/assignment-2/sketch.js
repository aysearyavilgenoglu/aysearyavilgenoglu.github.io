const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 360;
const CAMERA_WIDTH = 320;
const CAMERA_HEIGHT = 240;
const MASK_COLUMNS = 60;
const MASK_ROWS = 45;
const GAME_DURATION = 45;
const TARGET_SCORE = 12;
const MAX_MISSES = 3;
const MAX_SOCKS = 8;
const SPAWN_INTERVAL = 900;

let socks = [];
let video;
let bodySegmentation;
let segmentationResult = null;
let bodyMap = new Uint8Array(MASK_COLUMNS * MASK_ROWS);
let silhouetteLayer;
let gameState = "start";
let score = 0;
let misses = 0;
let startedAt = 0;
let lastSpawnAt = 0;
let gameWon = false;
let modelReady = false;
let cameraReady = false;

function setup() {
  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  canvas.parent("sketch-holder");
  pixelDensity(1);
  frameRate(30);
  silhouetteLayer = createGraphics(MASK_COLUMNS, MASK_ROWS);
  silhouetteLayer.pixelDensity(1);

  const startButton = document.querySelector("#start-game");
  startButton.addEventListener("click", startGame);

  video = createCapture(VIDEO);
  video.size(CAMERA_WIDTH, CAMERA_HEIGHT);
  video.hide();
  video.elt.addEventListener("loadeddata", () => {
    cameraReady = true;
    updateReadyState();
  });
  video.elt.addEventListener("error", () => {
    setCameraStatus("Camera video failed to start. Check camera permission and reload the page.");
  });
  window.setTimeout(() => {
    if (!cameraReady) {
      setCameraStatus(
        "Camera is not available yet. Allow permission and close other apps or tabs using it.",
      );
    }
  }, 12000);

  setCameraStatus("Allow camera access. The game will appear while the body model loads.");
  loadBodyModel();
}

async function loadBodyModel() {
  try {
    bodySegmentation = await ml5.bodySegmentation("BodyPix", {
      maskType: "person",
    });
    bodySegmentation.detectStart(video, gotResults);
    modelReady = true;
    updateReadyState();
  } catch (error) {
    setCameraStatus(
      `Could not start the body model: ${error.message}. Check camera permission and reload the page.`,
    );
    console.error("Could not initialize the body game:", error);
  }
}

function draw() {
  drawCameraBackground();

  if (gameState === "start") {
    drawStartScreen();
  } else if (gameState === "playing") {
    updateGame();
    drawGame();
  } else if (gameState === "gameOver") {
    drawGame();
    drawEndScreen();
  }
}

function drawCameraBackground() {
  background("#17172a");
  drawStars();
  image(silhouetteLayer, 0, 0, width, height);

  noFill();
  stroke(230, 215, 255, 45);
  strokeWeight(2);
  rect(1, 1, width - 2, height - 2, 12);
}

function drawStars() {
  noStroke();
  for (let i = 0; i < 80; i++) {
    const x = (i * 127 + 37) % width;
    const y = (i * 233 + 21) % height;
    const twinkle = 75 + 65 * sin(frameCount * 0.035 + i);
    fill(255, 255, 255, twinkle);
    circle(x, y, i % 7 === 0 ? 3 : 2);
  }
}

function drawStartScreen() {
  drawHud();
  fill(16, 17, 34, 205);
  noStroke();
  rect(width * 0.12, height * 0.34, width * 0.76, height * 0.38, 18);
  textAlign(CENTER, CENTER);
  fill("#d5ff6e");
  textSize(38);
  text("COSMIC LAUNDRY", width / 2, height / 2 - 48);
  fill("#f5f3ee");
  textSize(17);
  text("Catch 12 socks with your silhouette.", width / 2, height / 2);
  fill("#c5c3d3");
  textSize(14);
  text("Move your whole body. Miss 3 and the laundry escapes!", width / 2, height / 2 + 30);
}

function startGame() {
  if (!modelReady || !cameraReady) {
    setCameraStatus("Wait for the camera and body model to finish loading.");
    return;
  }

  socks = [];
  score = 0;
  misses = 0;
  gameWon = false;
  gameState = "playing";
  startedAt = millis();
  lastSpawnAt = startedAt;

  for (let i = 0; i < 4; i++) {
    socks.push(createSock(random(width * 0.12, width * 0.88), random(-height, -40)));
  }

  document.querySelector("#start-game").textContent = "Playing…";
  document.querySelector("#start-game").disabled = true;
  setCameraStatus("Move your silhouette to catch the falling cosmic socks!");
}

function updateReadyState() {
  const startButton = document.querySelector("#start-game");
  if (cameraReady && modelReady) {
    startButton.disabled = false;
    startButton.textContent = "Start catching!";
    setCameraStatus("Camera and body model ready. Get ready to dance.");
  } else if (cameraReady) {
    setCameraStatus("Camera is live. Loading the body model…");
  } else if (modelReady) {
    setCameraStatus("Body model ready. Waiting for camera permission…");
  }
}

function updateGame() {
  const timeLeft = max(0, GAME_DURATION - floor((millis() - startedAt) / 1000));

  if (score >= TARGET_SCORE) {
    endGame(true);
    return;
  }
  if (misses >= MAX_MISSES || timeLeft <= 0) {
    endGame(false);
    return;
  }

  if (millis() - lastSpawnAt >= SPAWN_INTERVAL && socks.length < MAX_SOCKS) {
    socks.push(createSock(random(width * 0.1, width * 0.9), -40));
    lastSpawnAt = millis();
  }

  for (let i = socks.length - 1; i >= 0; i--) {
    const sock = socks[i];
    sock.update();

    if (segmentationResult && sock.touchesBody(bodyMap, width, height)) {
      socks.splice(i, 1);
      score++;
    } else if (sock.missed(height)) {
      socks.splice(i, 1);
      misses++;
    }
  }
}

function drawGame() {
  for (const sock of socks) {
    sock.show();
  }
  drawHud();

  if (!segmentationResult) {
    noStroke();
    fill(10, 11, 24, 190);
    rect(0, height - 46, width, 46);
    fill("#fff1a8");
    textAlign(CENTER, CENTER);
    textSize(14);
    text("Finding your silhouette…", width / 2, height - 23);
  }
}

function drawHud() {
  const timeLeft =
    gameState === "playing"
      ? max(0, GAME_DURATION - floor((millis() - startedAt) / 1000))
      : GAME_DURATION;

  noStroke();
  fill(20, 19, 39, 210);
  rect(0, 0, width, 54);

  textAlign(LEFT, CENTER);
  fill("#d5ff6e");
  textSize(18);
  text(`SOCKS  ${score}/${TARGET_SCORE}`, 20, 27);

  textAlign(CENTER, CENTER);
  fill("#f5f3ee");
  text(`TIME  ${timeLeft}s`, width / 2, 27);

  textAlign(RIGHT, CENTER);
  fill(misses >= MAX_MISSES - 1 ? "#ff8aa2" : "#c9a7ff");
  text(`ESCAPED  ${misses}/${MAX_MISSES}`, width - 20, 27);
}

function endGame(won) {
  gameWon = won;
  gameState = "gameOver";
  const startButton = document.querySelector("#start-game");
  startButton.disabled = false;
  startButton.textContent = won ? "Play again" : "Try again";
  setCameraStatus(
    won
      ? "You saved the cosmic laundry!"
      : "The socks escaped this time. Try again!",
  );
}

function drawEndScreen() {
  fill(16, 17, 34, 205);
  noStroke();
  rect(0, 0, width, height);
  textAlign(CENTER, CENTER);
  fill(gameWon ? "#d5ff6e" : "#ff8aa2");
  textSize(42);
  text(gameWon ? "LAUNDRY SAVED!" : "SOCKS IN SPACE!", width / 2, height / 2 - 28);
  fill("#f5f3ee");
  textSize(18);
  text(`You caught ${score} cosmic socks.`, width / 2, height / 2 + 20);
}

function createSock(x, y) {
  const sockColors = ["#ff88bd", "#9d8aff", "#63e6d2", "#ffc857", "#8bd5ff"];
  const tint = color(random(sockColors));
  const speed = random(1.7, 2.8) + score * 0.07;
  return new CosmicSock(x, y, speed, tint);
}

function gotResults(result) {
  if (result && result.mask) {
    segmentationResult = result;
    updateBodyMask(result.mask);
  }
}

function updateBodyMask(mask) {
  mask.loadPixels();
  if (!mask.pixels || mask.pixels.length === 0) {
    setCameraStatus("The body model returned an empty mask. Reload the page to try again.");
    return;
  }

  const pixelDensity = Math.sqrt(
    mask.pixels.length / (mask.width * mask.height * 4),
  );
  const pixelWidth = mask.width * pixelDensity;
  bodyMap.fill(0);
  silhouetteLayer.clear();
  silhouetteLayer.loadPixels();

  for (let row = 0; row < MASK_ROWS; row++) {
    const maskY = constrain(
      floor(((row + 0.5) / MASK_ROWS) * mask.height),
      0,
      mask.height - 1,
    );
    const pixelY = floor(maskY * pixelDensity);

    for (let column = 0; column < MASK_COLUMNS; column++) {
      const screenX = floor(((column + 0.5) / MASK_COLUMNS) * mask.width);
      const maskX = mask.width - 1 - screenX;
      const pixelX = floor(maskX * pixelDensity);
      const alphaIndex = 4 * (pixelY * pixelWidth + pixelX) + 3;
      const alpha = mask.pixels[alphaIndex];

      if (alpha >= 128) continue;

      bodyMap[row * MASK_COLUMNS + column] = 1;
      const outputIndex = 4 * (row * MASK_COLUMNS + column);
      silhouetteLayer.pixels[outputIndex] = 123;
      silhouetteLayer.pixels[outputIndex + 1] = 245;
      silhouetteLayer.pixels[outputIndex + 2] = 220;
      silhouetteLayer.pixels[outputIndex + 3] = 220 - alpha;
    }
  }
  silhouetteLayer.updatePixels();
}

function setCameraStatus(message) {
  const status = document.querySelector("#camera-status");
  if (status) {
    status.textContent = message;
  }
}
