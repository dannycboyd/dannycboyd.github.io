var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var height = 0;
var width = 0;
var arbitrary = 150;
var center = {x: 0, y: 0};
var mouse = {x: 0, y: 0};
var maxSize = 100;
var squares = [];

for (var i = 0; i < 1000; i ++ ) {
    var _x = Math.random();
    var _y = Math.random();
    squares.push({
        x: _x,
        y: _y,
        size: Math.random() * maxSize
    })
}
console.log(squares);

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    height = canvas.height;
    width = canvas.width;
    center.x = width / 2;
    center.y = height / 2;

        drawStuff();
}
window.addEventListener('resize', resizeCanvas, false);
resizeCanvas();

window.addEventListener('mousemove', e => {
    mouse.x = e.layerX;
    mouse.y = e.layerY;
    drawStuff();
});
window.addEventListener('click', e => {
    mouse.x = e.layerX;
    mouse.y = e.layerY;
    drawStuff();
})

function drawStuff() {
    if(squares) {
        ctx.clearRect(0, 0, width, height);
        squares.forEach((_square) => {
            let color = colorPos(_square)
            ctx.fillStyle = color;
            square(_square);
        })
    }
}

function dist(sq) {
    let a = (Math.sqrt( Math.pow(sq.x * width - mouse.x, 2) + Math.pow(sq.y * height - mouse.y, 2) * 2)) / arbitrary;
    return a;
}

function colorPos(sq) {
    let r = Math.round(sq.x * 255);
    let g = Math.round(sq.y * 255);
    let b = Math.round(sq.size);
    let a = dist(sq);
    return `rgba(${r}, ${g}, ${b}, ${1})`
}

function square(sq) {
//    if (!s2) { s2 = s; }
//    console.log(sq);
    let ratio = dist(sq);
//    console.log(ratio);
    let side = ratio > 1 ? sq.size : ratio * sq.size;
//    let side = sq.size - (dist(sq) * sq.size);
//    console.log(sq, side);
    
    ctx.fillRect((sq.x * width) - (side/2), (sq.y * height) - (side/2), side, side);
}
