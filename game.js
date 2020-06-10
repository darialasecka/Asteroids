const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 700;
canvas.height = 500;

const width = canvas.width;
const height = canvas.height;

const FPS = 60;

//ship
const ship_colors = ["white", "red", "lime", "yellow", "blue"];
var choosen_color = 0;
const ship_acceleration = 7;
const friction = 0.5;
const MAX_SPEED = 17;
const MAX_EXPLOSION_TIME = FPS;
const BLINK_TIME = 6;
const INVISIBILITY_FRAMES = 15;
const STARTING_LIVES = 3;

var ship;

//asteroids
const pointsTable = [100, 50, 20];
const asteroidSpeed = 50;
const asteroidSize = 30;
const avgSides = 15;
const avgOffset = 15;
const MAX_AST_LIVES = 3;
const BASE_AST_NUM = 4;

var asteroids = [];

//bullets
const MAX_BULLETS = 4;
const bulletSpeed = 17;
const MAX_DISTANCE = 420;

//game
const LEVEL_TIME = 30;
var points = 0;
var pointsToNextLive = 0;

//menu
var inMenu = true;
var inOptions = false;
var inInformations = false;

// ===================== space =====================

function drawSpace(){
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
}

// ===================== ship =====================

function newShip(lives, invisibility){
    ship = {
        x: width / 2,
        y: height / 2,
        radius: 15,
        angle: -Math.PI/2, //in radians
        speed: {
            x: 0,
            y: 0
        },
        accelerating: false,
        exploded: false,
        explosionTime: MAX_EXPLOSION_TIME,
        invisibility: INVISIBILITY_FRAMES,
        canShoot: true,
        bullets: [],
        blinkTime: BLINK_TIME,
        invisibility: invisibility,
        lives: lives,

        color: choosen_color
    };
}


document.addEventListener("mousemove", rotateShip);

function rotateShip(e){
    if(!inMenu){
    var x = e.clientX - canvas.offsetLeft - ship.x;
        var y = e.clientY - canvas.offsetTop - ship.y;
        ship.angle = Math.atan2(y, x)
    }
}

document.addEventListener("keydown", speedUpAndShoot);

function speedUpAndShoot(e){
    if(!inMenu) {
        if(e.key == "ArrowUp" || e.key == "w"){ //space is temporart for tests
            ship.accelerating = true;
        }
        if(e.key == " " && ship.canShoot && !ship.exploded){
            shoot();
        }

    } else {
        // menu
        switch(e.key){
            case "ArrowUp":
                if(inOptions) {
                    menuPosition --;
                    if(menuPosition > menuOptions.length - 1) menuPosition = 0;
                    else if (menuPosition < 0) menuPosition = menuOptions.length - 1;
                    drawOptions();
                } else if( inInformations) {
                    //do nothing
                } else {
                    menuPosition --;
                    if(menuPosition > menu.length - 1) menuPosition = 0;
                    else if (menuPosition < 0) menuPosition = menu.length - 1;
                    drawMainMenu();
                }
                break;

            case "ArrowDown":
                if(inOptions) {
                    menuPosition ++;
                    if(menuPosition > menuOptions.length - 1) menuPosition = 0;
                    else if (menuPosition < 0) menuPosition = menuOptions.length - 1;
                    drawOptions();
                } else if( inInformations) {
                    //do nothing
                } else {
                    menuPosition ++;
                    if(menuPosition > menu.length - 1) menuPosition = 0;
                    else if (menuPosition < 0) menuPosition = menu.length - 1;
                    drawMainMenu();
                }
                break;

            case "Enter":
                if(inOptions) {
                    menuPosition = 0;
                    inOptions = false;
                    drawMainMenu();
                } else if (inInformations) {
                    //do nothing
                } else {
                    switch(menuPosition) {
                        case 0:
                            inMenu = false;
                            newGame();
                            break;
                        case 1:
                            inOptions = true;
                            menuPosition = 0;
                            drawOptions();
                            break;
                        case 2:
                            inInformations = true;
                            menuPosition = 0;
                            drawInformations();
                            break;
                    }
                }
                break;
            case "ArrowRight":
                if(inOptions && menuPosition == 0){
                    choosen_color ++;
                    if(choosen_color > ship_colors.length - 1) choosen_color = 0;
                    else if (choosen_color < 0) choosen_color = ship_colors.length - 1;
                    drawOptions();
                }
                break;
            case "ArrowLeft":
                if(inOptions && menuPosition == 0){
                    choosen_color --;
                    if(choosen_color > ship_colors.length - 1) choosen_color = 0;
                    else if (choosen_color < 0) choosen_color = ship_colors.length - 1;
                    drawOptions();
                }
                break;

        }
        console.log(menuPosition);
    }
}

document.addEventListener("keyup", slowDown);

function slowDown(e){
    if(!inMenu) {
        if(e.key == "ArrowUp" || e.key == "w") { //chcemy, żeby spowalniał tylko jak przestajemy się ruszać
            ship.accelerating = false;
        }
        if( e.key == " "){
            ship.canShoot = true;
        }
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
        asteroids.push(newAsteroid(x, y, asteroidSize, MAX_AST_LIVES));
    }
}

function asteroidCollides(x1, y1, x2, y2, spacing){
    //distance beetween 2 points
    var distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    return distance < spacing ? true : false;

}

function newAsteroid(x, y, radius, lives) {
    var levelMultiplayer = 1 + 0.1 * level;
    var asteroid = {
        x: x,
        y: y,
        speed: {
            x: Math.random() * asteroidSpeed / FPS * (Math.random() < 0.5 ? 1 : -1) * levelMultiplayer,
            y: Math.random() * asteroidSpeed / FPS * (Math.random() < 0.5 ? 1 : -1) * levelMultiplayer
        },
        radius: radius,
        angle: Math.random() * Math.PI * 2,
        sides: Math.floor(Math.random() * avgSides + avgSides / 2),
        offset: [],
        lives: lives,
        points: pointsTable[lives - 1]
    };
    for(var i = 0; i < asteroid.sides; i++){
        asteroid.offset.push(Math.floor(Math.random() * avgOffset + avgOffset / 2));
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

function destroyAsteroid(index) {
    var asteroid = asteroids[index];

    if(asteroid.lives != 1) {
        asteroids.push(newAsteroid(asteroid.x, asteroid.y, Math.ceil(asteroid.radius / 3), asteroid.lives - 1));
        asteroids.push(newAsteroid(asteroid.x, asteroid.y, Math.ceil(asteroid.radius / 2), asteroid.lives - 1));
    }
    points += asteroid.points;
    pointsToNextLive += asteroid.points;
    console.log(points);
    if(pointsToNextLive >= 10000){
        pointsToNextLive -= 10000;
        ship.lives++;
    }
    asteroids.splice(index, 1);
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
        if (ship.invisibility == 0 && !ship.exploded) {//invisibility frames won't count for first live
            if (asteroidCollides(ast.x, ast.y, ship.x, ship.y, asteroidSize + ship.radius)) {
                ship.exploded = true;
                destroyAsteroid(i);
                break;
            }
        }

        //bullets collision
        for(var j = ship.bullets.length - 1; j >= 0 ; j--){
            var bullet = ship.bullets[j];
            if(asteroidCollides(ast.x, ast.y, bullet.x, bullet.y, asteroidSize + bullet.radius)){
                ship.bullets.splice(j, 1);
                destroyAsteroid(i);
                break; //if asteroid breaks theres no point to check other buletts
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

// ===================== UI =====================

function drawLives(){
    for(var i = 0; i < ship.lives; i++){
        ctx.save();

        ctx.translate(15 + (ship.radius + 5) * i, 50);
        ctx.rotate(-90 * Math.PI / 180);

        ctx.strokeStyle = ship_colors[ship.color];
        ctx.lineWidth = 1;
        ctx.beginPath();
        // top point
        ctx.moveTo(ship.radius / 2, 0);
        //right side
        ctx.lineTo(-ship.radius / 2, ship.radius / 2);
        // bottom
        ctx.lineTo(-ship.radius / 2, -ship.radius / 2);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
    }
}

function showPoints(){
    ctx.save();
    //ctx.translate(15 + (points.toString().length * 3), 30);
    ctx.fillStyle = "white";
    ctx.font = "20px Courier";
    ctx.textAlign = 'left';
    ctx.fillText(points, 10, 30);
    ctx.restore();
}

// ===================== GAME =====================

var level = 1;
var levelAlpha = 1.0;
var interval;

function newGame(){
    newShip(STARTING_LIVES, 0);
    createMultipleAsteroids(BASE_AST_NUM + level);
    if(!interval) interval = setInterval(update, 1000/FPS);
    //showLevel();

}

function showLevel(){
    ctx.fillStyle = "rgba(255, 255, 255, " + levelAlpha + ")";
    ctx.font = "40px Arial";
    ctx.textAlign = 'center';
    ctx.fillText("Level " + level, width/2, height / 2);
}

function update(){
    drawSpace();
    drawAsteroids();
    drawBullets();
    drawLives();
    showPoints();

    // ship blinks if have invisibility_frames
    var invisible = ship.invisibility % 2 == 1;

    if(!invisible)  drawShip();

    if (ship.invisibility > 0) {
        ship.blinkTime--;
        if (ship.blinkTime == 0) {
            ship.invisibility--;
            ship.blinkTime = BLINK_TIME;
        }
    }

    // moves ship or shows explosion
    if(ship.exploded) {
        explosion();
        ship.explosionTime--;
    }
    else move();

    // new life or game over
     if(ship.explosionTime == 0){
        newShip(--ship.lives, INVISIBILITY_FRAMES);
        if(ship.lives < 0){
            console.log("GAME OVER");
            newShip(STARTING_LIVES, 0);
        }
    }
    // win
    if(asteroids.length == 0){
        levelAlpha = 1.0;
        level++;
        newGame();
    }

    //show level
    if(levelAlpha >= 0){
        showLevel();
        levelAlpha -= (1.0 / LEVEL_TIME);
    }
}

//newGame();

// ===================== MENU =====================

var menu = ["New Game", "Options", "Controls & UI"];
var menuOptions = ["Color", "Exit"];

var menuPosition = 2; //changing for tests - default 0

function drawMainMenu() {
    drawSpace();

    newShip(STARTING_LIVES, 0); //for menu purposes

    ctx.save();
    ctx.translate(width / 2, 80);
    ctx.fillStyle = "white";
    ctx.font = "bold 50px Courier";
    ctx.textAlign = 'center';
    ctx.fillText("ASTEROIDS", 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.fillStyle = "white";
    ctx.font = "25px Courier";
    ctx.textAlign = 'center';
    var option = menu[0];
    if(menuPosition == 0){
        option = "> " + option + " <";
    }
    ctx.fillText(option, 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(width / 2, height / 2 + 60);
    ctx.fillStyle = "white";
    ctx.font = "25px Courier";
    ctx.textAlign = 'center';
    option = menu[1];
    if(menuPosition == 1){
        option = "> " + option + " <";
    }
    ctx.fillText(option, 0, 0);
    ctx.restore();

    //TODO: add informations about UI
    ctx.save();
    ctx.translate(width / 2, height / 2 + 120);
    ctx.fillStyle = "white";
    ctx.font = "25px Courier";
    ctx.textAlign = 'center';
    option = menu[2];
    if(menuPosition == 2){
        option = "> " + option + " <";
    }
    ctx.fillText(option, 0, 0);
    ctx.restore();


    //TODO: add credits
}

function drawOptions(){
    drawSpace();

    ctx.save();
    ctx.translate(width / 2, 50);
    ctx.fillStyle = "white";
    ctx.font = "bold 50px Courier";
    ctx.textAlign = 'center';
    ctx.fillText("OPTIONS", 0, 30);
    ctx.restore();

    ctx.save();
    ctx.translate(width / 2, height / 2 - 70);
    ctx.fillStyle = "white";
    ctx.font = "20px Courier";
    ctx.textAlign = 'center';
    ctx.fillText("Choose color of your ship", 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(width / 2, height / 2 - 45);
    ctx.fillStyle = "white";
    ctx.font = "20px Courier";
    ctx.textAlign = 'center';
    ctx.fillText("and your buletts:", 0, 0);
    ctx.restore();

    //newShip(0, 0); // exists just for colour selections
    drawShip();

    ctx.save();
    ctx.translate(width / 2, height / 2 + 70);
    ctx.fillStyle = ship_colors[choosen_color];
    ctx.font = "20px Courier";
    ctx.textAlign = 'center';
    var option = ship_colors[choosen_color];
    if(menuPosition == 0){
        option = "< " + option + " >"
    }
    ctx.fillText(option, 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(width / 2, height / 2 + 120);
    ctx.fillStyle = "white";
    ctx.font = "20px Courier";
    ctx.textAlign = 'center';
    option = menuOptions[1];
    if(menuPosition == 1){
        option = "> " + option + " <";
    }
    ctx.fillText(option, 0, 0);
    ctx.restore();
}

//TODO: high score

function drawInformations() {
    drawSpace();

    showPoints();
    //newShip(STARTING_LIVES, 0);
    drawLives();


    ctx.save();
    ctx.translate(width / 2, 80);
    ctx.fillStyle = "white";
    ctx.font = "bold 50px Courier";
    ctx.textAlign = 'center';
    //ctx.fillText("CONTROLS & UI", 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(80, 25);
    ctx.fillStyle = "white";
    ctx.font = "15px Courier";
    ctx.textAlign = 'left';
    ctx.fillText("<-- your points", 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(80, 55);
    ctx.fillStyle = "white";
    ctx.font = "15px Courier";
    ctx.textAlign = 'left';
    ctx.fillText("<-- your lives", 0, 0);
    ctx.restore();

    //TODO: PURPOUSE OF GAME AND INSTRUCTIONS
    ctx.save();
    ctx.translate(width / 2, 120);
    ctx.fillStyle = "white";
    ctx.font = "25px Courier";
    ctx.textAlign = 'center';
    ctx.fillText("Controls", 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(width / 2, 170);
    ctx.fillStyle = "white";
    ctx.font = "15px Courier";
    ctx.textAlign = 'center';
    ctx.fillText("Mouse - rotating", 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(width / 2, 195);
    ctx.fillStyle = "white";
    ctx.font = "15px Courier";
    ctx.textAlign = 'center';
    ctx.fillText("Spacebar - shooting", 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(width / 2, 220);
    ctx.fillStyle = "white";
    ctx.font = "15px Courier";
    ctx.textAlign = 'center';
    ctx.fillText("W / Arrow Up - accelerating", 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(width / 2, 265);
    ctx.fillStyle = "white";
    ctx.font = "15px Courier";
    ctx.textAlign = 'center';
    ctx.fillText("Your goal is to get as many points as you can.", 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(width / 2, 280);
    ctx.fillStyle = "white";
    ctx.font = "15px Courier";
    ctx.textAlign = 'center';
    ctx.fillText("Destroying asteroids get points.", 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(width / 2, 295);
    ctx.fillStyle = "white";
    ctx.font = "15px Courier";
    ctx.textAlign = 'center';
    ctx.fillText("You start with 3 lives, but every 10 000 points you get another life.", 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(width / 2, height / 2 + 120);
    ctx.fillStyle = "white";
    ctx.font = "25px Courier";
    ctx.textAlign = 'center';
    ctx.fillText("> Exit <", 0, 0);
    ctx.restore();
}


drawMainMenu();