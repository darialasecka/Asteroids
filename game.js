const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 700;
canvas.height = 500;

const width = canvas.width;
const height = canvas.height;

setInterval(update, 1000/60);

const ship_colors = ["white", "red", "lime", "yellow", "blue"];

var ship = {
    x: width / 2,
    y: height / 2,
    radius: 15,
    angle: 90 * Math.PI / 180, //in radians degree * Math.PI / 180
    color: 0 //na razie 0, ale później wybierze użythownik //odpowiada pozycji w liście ship_colors
}

function drawSpace(){
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
}

function drawShip(){
    ctx.save();

    ctx.translate(ship.x, ship.y);
    ctx.rotate(-ship.angle); //rotates clockwise, I want counter clockwise (90-top)

    ctx.strokeStyle = ship_colors[ship.color];
    ctx.lineWidth = 2;
    ctx.beginPath();
    // top point
    ctx.moveTo(ship.radius, 0);
    //right side
    ctx.lineTo(-ship.radius, ship.radius);
    // bottom
    ctx.lineTo(-ship.radius, -ship.radius);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
}

function update(){
    drawSpace();
    drawShip();
}

