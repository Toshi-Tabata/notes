// Simple Drawing Application made by Toshi Tabata
// toshi.tabata@outlook.com

// Globals
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const debug = document.getElementById("debug");
const colourPicker = document.getElementById("colourPicker");
const lineWidthRange = document.getElementById("thicknessPicker");
const lineWidthLabel = document.getElementById("thicknessValue");
let x = 0, y = 0;
let mouseIsDown = false;
let canvasStack = [];
let redoStack = [];
let width = 1;
let colour = colourPicker.value;
context.lineCap = "round";
context.lineJoin = "round";

// Event Listeners
colourPicker.addEventListener("change", changeColour);
lineWidthRange.addEventListener("input", setPenThickness);
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
window.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseover", resumeDrawing);

// Functions
function changeColour(event) {
    context.strokeStyle = event.target.value;
    colour = event.target.value;

}

function setPenThickness(event) {
    width = event.target.value;
    lineWidthLabel.innerHTML = width;
    context.lineWidth = width;

}

function startDrawing(event) {
    redoStack = [];
    mouseIsDown = true;
    x = event.offsetX;
    y = event.offsetY;
    debugging("drawing start");

    // Create an array with objects for every new line drawn
    // Objects contain a path (array of coordinates to draw the line)
    canvasStack.push(
        [{x, y, width, colour}]
    );

}

function draw(event) {
    if (mouseIsDown) {
        const newX = event.offsetX;
        const newY = event.offsetY;

        drawLine(newX, newY, x, y, width, colour);
        x = newX;
        y = newY;
        debugging(`Coords: ${x}, ${y}`);
        canvasStack[canvasStack.length - 1].push({x: newX, y: newY, width, colour});
    }
}

function stopDrawing() {
    mouseIsDown = false;
    debugging("drawing stopped");

}

function resumeDrawing(event) {
    if (mouseIsDown) {
        startDrawing(event);

    }
}

function debugging (message) {
    debug.innerText = message;

}

function undo() {

    // Do nothing if there is nothing to undo
    if (canvasStack[0] === undefined) {
        return;
    }

    // pop the top of the `points` stack, then redraw using points[] array
    context.clearRect(0, 0, canvas.width, canvas.height);

    redoStack.push(canvasStack.pop());

    // For each line in the stack, redraw the line
    for (let i = 0; i < canvasStack.length; i++) {
        let s = canvasStack[i];

        // Redraw the line
        for (let j = 0; j < s.length - 1; j++) {
            const curr = s[j];
            const next = s[j + 1];
            drawLine(next.x, next.y, curr.x, curr.y, curr.width, curr.colour);

        }
    }

    // Reset context to default
    context.lineWidth = width;
    context.strokeStyle = colour;
}

function redo() {
    // Do nothing if nothing has been undone
    if (redoStack[0] === undefined) {
        return;
    }

    const lastItem = redoStack.length - 1;
    let line = redoStack[lastItem]; // array of coordinates for forming line(s)
    canvasStack.push(redoStack.pop());

    for (let i = 0; i < line.length - 1; i++) {
        const [x, y, prevX, prevY, width, colour] = [line[i + 1].x, line[i + 1].y, line[i].x, line[i].y, line[i].width, line[i].colour];
        drawLine(x, y, prevX, prevY, width, colour)
    }
}

function drawLine(x, y, prevX, prevY, width, colour) {
    context.lineWidth = width;
    context.strokeStyle = colour;
    context.beginPath();
    context.moveTo(x, y);
    context.quadraticCurveTo(x, y, prevX, prevY);
    context.stroke();

}