var program;
var cpu;

var row;
var col;
var Scale = 10;
var gameMenu;
var beepsound;

var bkey = [
  49, // 1
  50, // 2
  51, // 3
  52, // 4
  81, // Q
  87, // W
  69, // E
  82, // R
  65, // A
  83, // S
  68, // D
  70, // F
  90, // Z
  88, // X
  67, // C
  86 // V
];

function preload() {
  program = loadJSON("/api/PONG2");
  beepsound = new Audio("/api/sound");
}

function setup() {
  // The game select dropdown
  gameMenu = createSelect();

  gameMenu.parent("d"); // Adding the div as the parent

  // The list of Roms
  gameMenu.option("PONG2");
  gameMenu.option("BRIX");
  gameMenu.option("BLITZ");
  gameMenu.option("INVADERS");
  gameMenu.option("TETRIS");
  gameMenu.option("MAZE");

  gameMenu.changed(SelectEvent);

  // The cpu object creation
  cpu = new Chip8(program.bytes.data);
  cpu.load();

  // The canvas creation
  var canvas = createCanvas(640, 320);
  canvas.parent("c");

  row = height / Scale;
  col = width / Scale;
  // background(220);
  noStroke();
}

function draw() {
  for (let i = 0; i < 10; i++) {
    cpu.run_cycle();
  }
  if (cpu.draw) {
    background(220);
    cpu.draw = false;
    for (let x = 0; x < col; x++) {
      for (let y = 0; y < row; y++) {
        if (cpu.gfx[x + y * col] == 1) fill(100);
        else noFill();
        rect(x * Scale, y * Scale, Scale, Scale);
      }
    }
  }
}

function keyPressed() {
  for (let i = 0; i < 16; i++) {
    if (keyCode === bkey[i]) {
      cpu.keys[i] = 1;
    }
    if (keyCode === 113) {
      cpu.reset();
    }
  }
}

function keyReleased() {
  for (let i = 0; i < 16; i++) {
    if (keyCode === bkey[i]) cpu.keys[i] = 0;
  }
}

async function SelectEvent() {
  const res = await fetch(`/api/${gameMenu.value()}`);
  program = await res.json();
  cpu.ChangeRom(program.bytes.data);
}
