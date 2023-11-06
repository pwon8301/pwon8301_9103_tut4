let canvasSize = 600;
let track;
let hangOn;

function preload() {
  track = loadSound('audio/sample-visualisation.mp3');
}

function setup() {
  createCanvas(canvasSize, canvasSize);
  blueColour = color(125, 237, 255)
  redColour = color(255, 0, 0)
  fft = new p5.FFT(0.8, 16); //16 bands
  track.connect(fft);

  let xPos = 180  
  let yPos = 150
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

  background(220); //grey

  let spectrum = fft.analyze();  

  //track average energy between 20Hz and 20kHz 
  trackAmp = fft.getEnergy(20, 20000)
  let varAmp = map(trackAmp, 0, 255, 0, 1)
  let c = lerpColor(blueColour,redColour,varAmp)

  let varPupil = map(trackAmp, 0, 255, 0.2, 0.85)

  let size = 5 //excessive size constrains to canvas

  acceleration.set(random(-0.1,0.1), random(-0.1, 0.1));
  velocity.add(acceleration);  
  velocity.set(random(-1,1),random(-1,1));  
  position.add(velocity); 

  fill(c);
  drawCreeper(position.x, position.y, varPupil, size);
}

function drawCreeper(xPos, yPos, varPupil, size){
  
  noStroke()
  
  //creeper size is proportional width and height 
  //3x3 eye width/height
  let eyeWidth = 15, eyeHeight = 15 
  
  //ensure creeper is constrained within canvas with increasing size
  let maxXDist = canvasSize - xPos;     //available x-distance 
  let maxYDist = canvasSize - yPos;     //available y-distance 
  let maxXSize = (maxXDist)/(3*eyeWidth)-0.1
  let maxYSize = (maxYDist)/(3*eyeHeight)-0.1
  if (size > maxXSize || size > maxYSize){
    if(maxYSize>maxXSize){
      size = maxXSize
    }else{
      size = maxYSize
    }
  }
  
  let eyeSize = eyeWidth*size
  let reye_X = xPos+(2*eyeSize)

  //left eye
  rect(xPos, yPos, eyeWidth*size, eyeHeight*size)

  //inner left eye
  push()
  fill("black")
  rectMode(CENTER)
  rect(xPos+(0.5*(eyeWidth*size)),yPos+(0.5*(eyeHeight*size)),varPupil*(eyeWidth*size),varPupil*(eyeHeight*size))
  pop()

  //right eye
  rect(reye_X, yPos, eyeWidth*size, eyeHeight*size)

  //inner right eye
  push()
  fill("white")
  rectMode(CENTER)
  rect(reye_X+(0.5*(eyeWidth*size)),yPos+(0.5*(eyeHeight*size)),varPupil*(eyeWidth*size),varPupil*(eyeHeight*size))
  pop()


  //LS mouth
  rect(xPos+(0.5*eyeSize),yPos+(1.5*eyeSize),0.5*eyeSize,1.5*eyeSize)

  //centre nose and mouth
  rect(xPos+eyeSize,yPos+eyeSize,eyeSize,1.5*eyeSize)

  //RS mouth
  rect(xPos+(2*eyeSize),yPos+(1.5*eyeSize),0.5*eyeSize,1.5*eyeSize)
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