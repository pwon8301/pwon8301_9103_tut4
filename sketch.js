let IsmapGenerate = 0;
let IsTreeGenerate = 0;
let IsPacManGenerate = 0;
let IsGhosGenerate = 0;
let Size = 1;
// storage the coordinate of each road
let ArrRoadX = []
let ArrRoadY = []
let RoadWidth = 20;
// storage the roadmark type of each road
let ArrRoadMarkTypeX = []
let ArrRoadMarkTypeY = []
let CanvasSize = 600;
let NumOfHorizontalRoad = 6
let NumOfVerticalRoad = 8
let ArrTreeX = [];
let ArrTreeY = [];
let ArrTreeXSize = [];
let ArrTreeYSize = [];
let PacmanYpos = 0;
let PacmanXpos = 0;
let GhostXpos = 0;
let GhostYpos = 0;

let track;
let hangOn;
let position;
let velocity;
let acceleration;
let eyeWidth = 40
let eyeHeight = 40
let prCentroid = 50

function preload() {
  track = loadSound('audio/sample-visualisation.mp3');
}

function setup() {
  background(220);
  blueColour = color(125, 237, 255)
  redColour = color(255, 0, 0)
  fft = new p5.FFT(0.8, 512);
  track.connect(fft);
  runTime = track.duration();

  //starting position of creeperface
  let xPos = 1  
  let yPos = height / 2

  position = createVector(xPos, yPos);
  velocity = createVector();
  acceleration = createVector();
}

function draw() {
  if (getAudioContext().state !== 'running' || hangOn == "1") {
    background(255, 0, 0); //red 
    textAlign(CENTER);
    text('t a p  t o  p l a y', width / 2, 30);
    return;
  }

  createCanvas(CanvasSize, CanvasSize);
  colorMode(RGB);
  background(255, 255, 20);

  let spectrum = fft.analyze();

  //track average energy between 20Hz and 20kHz 
  trackAmp = fft.getEnergy(20, 20000)

  //vary creeperface colour by average energy
  let varAmp = map(trackAmp, 0, 255, 0, 1)
  let c = lerpColor(blueColour, redColour, varAmp)

  //vary pupil size by average energy
  let varPupil = map(trackAmp, 0, 255, 0.2, 0.85)
  
  let xTime = map(track.currentTime(), 0, runTime, 0, CanvasSize - (3 * (eyeWidth * Size)))

  console.log("Track length: " + runTime)
  console.log("Track time: " + track.currentTime())
  console.log("xTime: " + xTime)
  console.log("canvas size: " + CanvasSize)

  // Extract the spectral centroid

  let nyquist = 22050;

  // get the centroid
  spectralCentroid = fft.getCentroid();

  // The mean_freq_index calculation is for the display.
  let mean_freq_index = spectralCentroid / (nyquist / spectrum.length);

  // Use a log scale to map centroid within canvas height
  //Don't cover the full canvas height (minus 5 eye sizes top and bottom)
  centroidplot = map(log(mean_freq_index), 0, log(spectrum.length), CanvasSize-(5*(eyeHeight*Size)), 5*(eyeHeight*Size));

  velocity.set(0,0); 

  //traverse creeper across width according to track length  
  //move creeper height position by centroid
  position.set(xTime, centroidplot)
  
  //smooth out vertical transitions
  acceleration.set(random(-0.01, 0.01), random(-0.01, 0.01));
  velocity.add(acceleration);
  position.add(velocity);

  fill(c); //lerping colour

  drawCreeper(position.x, position.y, varPupil, Size);
  GenerateMap(6, 8, Size)
  GeneratePacMan();
  GenerateTrees(15)
  Generateghost(200 * Size, 300 * Size, Size)
  Respond();
}

function GenerateMap(NumOfHorizontalRoad, NumOfVerticalRoad, Size) {
  //to calculate the gap diatence between each roads
  let IntervalHeight = 600 / NumOfHorizontalRoad * Size;
  let IntervalWidth = 600 / NumOfVerticalRoad * Size;
  if (IsmapGenerate == 0) {
    for (let i = 0; i < NumOfHorizontalRoad; i++) {
      ArrRoadY[i] = Math.floor(IntervalHeight * i + random(10 * Size, IntervalHeight-10*Size));
      ArrRoadMarkTypeY[i] = Math.trunc(random(1, 3))
    }
    for (let i = 0; i < NumOfVerticalRoad; i++) {
      ArrRoadX[i] = Math.floor(IntervalWidth * i + random(10 * Size, IntervalWidth-10*Size));
      ArrRoadMarkTypeX[i] = Math.trunc(random(1, 3))
    }
    IsmapGenerate = 1
  }

  //draw road and roadmark on the road
  for (let i = 0; i < NumOfHorizontalRoad; i++) {
    GenerateRoad(0, ArrRoadY[i] * Size, Size, 600, 1);
    GenerateRoadMark(0, ArrRoadY[i] * Size + 8 * Size, 600 * Size, ArrRoadMarkTypeY[i], 1)
  }

  for (let i = 0; i < NumOfVerticalRoad; i++) {
    GenerateRoad(ArrRoadX[i] * Size, 0, Size, 600, 0);
    GenerateRoadMark(ArrRoadX[i] * Size + 8 * Size, 0, 600 * Size, ArrRoadMarkTypeX[i], 0)
  }

  // draw crossing area
  for (let p = 0; p < NumOfVerticalRoad; p++) {
    let CrossingHoverX = ArrRoadX[p] * Size;
    for (let q = 0; q < NumOfHorizontalRoad; q++) {
      let CrossingHoverY = ArrRoadY[q] * Size;
      fill(220)
      rect(CrossingHoverX - (RoadWidth / 2), CrossingHoverY, 2 * RoadWidth, RoadWidth);
      rect(CrossingHoverX, CrossingHoverY - (RoadWidth / 2), RoadWidth, 2 * RoadWidth);
      GenerateRoadMark(CrossingHoverX - RoadWidth / 2, CrossingHoverY, 0, 3, 0);
      GenerateRoadMark(CrossingHoverX + RoadWidth, CrossingHoverY, 0, 3, 0);
      GenerateRoadMark(CrossingHoverX, CrossingHoverY - RoadWidth / 2, 0, 3, 1);
      GenerateRoadMark(CrossingHoverX, CrossingHoverY + RoadWidth, 0, 3, 1);
    }
  }
}

function GenerateRoad(Xpos, Ypos, Size, Roadlength, RoadDirection) {
  //for RoadDirection
  // 1 for horizontal position
  // 0 for vertical
  let RoadWidth = 20;
  RoadWidth = RoadWidth * Size;
  Roadlength = Roadlength * Size

  noStroke();
  fill(220);
  if (RoadDirection == 0) {
    rect(Xpos, Ypos, RoadWidth, Roadlength);
  }
  if (RoadDirection == 1) {
    rect(Xpos, Ypos, Roadlength, RoadWidth);
  }
}

// to draw road mark on the road
function GenerateRoadMark(Xpos, Ypos, Marklength, MarkType, MarkDirection) {
  //for MarkDirection
  // 1 for horizontal position
  // 0 for vertical
  //for marktype
  // 1 for single line
  // 2 for double line
  // 3 for zebra crossing

  //draw single line
  if (MarkType == 1) {
    if (MarkDirection == 1) {
      fill(255, 255, 255);
      rect(Xpos, Ypos, Marklength, 5 * Size)
    }
    if (MarkDirection == 0) {
      fill(255, 255, 255);
      rect(Xpos, Ypos, 3 * Size, Marklength)
    }
  }

  // draw double line
  if (MarkType == 2) {
    if (MarkDirection == 1) {
      fill(255, 255, 255);
      rect(Xpos, Ypos, Marklength, 3 * Size)
      rect(Xpos, Ypos + 4 * Size, Marklength, 3 * Size)
    }
    if (MarkDirection == 0) {
      fill(255, 255, 255);
      rect(Xpos, Ypos, 3 * Size, Marklength)
      rect(Xpos + 4 * Size, Ypos, 3 * Size, Marklength)
    }
  }

  //draw zebra crossing
  if (MarkType == 3) {
    let LineNumber = 4;
    let gap = 0;
    LineNumber = Math.floor(4 + Size + 1);
    gap = RoadWidth / ((2 * LineNumber) + 1)
    if (MarkDirection == 1) {
      fill(255, 255, 255);
      for (i = 1; i < LineNumber + 1; i += 1) {
        rect(Xpos + ((2 * i - 1) * gap), Ypos, gap, RoadWidth / 2)
      }
    }
    if (MarkDirection == 0) {
      fill(255, 255, 255);
      for (i = 1; i < LineNumber + 1; i += 1) {
        rect(Xpos, Ypos + ((2 * i - 1) * gap), RoadWidth / 2, gap)
      }
    }
  }
}

function GeneratePacMan() {
  if (IsPacManGenerate == 0) {
    PacmanYpos = ArrRoadY[Math.floor(random(0, NumOfVerticalRoad))] + 10 * Size;
    PacmanXpos = random(0 + 10 * Size, CanvasSize - 10 * Size)
    IsPacManGenerate = 1;
  }

  DrawPacMan(PacmanXpos * Size, PacmanYpos * Size, Size);

}

// for draw pacman
function DrawPacMan(x, y, size) {
  let startAngle = PI / 6;
  let endAngle = -PI / 6;
  fill(255, 125, 0);
  arc(x, y, 20 * size, 20 * size, startAngle, endAngle, PIE);
}

//to generate trees
function GenerateTrees(TreeNumbers) {
  let TreeCode = [];
  let TreeXCode = 0;
  let TreeYCode = 0;
  let TreeX = 0;
  let TreeY = 0;
  let MaxSize = 0;
  let MaxXSize = 0;
  let MaxYSize = 0;

  if (IsTreeGenerate == 0) {
    while (TreeCode.length < TreeNumbers) {
      let TreeCodeNumber = Math.ceil((Math.random() * NumOfHorizontalRoad * NumOfVerticalRoad) + 1)
      if (TreeCode.find(x => x === TreeCodeNumber) === undefined) {
        TreeCode.push(TreeCodeNumber);
      }
    }
    IsTreeGenerate = 1;
  }

  //To get the Coordinate of X and MaxSize of X
  for (let i = 0; i < TreeCode.length; i++) {
    TreeXCode = TreeCode[i] - (Math.ceil((TreeCode[i] / (NumOfHorizontalRoad + 1))) - 1) * (NumOfHorizontalRoad + 1);
    if (TreeXCode == 1) {
      TreeX = ArrRoadX[TreeXCode - 1] / 2;
      MaxXSize = ArrRoadX[TreeXCode - 1] / 2 / (15);
      ArrTreeX.push(TreeX);
      ArrTreeXSize.push(MaxXSize);
    } else if (TreeCode == NumOfHorizontalRoad) {
      TreeX = CanvasSize - ((CanvasSize - ArrRoadX[TreeXCode - 1]) / 2)
      ArrTreeX.push(TreeX);
    } else {
      TreeX = ArrRoadX[TreeXCode - 2] + ((ArrRoadX[TreeXCode - 1] - ArrRoadX[TreeXCode - 2] + RoadWidth) / 2)
      MaxXSize = ((ArrRoadX[TreeXCode - 1] - ArrRoadX[TreeXCode - 2]) / 2) / (15)
      ArrTreeX.push(TreeX);
      ArrTreeXSize.push(MaxXSize);
    }
  }

  //To get the Coordinate of Y and MaxSize of Y
  for (let i = 0; i < TreeCode.length; i++) {
    TreeYCode = Math.ceil((TreeCode[i] / (NumOfHorizontalRoad + 1)));
    if (TreeYCode == 1) {
      TreeY = ArrRoadY[TreeYCode - 1] / 2;
      MaxYSize = ArrRoadY[TreeYCode - 1] / 2 / (15);
      ArrTreeY.push(TreeY);
      ArrTreeYSize.push(MaxYSize);
    } else if (TreeCode == NumOfHorizontalRoad) {
      TreeY = CanvasSize - ((CanvasSize - ArrRoadY[TreeYCode - 1]) / 2)
      ArrTreeY.push(TreeY);
    } else {
      TreeY = ArrRoadY[TreeYCode - 2] + ((ArrRoadY[TreeYCode - 1] - ArrRoadY[TreeYCode - 2] + RoadWidth) / 2)
      MaxYSize = ((ArrRoadY[TreeYCode - 1] - ArrRoadY[TreeYCode - 2]) / 2) / (15);
      ArrTreeY.push(TreeY);
      ArrTreeYSize.push(MaxYSize);
    }
  }

  for (let i = 0; i < TreeNumbers + 1; i++) {
    if (ArrTreeXSize[i] < ArrTreeYSize[i]) {
      MaxSize = ArrTreeXSize[i];
    }
    if (ArrTreeYSize[i] < ArrTreeXSize[i]) {
      MaxSize = ArrTreeYSize[i];
    }
    DrawTrees(ArrTreeX[i] * Size, ArrTreeY[i] * Size, MaxSize * Size, i % 4);
  }
}

//for draw a single trees
function DrawTrees(x, y, size, InnerNumber) {
  fill(0, 255, 0); // Set the fill color to green
  circle(x, y, 10 * size)
  circle(x, y + 5 * size, 10 * size)
  circle(x, y - 5 * size, 10 * size)
  circle(x + 5 * size, y, 10 * size)
  circle(x - 5 * size, y, 10 * size)
  circle(x + 5 * size, y + 5 * size, 5 * size)
  circle(x - 5 * size, y - 5 * size, 5 * size)
  circle(x + 5 * size, y - 5 * size, 5 * size)
  circle(x - 5 * size, y + 5 * size, 5 * size)
  if (InnerNumber == 2 || InnerNumber == 3) {
    fill(0, 0, 255); // Set the fill color to Blue
    circle(x, y, 8 * size)
    circle(x, y + 4 * size, 8 * size)
    circle(x, y - 4 * size, 8 * size)
    circle(x + 4 * size, y, 8 * size)
    circle(x - 4 * size, y, 8 * size)
    circle(x + 3 * size, y + 3 * size, 4 * size)
    circle(x - 3 * size, y - 3 * size, 4 * size)
    circle(x + 3 * size, y - 3 * size, 4 * size)
    circle(x - 3 * size, y + 3 * size, 4 * size)
  }
  if (InnerNumber == 3) {
    fill(255, 0, 0); // Set the fill color to Red
    circle(x, y, 5 * size)
    circle(x, y + 2 * size, 5 * size)
    circle(x, y - 2 * size, 5 * size)
    circle(x + 2 * size, y, 5 * size)
    circle(x - 2 * size, y, 5 * size)
    circle(x + 2 * size, y + 2 * size, 3 * size)
    circle(x - 2 * size, y - 2 * size, 3 * size)
    circle(x + 2 * size, y - 2 * size, 3 * size)
    circle(x - 2 * size, y + 2 * size, 3 * size)
  }
}

//To generate Ghost
function Generateghost() {
  if (IsGhosGenerate == 0) {
    GhostXpos = ArrRoadX[Math.floor(random(0, NumOfHorizontalRoad))] + 10 * Size;
    GhostYpos = random(0 + 10 * Size, CanvasSize - 10 * Size);
    IsGhosGenerate = 1;
  }
  Drawghost(GhostXpos * Size, GhostYpos * Size, Size);
}

//draw ghost
function Drawghost(x, y, size) {
  //the color of ghost is yellow
  fill(255, 204, 0);
  stroke(0);

  //Use a semicircle for the ghost’s head
  arc(x, y, size * 20, size * 20, PI, 0);

  //Use a square for the body of the ghost
  rect(x - size * 10, y, size * 20, size * 20);

  //Use four small triangles for the body of the ghost
  triangle(x - size * 10, y + size * 20, x - size * 5, y + size * 25, x, y + size * 20);
  triangle(x, y + size * 20, x + size * 5, y + size * 25, x + size * 10, y + size * 20);

  //Draw ghost eyes
  fill(0);
  ellipse(x - size * 5, y - size * 5, size * 5, size * 5);
  ellipse(x + size * 5, y - size * 5, size * 5, size * 5);
}

function drawCreeper(xPos, yPos, varPupil, Size) {
  noStroke();

  //ensure creeper is constrained within canvas with increasing size
  let maxXDist = CanvasSize - xPos;     //available x-distance 
  let maxYDist = CanvasSize - yPos;     //available y-distance 
  let maxXSize = (maxXDist) / (3 * eyeWidth) - 0.1
  let maxYSize = (maxYDist) / (3 * eyeHeight) - 0.1
  if (Size > maxXSize || Size > maxYSize) {
    if (maxYSize > maxXSize) {
      Size = maxXSize
    } else {
      Size = maxYSize
    }
  }

  let eyeSize = eyeWidth * Size
  let reye_X = xPos + (2 * eyeSize)

  //left eye
  rect(xPos, yPos, eyeWidth * Size, eyeHeight * Size)

  //inner left eye
  push()
  fill("black")
  rectMode(CENTER)
  rect(xPos + (0.5 * (eyeWidth * Size)), yPos + (0.5 * (eyeHeight * Size)), varPupil * (eyeWidth * Size), varPupil * (eyeHeight * Size))
  pop()

  //right eye
  rect(reye_X, yPos, eyeWidth * Size, eyeHeight * Size)

  //inner right eye
  push()
  fill("white")
  rectMode(CENTER)
  rect(reye_X + (0.5 * (eyeWidth * Size)), yPos + (0.5 * (eyeHeight * Size)), varPupil * (eyeWidth * Size), varPupil * (eyeHeight * Size))
  pop()


  //LS mouth
  rect(xPos + (0.5 * eyeSize), yPos + (1.5 * eyeSize), 0.5 * eyeSize, 1.5 * eyeSize)

  //centre nose and mouth
  rect(xPos + eyeSize, yPos + eyeSize, eyeSize, 1.5 * eyeSize)

  //RS mouth
  rect(xPos + (2 * eyeSize), yPos + (1.5 * eyeSize), 0.5 * eyeSize, 1.5 * eyeSize)
}

function mousePressed() {
  if (track.isPlaying()) {
    track.stop();
    background(255, 0, 0); //red
    text('t a p  t o  p l a y', width / 2, 30);
    hangOn = 1
  }
  else {
    hangOn = 0
    track.loop();
  }
}

//respond to the window 
function Respond() {
  let windowHeight = window.innerHeight;
  let windowWidth = window.innerWidth;

  //to adjust the size of canvas
  if (windowHeight >= windowWidth) {
    CanvasSize = windowWidth;
  }
  if (windowWidth >= windowHeight) {
    CanvasSize = windowHeight;
  }
  Size = CanvasSize / 600
  RoadWidth = 20*Size;
}