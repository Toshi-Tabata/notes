
var $force = document.querySelectorAll('#force')[0]
var $touches = document.querySelectorAll('#touches')[0]
let debug = document.getElementById("debug");
var canvas = document.querySelectorAll('canvas')[0]
var context = canvas.getContext('2d')
var lineWidth = 0
var isMousedown = false
var points = [];
let x, y;
let pressure = 0.1;

function resize() {
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
}
window.onresize = resize;

canvas.width = window.innerWidth * 2;
canvas.height = window.innerHeight * 2;

// sets the current coordinates and pressure of the mouse/touch input
function setCurrCoords(e) {

    if (e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined") {
        if (e.touches[0]["force"] > 0) {
            pressure = e.touches[0]["force"]
        }
        x = e.touches[0].pageX * 2;
        y = e.touches[0].pageY * 2;
        console.log(e.touches[0].touchType);
        debug.innerHTML = "Touch Type: " + e.touches[0].touchType;
    } else {
        pressure = 1.0;
        x = e.pageX * 2;
        y = e.pageY * 2;
    }

}

['touchstart', 'mousedown'].forEach(function (ev) {
    canvas.addEventListener(ev, function (e) {


        setCurrCoords(e);

        isMousedown = true;
        context.lineWidth = lineWidth;
        setContextStroke();
        context.beginPath();
        context.moveTo(x, y);

        points.push({
            x, y, lineWidth
        })
    })
});


['touchmove', 'mousemove'].forEach(function (ev) {
    canvas.addEventListener(ev, function (e) {
        if (!isMousedown) return;


        setCurrCoords(e);

        lineWidth = (Math.log(pressure + 1) * 40 * 0.4 + lineWidth * 0.6);
        points.push({
            x, y, lineWidth
        });
        setContextStroke();
        // context.lineWidth   = lineWidth// pressure * 50;
        // context.lineTo(x, y);
        // context.moveTo(x, y);
        if (points.length >= 3) {
            var l = points.length - 1
            var xc = (points[l].x + points[l - 1].x) / 2
            var yc = (points[l].y + points[l - 1].y) / 2
            context.lineWidth = points[l - 1].lineWidth
            context.lineTo(xc, yc);
            //context.quadraticCurveTo(points[l - 1].x, points[l - 1].y, xc, yc)
            context.stroke()
            context.beginPath()
            context.moveTo(xc, yc)
        }
        $force.innerHTML = 'force = ' + pressure
        $touches.innerHTML = 'touchev = ' + (e.touches ? JSON.stringify(e.touches[0]) : '')
        e.preventDefault()
    })
})
;['touchend', 'touchleave', 'mouseup'].forEach(function (ev) {
    canvas.addEventListener(ev, function (e) {
        setCurrCoords(e);
        isMousedown = false;
        setContextStroke();
        if (points.length >= 3) {
            var l = points.length - 1
            context.quadraticCurveTo(points[l].x, points[l].y, x, y)
            context.stroke()
        }
        let obj = points.map(function(item) {
            return `{ x: "${item.x}", y:"${item.y}", lineWidth: "${item.lineWidth}" }`

        });
        console.log(obj);

        points = [];
        lineWidth = 0;

        // TODO: on pencil up, save the object as an image or something

    })
});

// Sets the default stroke style for canvas 2D context
// i.e. default pen stroke appearance
function setContextStroke() {
    context.strokeStyle = 'black';
    context.lineCap = 'round';
    context.lineJoin = 'round';
}