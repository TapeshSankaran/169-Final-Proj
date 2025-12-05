const TS = 100;
const ITER = 1;
const W = 800;
const H = 800;
let world;
let iHandler;
let bg;

function setup() {
    let canvas = createCanvas(W, H);
    canvas.parent('canvas-container');
    angleMode(DEGREES);
    noSmooth();

    world = new World({
        tileSize: TS,
        iterations: ITER,
        camSpeed: 20,
        drawRange: W/(2*TS),
        colorMode: 'noise',
        zoom: 1,
        canvas: canvas,
        tiling: "ab",
        bg: bg,
        colors: [color(138, 0, 189), color(254, 136, 62), color(67, 0, 168), color(255, 202, 56)]
    });

    let cMode = document.getElementById("colorMode");
    let tSize = document.getElementById("tileSize");
    let iters = document.getElementById("iterations");
    let rColor = document.getElementById("rColor");
    let aColor = document.getElementById("aColor");
    let cTiling = document.getElementById("tiling");
    let bgInput = document.getElementById("background");
    let colorContainer = document.getElementById("color-container");
    iHandler = new InputHandler({
        c_Box: {container: colorContainer, addBtn: aColor, remBtn: rColor}, 
        c_ModeSelect: cMode,
        i_Input: iters,
        ts_Input: tSize,
        world: world,
        tiling_Select: cTiling,
        bgInput: bgInput,
    });

}

function preload() {
    bg = loadImage('assets/Background.jfif');
    vign = loadImage('assets/vignette.png');
}

function draw() {
    background(10);
    world.update();
    world.draw();
    push();
    tint(0, 0, 0, 150);
    image(vign, 0, 0, width, height);
    pop();
}

function windowResized() {
    resizeCanvas(800, 800);
}