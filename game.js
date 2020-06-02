const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 700;
canvas.height = 500;

const width = canvas.width;
const height = canvas.height;

const FPS = 60;

setInterval(update, 1000/FPS);

//ship
const ship_colors = ["white", "red", "lime", "yellow", "blue"];
const ship_acceleration = 7;
const friction = 0.5;
const MAX_SPEED = 20;

//asteroids
const asteroidSpeed = 50;
const asteroidSize = 50;
const maxSides = 25;
const minSides = 5;

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

var asteroids = [];
createMultipleAsteroids(5);

// ===================== space =====================

function drawSpace(){
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
}

// ===================== ship =====================

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
    if(ship.x + ship.radius < 0) {
        ship.x = width + ship.radius;
    } else if (ship.x - ship.radius > width) {
        ship.x = 0;
    }

    if(ship.y + ship.radius < 0) {
        ship.y = height + ship.radius;
    } else if (ship.y - ship.radius > height) {
        ship.y = 0;
    }


    if(ship.accelerating) {
            if(ship.speed.x < MAX_SPEED) ship.speed.x += ship_acceleration * Math.cos(ship.angle) / FPS;
            if(ship.speed.y < MAX_SPEED) ship.speed.y += ship_acceleration * Math.sin(ship.angle) / FPS;
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

function explosion(){
    var explosion = ctx.createRadialGradient(ship.x, ship.y, 3, ship.x, ship.y, ship.radius * 1.6);
    explosion.addColorStop(0, "white");
    explosion.addColorStop(0.25, "yellow");
    explosion.addColorStop(0.5, "orange");
    explosion.addColorStop(0.75, "red");
    explosion.addColorStop(1, "firebrick");

    ctx.fillStyle = explosion;
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.radius * 1.6, 0, Math.PI *2, true);
    ctx.fill();
}

// ===================== asteroids =====================

function createMultipleAsteroids(astCount) {
    asteroids = [];
    for(var i = 0; i < astCount; i++){
        do {
            var x = Math.random() * width;
            var y = Math.random() * height;
        } while (asteroidInShip(x, y, asteroidSize * 3 + ship.radius)); //asteroids won't spawn in ship and too close to it
        asteroids.push(newAsteroid(x, y));
    }
}

function asteroidInShip(x, y, spacing){
    //distance beetween 2 points
    var distance = Math.sqrt(Math.pow(ship.x - x, 2) + Math.pow(ship.y - y, 2));
    return distance < spacing ? true : false;

}

function newAsteroid(x, y) {
    var asteroid = {
        x: x,
        y: y,
        speed: {
            x: Math.random() * asteroidSpeed / FPS * (Math.random() < 0.5 ? 1 : -1),
            y: Math.random() * asteroidSpeed / FPS * (Math.random() < 0.5 ? 1 : -1)
        },
        radius: asteroidSize,
        angle: Math.random() * Math.PI * 2,
        sides: Math.floor(Math.random() * (maxSides - minSides)) + minSides,
        offset: []
    };
    for(var i = 0; i < asteroid.sides; i++){
        asteroid.offset.push(Math.floor(Math.random() * 20) - 10);
    }

    return asteroid;
}

function moveAsteroids(asteroid){
    if(asteroid.x + asteroid.radius < 0) {
        asteroid.x = width + asteroid.radius;
    } else if (asteroid.x - asteroid.radius > width) {
        asteroid.x = 0;
    }

    if(asteroid.y + asteroid.radius < 0) {
        asteroid.y = height + asteroid.radius;
    } else if (asteroid.y - asteroid.radius > height) {
        asteroid.y = 0;
    }

    asteroid.x += asteroid.speed.x;
    asteroid.y += asteroid.speed.y;
}

function drawAsteroids() {

    ctx.strokeStyle = "grey";
    ctx.lineWidth = 2;
    for(var i = 0; i < asteroids.length; i++){
        var ast = asteroids[i];
        ctx.save();
        ctx.translate(ast.x, ast.y);
        ctx.beginPath();
        ctx.moveTo((ast.radius + ast.offset[0]) * Math.cos(ast.angle), (ast.radius + ast.offset[0]) * Math.sin(ast.angle));
        for (var j = 1; j < ast.sides; j++) {
            ctx.lineTo(
                (ast.radius + ast.offset[j]) * Math.cos(ast.angle + j * Math.PI * 2 / ast.sides),
                (ast.radius + ast.offset[j]) * Math.sin(ast.angle + j * Math.PI * 2 / ast.sides)
            );
        }
        ctx.closePath();
        ctx.stroke();

        ctx.restore();

        moveAsteroids(ast);

        if(asteroidInShip(ast.x, ast.y, asteroidSize + ship.radius)) {
            console.log("Ded");
            explosion();
        }
    }

}


function update(){
    drawSpace();
    drawShip();
    drawAsteroids();
}

