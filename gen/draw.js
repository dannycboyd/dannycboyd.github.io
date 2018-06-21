var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var height = 0;
var width = 0;
var arbitrary = 0;
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
    arbitrary = (height + width) / 2;

        /**
         * Your drawings need to be inside this function otherwise they will be reset when
         * you resize the browser window and the canvas goes will be cleared.
         */
        drawStuff();
}
window.addEventListener('resize', resizeCanvas, false);
resizeCanvas();

window.addEventListener('mouseMove', e => {
    console.log(e);

    mouse.x = e.layerX;
    mouse.y = e.layerY;
    drawStuff();
});
window.addEventListener('click', e => {
    console.log(e);
    mouse.x = e.layerX;
    mouse.y = e.layerY;
    drawStuff();
})

function drawStuff() {
    // console.log(squares);
    if(squares) {
        ctx.clearRect(0, 0, width, height);
        squares.forEach((_square) => {
            let color = colorPos(_square)
            ctx.fillStyle = color;
            square(_square.x * width, _square.y * height, _square.size);
        })
    }
}

function dist(sq) {
    // console.log(sq, mouse);
    let h = (Math.sqrt( Math.pow(sq.x * width - mouse.x, 2) + Math.pow(sq.y * height - mouse.y, 2) * 2));
    console.log(h);
    return h / arbitrary;
}

function colorPos(sq) {
    let r = Math.round(sq.x * 255);
    let g = Math.round(sq.y * 255);
    let b = Math.round(sq.size);
    let a = dist(sq);
    // console.log(r, g, b, a);
    return `rgba(${r}, ${g}, ${b}, ${a})`
}

function square(x, y, s, s2 = null) {
    if (!s2) {
        s2 = s;
    }
    // console.log(x, y, s);
    ctx.fillRect(x - (s/2), y - (s2/2), s, s2);
}
