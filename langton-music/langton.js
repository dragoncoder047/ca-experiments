const $ = s => document.querySelector(s);

const playfield = $('#playfield');
const startStopBtn = $('#startstop');
const stepBtn = $('#step');
const textbox = $('#textbox');
const loadBtn = $('#loadbtn');
const statusBar = $('#statusbar');

var dragController = new CanvasMove(playfield, false);
var ctx = dragController.ctx;
var world = new World(ctx);
var header = {};
var ants = [];
var stepNum = 0;

var ratio = (function () {
    var dpr = window.devicePixelRatio || 1;
    var bsr = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1;
    return dpr / bsr;
})();

playfield.width = 1280 * ratio;
playfield.height = 640 * ratio;
playfield.style.width = "1280px";
playfield.style.height = "640px";
ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
ctx.imageSmoothingEnabled = false;
dragController.x = 640 * ratio;
dragController.y = 320 * ratio;

function showStatus(text, color = 'black') {
    statusBar.value = text;
    statusBar.style.color = color;
}

function runEnable(canRun) {
    if (canRun) {
        startStopBtn.removeAttribute('disabled');
        stepBtn.removeAttribute('disabled');
    } else {
        startStopBtn.setAttribute('disabled', true);
        stepBtn.setAttribute('disabled', true);
    }
}

function render() {
    dragController.enter();
    dragController.clear();
    world.draw();
    ants.forEach(ant => ant.draw());
    dragController.exit();
    setTimeout(render, 50); // 20 fps
}
render();

var running = false;

function start() {
    if (!running) {
        running = true;
        tick();
    }
    startStopBtn.textContent = 'Pause';
}

function stop() {
    running = false;
    startStopBtn.textContent = 'Resume';
}

function step() {
    stop();
    tick();
}

function togglePlayPause() {
    if (running) stop();
    else start();
}

startStopBtn.addEventListener('click', togglePlayPause);
stepBtn.addEventListener('click', step);

function tick() {
    try {
        ants.forEach(ant => ant.tick());
        showStatus(`Step number ${stepNum}`);
        stepNum++;
    } catch (e) {
        stop();
        runEnable(false);
        showStatus(e, 'red');
        throw e;
    }
    if (ants.every(ant => ant.halted)) {
        stop();
        showStatus('All ants halted.', 'blue');
    }
    if (!ants.length) {
        stop();
        runEnable(false);
        showStatus('No ants.', 'red');
    }
    if (running) setTimeout(tick, 60000 / (header.bpm ?? 240));
}

function load() {
    stop();
    startStopBtn.textContent = 'Start';
    var text = textbox.value;
    try {
        ({ ants, header } = loadWorld(text, { Ant, Beatle, Turmite }, world));
    } catch(e) {
        stop();
        runEnable(false);
        showStatus(e, 'red');
        throw e;
    }
}
loadBtn.addEventListener('click', load);

