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
const MAX_SPEED = 17;
const MAX_EXPLOSION_TIME = FPS;
const INVISIBILITY_FRAMES = FPS * 6;

var ship;
newShip();

//asteroids
const asteroidSpeed = 50;
const asteroidSize = 50;
const maxSides = 25;
const minSides = 5;

var asteroids = [];
createMultipleAsteroids(5);

//bullets
const MAX_BULLETS = 4;
const bulletSpeed = 17;
const MAX_DISTANCE = 420;

// ===================== space =====================

function drawSpace(){
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
}

// ===================== ship =====================

function newShip(){
    ship = {
        x: width / 2,
        y: height / 2,
        radius: 15,
        angle: 0, //in radians
        speed: {
            x: 0,
            y: 0
        },
        accelerating: false,
        dead: false,
        explosionTime: MAX_EXPLOSION_TIME,
        invisibility: INVISIBILITY_FRAMES,
        canShoot: true,
        bullets: [],

        color: 0 //na razie 0, ale później wybierze użythownik //odpowiada pozycji w liście ship_colors
    };

}


document.addEventListener("mousemove", rotateShip);

function rotateShip(e){
    var x = e.clientX - canvas.offsetLeft - ship.x;
    var y = e.clientY - canvas.offsetTop - ship.y;
    ship.angle = Math.atan2(y, x)
}

document.addEventListener("keydown", speedUpAndShoot);

function speedUpAndShoot(e){
    if(e.key == "ArrowUp" || e.key == "w"){ //space is temporart for tests
        ship.accelerating = true;
    }
    if(e.key == " " && ship.canShoot){
        shoot();
    }
}

document.addEventListener("keyup", slowDown);

function slowDown(e){
    if(e.key == "ArrowUp" || e.key == "w") { //chcemy, żeby spowalniał tylko jak przestajemy się ruszać
        ship.accelerating = false;
    }
    if( e.key == " "){
        ship.canShoot = true;
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
        if(Math.abs(ship.speed.x) < MAX_SPEED) ship.speed.x += ship_acceleration * Math.cos(ship.angle) / FPS;
        if(Math.abs(ship.speed.y) < MAX_SPEED) ship.speed.y += ship_acceleration * Math.sin(ship.angle) / FPS;
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

    if(ship.dead) {
        explosion();
        ship.explosionTime--;
    }
    else move();
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
        } while (asteroidCollides(x, y, ship.x, ship.y, asteroidSize * 3 + ship.radius)); //asteroids won't spawn in ship and too close to it
        asteroids.push(newAsteroid(x, y));
    }
}

function asteroidCollides(x1, y1, x2, y2, spacing){
    //distance beetween 2 points
    var distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
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

function moveAsteroid(asteroid){
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
    for(var i = asteroids.length - 1; i >= 0; i--){
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

        moveAsteroid(ast);

        //ship collision
        //giving player a chance to run away when spawning in rock
        if (ship.invisibility == 0) {//invisibility frames won't count for first live
            if (asteroidCollides(ast.x, ast.y, ship.x, ship.y, asteroidSize + ship.radius)) {
                ship.dead = true;
            }
        } else {
            ship.invisibility--;
        }
        //bullets collision
        for(var j = ship.bullets.length - 1; j >= 0 ; j--){
            var bullet = ship.bullets[j];
            if(asteroidCollides(ast.x, ast.y, bullet.x, bullet.y, asteroidSize + bullet.radius)){
                ship.bullets.splice(j, 1);
                asteroids.splice(i, 1);
            }
        }
    }
}

// ===================== bullets =====================

function newBullet(x, y){
    bullet = {
        x: x + ship.radius * Math.cos(ship.angle), //start from ship front
        y: y + ship.radius * Math.sin(ship.angle),
        radius: 2.5,
        speed: {
            x: bulletSpeed * Math.cos(ship.angle),
            y: bulletSpeed * Math.sin(ship.angle)
        },
        distance: MAX_DISTANCE
    }
    return bullet;
}


function shoot(){
    if(ship.bullets.length < MAX_BULLETS){
        ship.bullets.push(newBullet(ship.x, ship.y));
    }

    ship.canShoot = false;
}

function moveBullet(bullet){
    if(bullet.x + bullet.radius < 0) {
        bullet.x = width + bullet.radius;
    } else if (bullet.x - bullet.radius > width) {
        bullet.x = 0;
    }

    if(bullet.y + bullet.radius < 0) {
        bullet.y = height + bullet.radius;
    } else if (bullet.y - bullet.radius > height) {
        bullet.y = 0;
    }

    bullet.x += bullet.speed.x;
    bullet.y += bullet.speed.y;

    bullet.distance -= Math.sqrt(Math.pow(bullet.speed.x, 2) + Math.pow(bullet.speed.y, 2));
}

function drawBullets(){
    for(var i = ship.bullets.length - 1; i >= 0; i--){
        var bullet = ship.bullets[i];

        ctx.save();
        ctx.translate(bullet.x, bullet.y);

        ctx.fillStyle = ship_colors[ship.color]; //have the same color as ship
        ctx.beginPath();
        ctx.arc(0, 0, bullet.radius, 0, Math.PI * 2, true);
        ctx.fill();

        ctx.restore();

        moveBullet(bullet);

        if(bullet.distance < 0) {
            ship.bullets.splice(i, 1);
        }
    }
}


function update(){
    drawSpace();
    drawShip();
     if(ship.explosionTime == 0){
        newShip();
        console.log("-1 <3");
    }
    if(asteroids.length == 0){
        console.log("WIN!");
    }
    drawAsteroids();
    drawBullets();
}

