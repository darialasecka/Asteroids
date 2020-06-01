const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 700;
canvas.height = 500;

const width = canvas.width;
const height = canvas.height;

const FPS = 60;

setInterval(update, 1000/FPS);

const ship_colors = ["white", "red", "lime", "yellow", "blue"];
const ship_acceleration = 7;
const friction = 0.5;

var ship = {
    x: width / 2,
    y: height / 2,
    radius: 15,
    angle: 0, //in radians
    speed: {
        x: 0,
        y: 0
    },
    accelerating: false,

    color: 0 //na razie 0, ale później wybierze użythownik //odpowiada pozycji w liście ship_colors
};

document.addEventListener("mousemove", rotateShip);

function rotateShip(e){
    var x = e.clientX - canvas.offsetLeft - ship.x;
    var y = e.clientY - canvas.offsetTop - ship.y;
    ship.angle = Math.atan2(y, x)
}

document.addEventListener("keydown", speedUp);

function speedUp(e){
    if(e.key == "ArrowUp" || e.key == "w" || e.key == " "){ //space is temporart for tests
        ship.accelerating = true;
    }
}

document.addEventListener("keyup", slowDown);

function slowDown(e){
    if(e.key == "ArrowUp" || e.key == "w" || e.key == " ") { //chcemy, żeby spowalniał tylko jak przestajemy się ruszać
        ship.accelerating = false;
    }
}

function move() {
    if(ship.accelerating) {
        ship.speed.x += ship_acceleration * Math.cos(ship.angle) / FPS;
        ship.speed.y += ship_acceleration * Math.sin(ship.angle) / FPS;
        drawFire();
    } else {
        ship.speed.x -= friction * ship.speed.x / FPS;
        ship.speed.y -= friction * ship.speed.y / FPS;
    }

    ship.x += ship.speed.x;
    ship.y += ship.speed.y;
}

function drawFire() {
    var fire = {
        x: ship.x - ship.speed.x - 1.8 * ship.radius * Math.cos(ship.angle),
        y: ship.y - ship.speed.y - 1.8 * ship.radius * Math.sin(ship.angle),
        radius: 7,
        angle: ship.angle + Math.PI,

        color: "orange" //na razie 0, ale później wybierze użythownik //odpowiada pozycji w liście ship_colors
    };

    ctx.save();

    ctx.translate(fire.x, fire.y);
    ctx.rotate(fire.angle);

    ctx.strokeStyle = fire.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(fire.radius, 0);
    //right side
    ctx.lineTo(-fire.radius, fire.radius);
    // bottom
    ctx.lineTo(-fire.radius, -fire.radius);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
}

function drawSpace(){
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
}

function drawShip(){
    ctx.save();

    ctx.translate(ship.x, ship.y);
    ctx.rotate(ship.angle);

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

    move();

}

function update(){
    drawSpace();
    drawShip();
}

