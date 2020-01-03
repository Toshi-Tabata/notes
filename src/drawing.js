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
let fingerDrawOff = false;
let mouseIsDown = false;
let canvasStack = [];
let redoStack = [];
let width = 2;
let colour = colourPicker.value;
context.lineCap = "round";
context.lineJoin = "round";
context.lineWidth = width;
setResolution(500, 500);

function toggleFinger() {
    fingerDrawOff = fingerDrawOff ? false : true;
}


colourPicker.addEventListener("change", changeColour);
lineWidthRange.addEventListener("input", setPenThickness);

// Mouse Event Listeners
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mouseover", resumeDrawing);
canvas.addEventListener("mousemove", draw);
window.addEventListener("mouseup", stopDrawing);

// Touch Event Listeners
canvas.addEventListener("touchstart", startDrawing);
canvas.addEventListener("touchmove", draw);
window.addEventListener("touchend", stopDrawing);

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

function getCoords(event) {
    if (fingerDrawOff) {
        if (event.touches[0].touchType === "direct")
            return;
    }


    if (event.touches && event.touches[0] && typeof event.touches[0]["force"] !== "undefined") {
        if (event.touches[0]["force"] > 0) {
            // TODO: implement forces == brush thickness
        }
        x = event.touches[0].pageX - canvas.offsetLeft;
        y = event.touches[0].pageY - canvas.offsetTop;

    } else {
        x = event.offsetX;
        y = event.offsetY;
    }
}

function removeEmptyLine() {
    if (canvasStack === undefined) {
        return;
    }

    const prevLine = canvasStack[canvasStack.length - 1];
    if (prevLine !== undefined && prevLine.length < 3) {
        console.log(canvasStack);
        console.log(prevLine);
        canvasStack.pop();
        console.log(canvasStack);

    }
}

function startDrawing(event) {
    event.preventDefault();

    // Remove empty lines as we are drawing. Catches case where first line drawn is empty
    removeEmptyLine();
    redoStack = [];
    mouseIsDown = true;
    getCoords(event);
    context.beginPath();
    context.moveTo(x, y);

    // Create an array with objects for every new line drawn
    // Objects contain a path (array of coordinates to draw the line)
    canvasStack.push(
        [{x, y, width, colour}]
    );
    console.log("just pushed ");
    console.log([{x, y, width, colour}]);
    debugging("drawing start");

}

function draw(event) {
    if (mouseIsDown) {

        getCoords(event);
        canvasStack[canvasStack.length - 1].push({x: x, y: y, width, colour});

        // Only start drawing the line when at least 3 points for the line is obtained
        const line = canvasStack[canvasStack.length - 1];
        const numPoints = line.length;

        if (numPoints >= 3) {
            const curr = line[line.length - 1];
            const prev = line[line.length - 2];

            drawLine(prev, curr, prev.width, prev.colour);
        }

        debugging(`Coords: ${x}, ${y}`);
    }
}

function stopDrawing() {
    mouseIsDown = false;
    debugging("drawing stopped");

    // if (canvasStack === undefined) {
    //     return;
    // }
    //
    // const prevLine = canvasStack[canvasStack.length - 1];
    // if (prevLine !== undefined && prevLine.length < 3) {
    //     console.log("drawing dot");
    //     context.fillRect(x, y, 2, 2);
    // }

}

function resumeDrawing(event) {
    if (mouseIsDown) {
        startDrawing(event);

    }
}

function debugging (message) {
    debug.innerText = message;

}

function redraw(line) {

    for (let i = 1; i < line.length - 1; i++) {
        const prev = line[i];
        const curr = line[i + 1];

        // TODO: confirm whether to use prev.width or curr.width
        drawLine(prev, curr, prev.width, prev.colour);


    }
}

function undo() {

    // Do nothing if there is nothing to undo
    if (canvasStack[0] === undefined) {
        return;
    }

    // Remove empty lines as the undo button is pressed. Catches case where last line is empty
    removeEmptyLine();

    // pop the top of the `points` stack, then redraw using points[] array
    context.clearRect(0, 0, canvas.width, canvas.height);

    // redraw entire canvas except the line being undone
    for (let i = 0; i < canvasStack.length - 1; i++) {
        let line = canvasStack[i];
        context.beginPath();
        context.moveTo(line[0].x, line[0].y);

        redraw(line);
    }

    // Push undone line to redoStack`
    redoStack.push(canvasStack.pop());

    // Reset context to default
    context.lineWidth = width;
    context.strokeStyle = colour;
}

function redo() {
    // Do nothing if nothing has been undone
    if (redoStack[0] === undefined) {
        return;
    }

    let line = redoStack[redoStack.length - 1];
    context.beginPath();
    context.moveTo(line[0].x, line[0].y);
    redraw(line);
    canvasStack.push(redoStack.pop());
}

// Assumes that beginPath and moveTo have been called prior to drawLine
// draw a bezier curve between the mid point of the most recent two points
// control point is the second most recent point (2nd item on stack)
function drawLine(prev, curr, width, colour) {
    context.lineWidth = width;
    context.strokeStyle = colour;

    const avgX = (prev.x + curr.x) / 2;
    const avgY = (prev.y + curr.y) / 2;
    context.quadraticCurveTo(prev.x, prev.y, avgX, avgY);
    context.stroke();
    context.beginPath();
    context.moveTo(avgX, avgY);


}

function changeResolution(variation) {
    const scale = window.devicePixelRatio;
    let width = canvas.width / scale;
    let height = canvas.height / scale;

    if (variation === "increase") {
        debugging("increased canvas size to " + (width + 250));
        setResolution(width + 250, height + 250);

    } else {
        debugging("decreased canvas size to " + (width - 250));
        setResolution(width - 250, height - 250);
    }
}

function setResolution(width, height) {
    if (width < 0 || height < 0) {
        debugging("Could not set canvas size that small :(");
        return;
    }
    const scale = window.devicePixelRatio;
    console.log("scale was : " + scale);
    canvas.width = width * scale;
    canvas.height = height * scale;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.getContext("2d").scale(scale, scale);

    // Redraw all the elements on the page upon resize
    // reusing undo() since it redraws anyway but need padding to prevent last drawn line from
    // being removed. These get removed by removeEmptyLine() when undo/redo() is called since
    // they only contain 1 object.
    canvasStack.push([{x: 1, y: 2, width: 1, colour: "blue"}]);
    canvasStack.push([{x: 1, y: 2, width: 1, colour: "blue"}]);
    undo();
}