
// ✅ 手機優化版：改善文字清晰度、減少卡頓
let cubes = [];
let particles = [];
let numSeeds;
let numParticles;
let cubeSize;
let infoLayer;

let rotationX = 0;
let rotationY = 0;
let autoRotX = 0.003;
let autoRotY = 0.004;
let isMobile = false;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  isMobile = windowWidth < 768;

  // ✅ 主畫面為了手機流暢設定較低 pixelDensity，但 infoLayer 另設高畫質
  pixelDensity(isMobile ? 1 : pixelDensity());

  numSeeds = isMobile ? 30 : 100;
  numParticles = isMobile ? 60 : 800;

  cubeSize = min(windowWidth, windowHeight) * 0.5;
  angleMode(RADIANS);
  noStroke();

  infoLayer = createGraphics(windowWidth, windowHeight);
  infoLayer.pixelDensity(isMobile ? 2 : pixelDensity()); // ✅ 提高手機上文字畫質
  drawInfoText();

  for (let i = 0; i < numSeeds; i++) {
    let pos = createVector(
      random(-cubeSize / 2, cubeSize / 2),
      random(-cubeSize / 2, cubeSize / 2),
      random(-cubeSize / 2, cubeSize / 2)
    );
    let vel = p5.Vector.random3D().mult(0.5);
    let cubeSizeLocal = random(5, 20);
    let gray = random(50, 230);
    cubes.push({ pos, vel, cubeSizeLocal, gray });
  }

  for (let i = 0; i < numParticles; i++) {
    let pos = createVector(
      random(-cubeSize / 2, cubeSize / 2),
      random(-cubeSize / 2, cubeSize / 2),
      random(-cubeSize / 2, cubeSize / 2)
    );
    let vel = p5.Vector.random3D().mult(2); // ✅ 移動速度加快
    particles.push({ pos, vel });
  }
}

function draw() {
  background(255, 250, 240);
  lights();

  let cubeOffsetX = isMobile ? 0 : 200;
  let cubeOffsetY = isMobile ? 0 : 0;

  let cx = width / 2 + cubeOffsetX;
  let cy = height / 2 + cubeOffsetY;

  let inputX = mouseX;
  let inputY = mouseY;
  if (touches.length > 0) {
    inputX = touches[0].x;
    inputY = touches[0].y;
  }

  let dToCenter = dist(inputX, inputY, cx, cy);
  if (dToCenter < 500) {
    let targetRotX = map(inputY, 0, height, -PI / 2, PI / 2);
    let targetRotY = map(inputX, 0, width, -PI / 2, PI / 2);
    rotationX = lerp(rotationX, targetRotX, 0.05);
    rotationY = lerp(rotationY, targetRotY, 0.05);
  } else {
    rotationX += autoRotX;
    rotationY += autoRotY;
  }

  translate(cubeOffsetX, cubeOffsetY, 0);
  rotateX(rotationX);
  rotateY(rotationY);

  push();
  noFill();
  stroke(100);
  strokeWeight(1);
  box(cubeSize);
  pop();

  for (let i = 0; i < cubes.length; i++) {
    let c = cubes[i];
    c.pos.add(c.vel);

    for (let axis of ['x', 'y', 'z']) {
      if (abs(c.pos[axis]) + c.cubeSizeLocal / 2 > cubeSize / 2) {
        c.vel[axis] *= -1;
        c.pos[axis] = constrain(c.pos[axis], -cubeSize / 2 + c.cubeSizeLocal / 2, cubeSize / 2 - c.cubeSizeLocal / 2);
      }
    }

    for (let j = i + 1; j < cubes.length; j++) {
      let c2 = cubes[j];
      let distVec = p5.Vector.sub(c.pos, c2.pos);
      let minDist = (c.cubeSizeLocal + c2.cubeSizeLocal) / 2;
      if (distVec.mag() < minDist) {
        let adjustVec = distVec.copy().normalize().mult(0.5);
        c.pos.add(adjustVec);
        c2.pos.sub(adjustVec);
      }
    }

    push();
    translate(c.pos.x, c.pos.y, c.pos.z);
    fill(c.gray);
    noStroke();
    box(c.cubeSizeLocal);
    pop();
  }

  for (let p of particles) {
    p.pos.add(p.vel);

    for (let axis of ['x', 'y', 'z']) {
      if (abs(p.pos[axis]) > cubeSize / 2) {
        p.pos[axis] *= -1;
      }
    }

    push();
    translate(p.pos.x, p.pos.y, p.pos.z);
    fill(80, 100);
    sphere(3); // 明顯些
    pop();
  }

  resetMatrix();
  image(infoLayer, -width / 2, -height / 2);
}

function drawInfoText() {
  infoLayer.clear();
  infoLayer.textFont("sans-serif");
  infoLayer.textAlign(isMobile ? CENTER : LEFT);
  infoLayer.fill(30);

  const scaleFactor = isMobile ? 0.7 : 1;
  const line1Size = 24 * scaleFactor;
  const line2Size = 16 * scaleFactor;
  const lineHeight = 30 * scaleFactor;

  const lines = [
    { text: "演算美學：AI × P5.js 的動態創作實驗室", size: line1Size },
    { text: "講師 | 白顏慈　主辦單位 | 師大附中資訊室", size: line2Size },
    { text: "時間 | 6/17-18 每晚19:00-21:00 線上課程", size: line2Size }
  ];

  let totalHeight = lines.length * lineHeight;
  let textX = isMobile ? infoLayer.width / 2 : infoLayer.width / 2 - cubeSize / 2 - 250;
  let startY = isMobile
    ? infoLayer.height / 2 + cubeSize / 2 + 50
    : infoLayer.height / 2 - totalHeight / 2;

  for (let i = 0; i < lines.length; i++) {
    infoLayer.textSize(lines[i].size);
    infoLayer.text(lines[i].text, textX, startY + i * lineHeight);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  isMobile = windowWidth < 768;
  pixelDensity(isMobile ? 1 : pixelDensity());
  cubeSize = min(windowWidth, windowHeight) * 0.5;
  infoLayer = createGraphics(windowWidth, windowHeight);
  infoLayer.pixelDensity(isMobile ? 2 : pixelDensity());
  drawInfoText();
}
