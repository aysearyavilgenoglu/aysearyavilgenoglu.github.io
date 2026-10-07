let frames = [];
let laughSound;
const NUM_FRAMES = 8;

const assetsUrl = new URL("assets/img/", document.currentScript.src);
let currentFrame = 0;
let animationPlaying = false;
let backgroundColor;

async function setup() {
  createCanvas(800, 600).parent("sketch-holder");
  imageMode(CENTER);
  frameRate(8);
  backgroundColor = color(255, 240, 245);

  for (let i = 0; i < NUM_FRAMES; i++) {
    frames.push(await loadImage(new URL(`laughframes/laugh${i}.png`, assetsUrl).href));
  }
  laughSound = await loadSound(new URL("sounds/sound.mp3", assetsUrl).href);
}

function draw() {
  if (animationPlaying) {
    currentFrame++;
    if (currentFrame >= frames.length) {
      currentFrame = 0;
      animationPlaying = false;
    }
  }

  background(backgroundColor);
  image(frames[currentFrame], width / 2, height / 2, 450, 450);
}

function mousePressed() {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return;

  userStartAudio();
  if (laughSound.isPlaying()) laughSound.stop();
  laughSound.play();
  currentFrame = -1;
  animationPlaying = true;
  backgroundColor = color(random(180, 256), random(180, 256), random(180, 256));
}
