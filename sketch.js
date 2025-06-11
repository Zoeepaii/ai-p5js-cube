
// ✅ 優化版本：針對手機與電腦分別調整效能與排版，並微調手機排版距離
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

  pixelDensity(window.devicePixelRatio || 1);

  numSeeds = isMobile ? 20 : 100;
  numParticles = isMobile ? 100 : 800;

  cubeSize = min(windowWidth, windowHeight) * 0.5;
  angleMode(RADIANS);
  noStroke();

  infoLayer = createGraphics(windowWidth, windowHeight);
  infoLayer.pixelDensity(2);
  infoLayer.pixelDensity(window.devicePixelRatio || 1);
  infoLayer.pixelDensity(window.devicePixelRatio || 1);
  drawInfoText();

  for (let i = 0; i < numSeeds; i++) {
    let pos = createVector(
      random(-cubeSize / 2, cubeSize / 2),
      random(-cubeSize / 2, cubeSize / 2),
      random(-cubeSize / 2, cubeSize / 2)
    );
    let vel = p5.Vector.random3D().mult(0.5);
    let cubeSizeLocal = isMobile ? random(8, 25) : random(5, 20);
    let gray = random(50, 230);
    cubes.push({ pos, vel, cubeSizeLocal, gray });
  }

  for (let i = 0; i < numParticles; i++) {
    let pos = createVector(
      random(-cubeSize / 2, cubeSize / 2),
      random(-cubeSize / 2, cubeSize / 2),
      random(-cubeSize / 2, cubeSize / 2)
    );
    let vel = createVector(0, 0, 0);
    particles.push({ pos, vel });
  }
}

function draw() {
  background(255, 250, 240);
  lights();

  let cubeOffsetX = isMobile ? 0 : 200;
  let cubeOffsetY = isMobile ? 0 : 0; // 手機畫面正中央

  let cx = width / 2 + cubeOffsetX;
  let cy = height / 2 + cubeOffsetY;

  let inputX = mouseX;
  let inputY = mouseY;
  if (touches.length > 0) {
    inputX = touches[0].x;
    inputY = touches[0].y;
  }

  let dToCenter = dist(inputX, inputY, cx, cy);
  if (dToCenter < 300) {
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

    let screen = worldToScreen(c.pos, cubeOffsetX, cubeOffsetY);
    let d = dist(inputX, inputY, screen.x, screen.y);
    if (d < 20 && dToCenter < 300) {
      let dir = p5.Vector.sub(c.pos, createVector(0, 0, 0)).normalize();
      c.vel = dir.mult(random(4, 6));
    }

    push();
    translate(c.pos.x, c.pos.y, c.pos.z);
    fill(c.gray);
    noStroke();
    box(c.cubeSizeLocal);
    pop();
  }

  for (let p of particles) {
    let n = noise(p.pos.x * 0.01, p.pos.y * 0.01, p.pos.z * 0.01, frameCount * 0.01);
    let flow = createVector(
      sin(n * TWO_PI),
      cos(n * TWO_PI),
      sin(n * TWO_PI * 0.5)
    ).normalize().mult(1);

    p.vel = flow;
    p.pos.add(p.vel);

    for (let axis of ['x', 'y', 'z']) {
      if (abs(p.pos[axis]) > cubeSize / 2) {
        p.pos[axis] *= -1;
      }
    }

    push();
    translate(p.pos.x, p.pos.y, p.pos.z);
    fill(100, isMobile ? 10 : 50);
    if (isMobile) { ellipse(0, 0, 2, 2); } else { box(1.5); }
    pop();
  }

  resetMatrix();
  image(infoLayer, -width / 2, -height / 2);
}

function worldToScreen(pos, offsetX, offsetY) {
  let screenX = width / 2 + offsetX + pos.x * (width / cubeSize);
  let screenY = height / 2 + offsetY - pos.y * (height / cubeSize);
  return createVector(screenX, screenY);
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
  pixelDensity(window.devicePixelRatio || 1);
  cubeSize = min(windowWidth, windowHeight) * 0.5;
  infoLayer = createGraphics(windowWidth, windowHeight);
  infoLayer.pixelDensity(2);
  infoLayer.pixelDensity(window.devicePixelRatio || 1);
  infoLayer.pixelDensity(window.devicePixelRatio || 1);
  drawInfoText();
}
