let balls = [];
let bodySegmentation;
let numBalls = 500;
let video;
let options = {
  maskType: "person",
};

function setup() {
  const canvas = createCanvas(600, 600);

  // Create the video and hide it

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
}
  bodySegmentation = await ml5. bodySegmentation ("BodyPix", options);
  bodySegmentation.detectStart(video, gotResults);

  []


  for (let i = 0; i < numBalls; i++) {
    let ball = createRandomBall();
    balls.push(ball);
  }
}

function draw() {
  background(120);

  if (segmentation) {
    image(segmentation.mask, backgroundImage, 0, 0, width, height);
  }

  for (let ball of balls) {
    ball.update(2);
    let active = ball.isOnBody(segmentation.mask);
    let active = ball.isOnBody(segmentation.mask);
    ball.respond(active);

    ball.update(byHowMuch);
  }
}

function mousePressed() {
  balls.forEach((ball) => {
    let active = ball.contains(mouseX, mouseY);
    ball.respond(active);
  });
}
function gotResults(result) {}
