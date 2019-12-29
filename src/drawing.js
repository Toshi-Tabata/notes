// TODO: change the consts to use getelementbyID and change color to colour

// Globals
const paintCanvas = document.querySelector( '.js-paint' );
const context = paintCanvas.getContext( '2d' );
const debug = document.getElementById("debug");
const colorPicker = document.querySelector( '.js-color-picker');
const lineWidthRange = document.querySelector( '.js-line-range' );
const lineWidthLabel = document.querySelector( '.js-range-value' );
let x = 0, y = 0;
let mouseIsDown = false;
let canvasStack = [];
let redoStack = [];
let width = 1;
let colour = colorPicker.value;
context.lineCap = "round";
context.lineJoin = "round";

// Event Listeners
colorPicker.addEventListener( 'change', changeColour);
lineWidthRange.addEventListener( 'input', setPenThickness);
paintCanvas.addEventListener( "mousedown", startDrawing );
paintCanvas.addEventListener( "mousemove", draw );
window.addEventListener( "mouseup", stopDrawing );
paintCanvas.addEventListener("mouseover", resumeDrawing);

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
    )

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
        console.log(canvasStack[canvasStack.length - 1]);
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
    // pop the top of points stack, then redraw using points[] array
    context.clearRect(0, 0, paintCanvas.width, paintCanvas.height);
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
    // Redraw the most recent item in the redo stack, and pop it.
    //drawLine(stack)

}



function drawLine(x, y, prevX, prevY, width, colour) {
    context.lineWidth = width;
    context.strokeStyle = colour;
    context.beginPath();
    context.moveTo(x, y);
    context.quadraticCurveTo(x, y, prevX, prevY);
    // context.lineTo(s[j + 1].newX, s[j + 1].newY);
    context.stroke();

}