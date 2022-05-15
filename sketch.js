let mode2 = false;
let stringPointer = 0;

let m = 0;

let conceptTextX= 985;
let conceptTextY =100;
let conceptTextWidth = 450;
let conceptTextHeight = 1000;


let lineMode = false;
let rectMode = true;

var mic;
var fft;
var waveform;
var spectrum;

let myRec;

let currentChar = [];
let previousChar = [];

let spaceNeeded = true;
let weightHistory;

var currentX;
var currentY;
var startingX;
var startingY;

let charWidth;
let size;
let ascenders;
let xHeight;
let mark1;
let baseLine;
let unders;

let thresholdValue = 0.002;
let thresholdReached = false;

let spaceBetweenWords;
let dynColor;

let waveformDistortionMultiplierSlider;
let waveformDistortionMultiplier = 0;
let waveformDistortionMultiplierStandard = 100;
let xHeightSlider;
let markiSlider;
let mark1Slider;
let mark2Slider;
let mark3Slider;
let baseLineSlider;
let undersSlider;
let widthSlider;
let spacingSlider;
let weightSlider;
let sizeSlider;
let spaceBetweenWordsSlider;
let colorSlider;

let infoButton;
let resetButton;


let radiusSlider;
let slantedSlider;

let umbruch = false;

let avg = 0;
let weightMap = 0;
let slantedMap = 0;
let sizeMap;
let avgCounter = 0; //Um die ersten falschen Messdaten zu überspringen
let lowestAvg;
let highestAvg;
let minH = 30;
let minS = 30;
let minB = 30;
let maxH = 90;
let maxB = 90;
let maxS = 90;
let weight;
let cornerRadius;

let stretchMap = 0.75;
let stretchMapBaseline = 0.75;

let textColor = false;

let charString = [];
 /* 
  "j","o","n"," ","r","u","f","t"," ","v","i","a"," ","h","a","n","d","y"," ","e","i","n"," ","q","u","i","e","t","s","c","h","g","e","l","b","e","s"," ","t","a","x","i"," ","z","u","m"," ","w","e","t","t","k","a","m","p","f"
];/*
  "a",
  "b",
  "c",
   "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z"
];*/

let nextChar;

let ampString = [];
let avgRecWaveform;
let calculatedAvgRecWaveform = [];
let startAvgRec = false;
let newCount = [];
let newCountArchive = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  background(0,0,100);

  mic = new p5.AudioIn();
  mic.start();

  fft = new p5.FFT(0.9, 256);
  fft.setInput(mic);

  myRec = new p5.SpeechRec("en-US");
  myRec.start(); // start listening
  myRec.onResult = showResult; // bind callback function to trigger when speech is recognized
  myRec.onStart = showStart;
  myRec.onEnd = showEnd;
  myRec.continous = true;
  myRec.interimResults = true;

  //waveformDistortionMultiplierSlider = createSlider(0, 350, 0);//27
  //waveformDistortionMultiplierSlider.position(400, 400);
  //waveformDistortionMultiplierSlider.style("width", "80px");

  weightSlider = createSlider(2, 60, 40.5);
  widthSlider = createSlider(0, 350, 44);
  radiusSlider = createSlider(0, 30, 0);

  weightSlider.position(32, 60);
  weightSlider.addClass("mySliders");

  widthSlider.position(150, 60);
  widthSlider.addClass("mySliders");

  radiusSlider.position(268, 60);
  radiusSlider.addClass("mySliders");
  
}

/*function mousePressed() {
  if (
    mouseX > 0 &&
    mouseX < windowWidth &&
    mouseY > 0 &&
    mouseY < windowHeight
  ) {
    let fs = fullscreen();
    fullscreen(true);
  }
}*/

function touchStarted() {
  getAudioContext().resume();
}

function draw() {
  background(0,0,100);//, 0.01);

  micLevel = mic.getLevel(1); //(0.005)
  micLevelMap = map(micLevel, 0, 1, 5, 35);

  spectrum = fft.analyze();

  waveform = fft.waveform();

  //AVG für 10 niedrigste Frequenzbänder
  let avg = 0;
  let weightMap = 0;
  for (var i = 0; i < 10; i++) {
    avg += spectrum[i];
  }

  avgCounter++;

  if (avgCounter > 45) {
    avg = avg / 10; //In meinem Zimmer bei Stille um 30, Tippen um 100
    if (lowestAvg == null) {
      lowestAvg = avg;
    } else if (avg < lowestAvg) {
      lowestAvg = avg;
    }
    if (highestAvg == null) {
      highestAvg = avg;
    } else if (avg > highestAvg) {
      highestAvg = avg;
    }
  } else {
    avg = 40;
  }

  let min;
  let max;
  if (lowestAvg != null) {
    min = lowestAvg;
  } else {
    min = 40;
  }
  if (highestAvg != null) {
    max = highestAvg;
  } else {
    max = 50;
  }

  weightMap = map(avg, min, max, 2, 42);
  //sizeMap = map(avg, min, max, 70, 20); //XHEIGHT
  slantedMap = 0; //map (avg, min, max, 0.2, 0);
  colorMap = map(avg, min, max, minH, maxH); //30, 90

  /*if (micLevel > thresholdValue) {
    //threshhold
    thresholdReached = true;

    waveformDistortionMultiplier = waveformDistortionMultiplierSlider.value();
  } else {
    thresholdReached = false;
    waveformDistortionMultiplier = 0;
  }*/

  drawType(charString, 12, 12,0.982, 43, weightMap);
}

function drawType(charString, charX, charY, parSize, spacing, charStroke) {
  currentX = charX;
  currentY = charY;

  startingX = charX;
  startingY = charY;

  push();

  translate(charX, charY);

  size = parSize;

  charWidth = widthSlider.value() * size;
  weight = weightSlider.value();
  cornerRadius = radiusSlider.value();

  ascenders = 0 * size;
  xHeight = /*sizeMap*size;*/ 72 * size;
  marki = 28 * size;
  mark1 = 94 * size;
  mark2 = 138 * size;
  mark3 = 182 * size;
  baseLine = 215 * size;
  //console.log(17*size + " + " + stretchMap + " + " + baseLine);
  unders = 259.5 * size;

  if (rectMode) {
    noStroke();
    fill(0);
  }
  if (lineMode) {
    stroke(0);
    strokeWeight(weight);
  }

  var ca = [
    [0, mark1],
    [0, xHeight],
    [charWidth, xHeight],
    [charWidth, baseLine],
    [0, baseLine],
    [0, mark2],
    [charWidth, mark2],
  ];

  var cb = [
    [0, ascenders],
    [0, baseLine],
    [charWidth, baseLine],
    [charWidth, xHeight],
    [0, xHeight],
  ];

  var cc = [
    [charWidth, mark2],
    [charWidth, xHeight],
    [0, xHeight],
    [0, baseLine],
    [charWidth, baseLine],
    [charWidth, mark3],
  ];

  var cd = [
    [charWidth, ascenders],
    [charWidth, baseLine],
    [0, baseLine],
    [0, xHeight],
    [charWidth, xHeight],
  ];

  var ce = [
    [charWidth, mark3],
    [charWidth, baseLine],
    [0, baseLine],
    [0, xHeight],
    [charWidth, xHeight],
    [charWidth, mark2],
    [0, mark2],
  ];

  var cf = [
    [0, baseLine],
    [0, ascenders],
    [charWidth, ascenders],
    [charWidth, mark1],
    ["NEWSHAPE"],
    [0, mark2],
    [charWidth, mark2],
  ];

  var cg = [
    [0, unders],
    [charWidth, unders],
    [charWidth, xHeight],
    [0, xHeight],
    [0, baseLine],
    [charWidth, baseLine],
  ];

  var ch = [
    [0, ascenders],
    [0, baseLine],
    ["NEWSHAPE"],
    [0, xHeight],
    [charWidth, xHeight],
    [charWidth, baseLine],
  ];

  var ci = [
    [0, ascenders],
    [0, marki],
    ["NEWSHAPE"],
    [0, xHeight],
    [0, baseLine],
  ];

  var cj = [
    [charWidth, ascenders],
    [charWidth, marki],
    ["NEWSHAPE"],
    [charWidth, xHeight],
    [charWidth, unders],
    [0, unders],
    [0, xHeight],
  ];

  /*var ck = [
    [0, ascenders],
    [0, baseLine],
    ["NEWSHAPE"],
    [0, mark2],
    [charWidth, mark2],
    ["NEWSHAPE"],
    [charWidth, xHeight],
    [charWidth, mark1 + 7*size],
    ["NEWSHAPE"],
    [charWidth, mark3 - 7 * size],
    [charWidth, baseLine],
  ];*/

  var ck = [
    [0, ascenders],
    [0, baseLine],
    ["NEWSHAPE"],
    [0, mark2],
    [charWidth, mark2],
    ["NEWSHAPE"],
    [charWidth, xHeight],
    [charWidth, baseLine],
  ];

  var cl = [
    [0, ascenders],
    [0, baseLine],
    [charWidth, baseLine],
    [charWidth, baseLine],
    [charWidth, xHeight + 42 * size],
  ];

  var cm = [
    [0, baseLine],
    [0, xHeight],
    [charWidth, xHeight],
    [charWidth, baseLine],
    [charWidth, xHeight],
    [charWidth*2, xHeight],
    [charWidth*2, baseLine],
  ];

  /*case "j": 
        if (previousChar == "i"){
        currentX -= 4 * size;
        }*/

  var cn = [
    [0, baseLine],
    [0, xHeight],
    [charWidth, xHeight],
    [charWidth, baseLine],
  ];

  var co = [
    [0, xHeight],
    [charWidth, xHeight],
    [charWidth, baseLine],
    [0, baseLine],
    [0, xHeight],
  ];

  var cp = [
    [0, unders],
    [0, xHeight],
    [charWidth, xHeight],
    [charWidth, baseLine],
    [0, baseLine],
  ];

  var cq = [
    [charWidth, unders],
    [charWidth, xHeight],
    [0, xHeight],
    [0, baseLine],
    [charWidth, baseLine],
  ];

  var cr = [
    [0, baseLine],
    [0, xHeight],
    [charWidth, xHeight],
    [charWidth, mark2],
  ];

  var cs = [
    [charWidth, mark1],
    [charWidth, xHeight],
    [0, xHeight],
    [0, mark2],
    [charWidth, mark2],
    [charWidth, baseLine],
    [0, baseLine],
    [0, mark3],
  ];

  var ct = [
    [0, ascenders],
    [0, baseLine],
    [charWidth, baseLine],
    [charWidth, xHeight + 44 * size],
    ["NEWSHAPE"],
    [0, xHeight],
    [charWidth, xHeight],
  ];

  var cu = [
    [0, xHeight],
    [0, baseLine],
    [charWidth, baseLine],
    [charWidth, xHeight],
  ];

  var cv = [
    [0, xHeight],
    [0, baseLine - 14],
    ["NEWSHAPE"],
    [charWidth, xHeight],
    [charWidth, baseLine - 14],
    ["NEWSHAPE"],
    [20, baseLine],
    [charWidth - 20 * size, baseLine],
  ];

  var cw = [
    [0, xHeight],
    [0, baseLine],
    [charWidth, baseLine],
    [charWidth, xHeight],
    [charWidth, baseLine],
    [charWidth*2, baseLine],
    [charWidth*2, xHeight],
  ];

  var cx = [
    [0, xHeight],
    [0, mark2],
    [charWidth, mark2],
    [charWidth, xHeight],
    ["NEWSHAPE"],
    [0, baseLine],
    [0, mark3],
    [charWidth, mark3],
    [charWidth, baseLine],
    ["NEWSHAPE"],
    [charWidth / 2, mark3],
    [charWidth / 2, mark2],
  ];

  var cy = [
    [0, xHeight],
    [0, baseLine],
    [charWidth, baseLine],
    ["NEWSHAPE"],
    [charWidth, xHeight],
    [charWidth, unders],
    [0, unders],
  ];

  var cz = [
    [0, mark1],
    [0, xHeight],
    [charWidth, xHeight],
    [charWidth, mark2],
    [0, mark2],
    [0, baseLine],
    [charWidth, baseLine],
    [charWidth, mark3],
  ];

  var cspace = []; // [["SPACE"], ["SPACE"]];
  var chenter = [["ENTER"], ["ENTER"]];

  currentChar = [];
  previousChar = [];
  
 // if(!infoMode){

  
  for (let j = m; j < charString.length; j++) {
    if (j > 0) {
      previousChar = currentChar;
    }
    switch (charString[j]) {
      case "a":
        currentChar = ca;
        break;
      case "b":
        currentChar = cb;
        break;
      case "c":
        currentChar = cc;
        break;
      case "d":
        currentChar = cd;
        break;
      case "e":
        currentChar = ce;
        break;
      case "f":
        currentChar = cf;
        break;
      case "g":
        currentChar = cg;
        break;
      case "h":
        currentChar = ch;
        break;
      case "i":
        currentChar = ci;
        break;
      case "j":
        currentChar = cj;
        break;
      case "k":
        currentChar = ck;
        break;
      case "l":
        currentChar = cl;
        break;
      case "m":
        currentChar = cm;
        break;
      case "n":
        currentChar = cn;
        break;
      case "o":
        currentChar = co;
        break;
      case "p":
        currentChar = cp;
        break;
      case "q":
        currentChar = cq;
        break;
      case "r":
        currentChar = cr;
        break;
      case "s":
        currentChar = cs;
        break;
      case "t":
        currentChar = ct;
        break;
      case "u":
        currentChar = cu;
        break;
      case "v":
        currentChar = cv;
        break;
      case "w":
        currentChar = cw;
        break;
      case "x":
        currentChar = cx;
        break;
      case "y":
        currentChar = cy;
        break;
      case "z":
        currentChar = cz;
        break;
      case " ":
        currentChar = cspace;
        break;
      case "'":
        currentChar = cspace;
        break;
      case "Enter":
        spaceNeeded = false;
        currentChar = chenter;
        currentY = currentY + 20 * size;
        currentX = startingX;
        break;
      default:
        break;
    }
    
    push();
    var theta;
    var dx;
    var dy;
    let previousPoint = [];
    let currentPoint = [];
    translate(currentX, currentY);
    beginShape();
    for (let i1 = 0; i1 < currentChar.length; i1++) {
      if (i1 > 0) {
        previousPoint = currentPoint; //fehleranfällig falls prev       leer ist?
      }
      currentPoint = [currentChar[i1][0], currentChar[i1][1]];

      if (i1 > 0) {
        if (currentChar[i1][0] == "NEWSHAPE") {
          endShape();
          beginShape();
        } else {
          dy = currentPoint[1] - previousPoint[1];
          dx = currentPoint[0] - previousPoint[0];

          theta = Math.atan2(dy, dx);
          theta *= 180 / Math.PI;

          switch (theta) {
            case 0: //rechts
              if (rectMode) {
                push();
                rect(
                  previousPoint[0] - weight / 2,
                  previousPoint[1] - weight / 2,
                  dx + weight,
                  weight,
                  cornerRadius
                );
                pop();
              }
              if (lineMode) {
                line(
                  previousPoint[0],
                  previousPoint[1],
                  currentPoint[0],
                  currentPoint[1]
                );
              }
              break;
            case 90: //runter
              if (rectMode) {
                push();
                rect(
                  previousPoint[0] - weight / 2,
                  previousPoint[1] - weight / 2,
                  weight,
                  dy + weight,
                  cornerRadius
                );
                pop();
              }
              if (lineMode) {
                line(
                  previousPoint[0],
                  previousPoint[1],
                  currentPoint[0],
                  currentPoint[1]
                );
              }
              break;
            case 180: //links
              if (rectMode) {
                push();
                rect(
                  previousPoint[0] + weight / 2,
                  previousPoint[1] - weight / 2,
                  dx - weight,
                  weight,
                  cornerRadius
                );
                pop();
              }
              if (lineMode) {
                line(
                  previousPoint[0],
                  previousPoint[1],
                  currentPoint[0],
                  currentPoint[1]
                );
              }
              break;
            case -90: //hoch
              if (rectMode) {
                push();
                rect(
                  previousPoint[0] - weight / 2,
                  previousPoint[1] + weight / 2,
                  weight,
                  dy - weight,
                  cornerRadius
                );
                pop();
              }
              if (lineMode) {
                line(
                  previousPoint[0],
                  previousPoint[1],
                  currentPoint[0],
                  currentPoint[1]
                );
              }
              break;

            default:
              break;
          }
        }
      }
      //vertex(currentChar[i1][0], currentChar[i1][1]); //lol das hier zeichnet alles!!
      /*if (lineMode) {
        line(
          previousPoint[0],
          previousPoint[1],
          currentPoint[0],
          currentPoint[1]
        );
        push();
        fill(200, 100, 100);
        noStroke();
        ellipse(previousPoint[0], previousPoint[1], 10, 10);
        pop();
      }*/

      endShape();
      
    }
    
   /* if (currentX + charWidth + spacing > windowWidth - 150)       {
        if (currentChar != cspace) {
          console.log("hi");
          umbruch = true;
          push();
          fill(200, 100, 100);
          noStroke();
          rect(0, currentY, 300, 40);
          pop();
        }
      }*/
    
    //ab hier richtiges umbruch dings

    if (currentX + charWidth + spacing > windowWidth - 150) {
    
      if (currentY + 298.5 < 610) {
        
        currentY += 298.5;
        currentX = startingX;
        spaceNeeded = false;
          
      } else {
        //currentY = startingY;
        //currentX = startingX;
        //mode2 = true;
        //charString.splice(0,j-1);
        //m++;
      }
    }

    /*console.log("currentX: " + currentX + " StartingX: " + startingX + " CurrentY :" + currentY + "startingY:" + startingY);*/

    if (currentChar == cm || currentChar == cw) {
      spacing = charWidth*2;
    } else if (currentChar == ci) {
      spacing = 0;
    }else {
      spacing = 43;
    }
    if (spaceNeeded) {
      if (currentChar == cspace) {
          spacing = 36;
          currentX += spacing;
          spaceNeeded = false;
      } else {
        currentX += charWidth + spacing; // das sind die buchstaben
      }
    }
    spaceNeeded = true;
    pop();
  }
  //}
  weightHistory = charStroke;

  pop();

  push();
  noStroke();
  textSize(23);
  if (textColor){
    fill(220,80,96);
  }
  else{
    fill(0,0,50);
  }
  /*text("Weight", 4,20);
  text("Width", 4,70);
  text("Edge Radius", 4,120);*/
  text("Weight", 35, 47);
  text("Width", 150, 47);
  text("Edge Radius", 268, 47);
  
  textLeading(27);

  text("The written word allows us to manifest the audible performance of speech as a visual experience – in the form of letters. Their shape and combination convey meaning and they have always been an expression of their times' technology. Use this interface to explore the visual relationship of speech, form and meaning.", 35,100,450,500);
  
  text("This site accesses your device’s microphone. It analyzes the spoken word and transcribes it in real time. All ex- pressions are displayed in an algorithmic typeface. Its letterforms' shapes respond to your interaction with the three sliders at the top. Use them to shape their weight, width, as well as edge radius.", 510,100,450,500);
  
  textStyle(ITALIC);
  text("Click here to reset the sliders to their default.",985,100,450,500)
  
  pop();
}

function showResult() {
 
  charString = [];
  for (let i = 0; i < myRec.resultString.length; i++) {
    /*if (mode2) {
      charString = [];
      console.log("Blabb");
      mode2 = false;
    }*/
    let charToPush = myRec.resultString.charAt(i);
    let charToPushInLowerCase = charToPush.toLowerCase();
    charString.push(charToPushInLowerCase);
    if (i == myRec.resultString.length - 1) {
      charString.push(" ");
    }
  }

  // console.log(charString + " PUSH"); // log the result
}

function showEnd() {
  //console.log("Ending"); // log the result
  myRec.start();
}

function showStart() {
  
}

function keyTyped() {
  if (key === "1") {
  } else if (key === "2") {
    if (!textColor){
      textColor = true;
    }
    else{
      textColor = false;
    }
  }
  // uncomment to prevent any default behavior
  // return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


function mouseClicked() {
  if (isMouseInsideText()) {
    resetSliders();
  }
}

function isMouseInsideText() {
  const messageWidth = conceptTextWidth;
  const messageTop = conceptTextY - textAscent();
  const messageBottom = 580;


  let bool = mouseX > conceptTextX && mouseX < conceptTextX + messageWidth &&
    mouseY > messageTop && mouseY < messageBottom;
  
  return bool;
}

function resetSliders(){
  console.log("hi");
  weightSlider.value(40.5);
  widthSlider.value(44);
  radiusSlider.value(0);
}
