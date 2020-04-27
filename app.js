var animate = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) { window.setTimeout(callback, 1000/60) };
var canvas = document.getElementById("canvas");
var width = 800;
var height = 600;
canvas.width = width;
canvas.height = height;
var context = canvas.getContext("2d");
var keysDown = [];
var gamemode = "pvp";
var difficulty = "easy";
var score = [0, 0];
document.getElementById("difficulty").style.display = "none";

var player = new Player();
var player2 = new Player2();
var computer = new Computer();
var ball = new Ball(400, 300);

window.onload = function() {
    animate(step);
};

var step = function() {
    update();
    render();
    animate(step);
}

var update = function() {
    if (gamemode != "controls") {
        player.update();
        if (gamemode == "pvp") {
            player2.update();
            ball.update(player.paddle, player2.paddle);
        } else if (gamemode == "pvai") {
            computer.update();
            ball.update(player.paddle, computer.paddle);
        }
    }
}

var render = function() {
    this.context.fillStyle = "black";
    this.context.fillRect(0, 0, width, height);
    this.context.fillStyle = "white";
    this.context.fillRect(width/2 - 2, 0, 5, height);
    this.context.fillStyle = "white";
    this.context.font = "2rem silkscreenNormal";
    this.context.fillText(score[1] + "   " + score[0], canvas.width/2 - 45, 30);
    player.render();
    ball.render();
    if (gamemode == "pvp") {
        player2.render();
    } else if (gamemode == "pvai") {
        computer.render();
    } else if (gamemode == "controls") {
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, width, height)
        this.context.fillStyle = "white";
        this.context.fillText("Player #1", 50, 50);
        this.context.fillText("Move Up: W", 60, 90);
        this.context.fillText("Move Down: S", 60, 130);
        this.context.fillText("Player #2", 50, 200);
        this.context.fillText("Move Up: Arrow Up", 60, 240);
        this.context.fillText("Move Down: Arrow Down", 60, 280);
    }
}

// Paddle setup
function Paddle(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.x_speed = 0;
    this.y_speed = 0;
}

Paddle.prototype.render = function() {
    context.fillStyle = "white";
    context.fillRect(this.x, this.y, this.width, this.height)
}

Paddle.prototype.move = function(x, y) {
    this.x += x;
    this.y += y;
    this.x_speed = x;
    this.y_speed = y; 
    if (this.y < 0) {
        this.y = 0;
        this.y_speed = 0;
    } else if (this.y + this.height > height) {
        this.y = height - this.height;
        this.y_speed = 0;
    }
}

// Players setup and interaction
function Player() {
    this.paddle = new Paddle(10, 270, 10, 60);
}

Player.prototype.render = function() {
    this.paddle.render();
}

Player.prototype.update = function() {
    for (var key in keysDown) {
        var value = Number(key);
        if (value == 87) {
            this.paddle.move(0, -3)
        } else if (value == 83) {
            this.paddle.move(0, 3)
        } else {
            this.paddle.move(0, 0)
        }
    }
}

function Player2() {
    this.paddle = new Paddle(780, 270, 10, 60);
}

Player2.prototype.render = function() {
    this.paddle.render();
} 

Player2.prototype.update = function() {
    for (var key in keysDown) {
        var value = Number(key);
        if (value == 38) {
            this.paddle.move(0, -3)
        } else if (value == 40) {
            this.paddle.move(0, 3)
        } else {
            this.paddle.move(0, 0)
        }
    }
}

// Computer
function Computer() {
    this.paddle = new Paddle(780, 270, 10, 60);
}

Computer.prototype.render = function() {
    this.paddle.render();
}

Computer.prototype.update = function() {
    var computerSpeed = computerNewSpeed();
    if (computerSpeed > 0) {
        computerSpeed = -computerSpeed;
    }
    if (this.paddle.y > ball.y - 30) {
        this.paddle.y += computerSpeed;
    } else if (this.paddle.y < ball.y - 20) {
        this.paddle.y -= computerSpeed;
    }
}

// Computer speed calculation
function computerNewSpeed() {
    var newSpeed;
    if (this.difficulty == "easy") {
        newSpeed = ball.y_speed * 0.80;
    } else if (this.difficulty == "medium") {
        newSpeed = ball.y_speed * 0.85;
    } else if (this.difficulty == "hard") {
        newSpeed = ball.y_speed * 0.90;
    }
    return newSpeed;
}

// Ball setup and movement
function Ball(x, y) {
    this.x = x;
    this.y = y;
    this.x_speed = newSpeed();
    this.y_speed = newSpeed();
    this.radius = 5;
}

Ball.prototype.render = function() {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
    context.fillStyle = "white";
    context.fill();
}

Ball.prototype.update = function(paddle1, paddle2) {
    this.x += this.x_speed;
    this.y += this.y_speed;
    var left_x = this.x - 5;
    var right_x = this.x + 5; 

    if (this.y - 5 < 0) { // Hitting the top wall
        this.y = 5;
        this.y_speed = -this.y_speed;  
    } else if (this.y + 5 > 600) { // Hitting the bottom wall
        this.y = 595;
        this.y_speed = -this.y_speed;
    } else if (this.x < 0 || this.x > 800) { // Hitting left or right wall
        increaseScore(this.x);
        reset();
        if (gamemode == "pvai") {
            paddle2.y = 270;
        }
    }

    if (left_x < (paddle1.x + paddle1.width) && ball.y > paddle1.y && ball.y < (paddle1.y + paddle1.height)) { // Bounce of left paddle
        this.x_speed = -this.x_speed + 0.1;
        if (this.y_speed > 0) {
            this.y_speed = this.y_speed + 0.1;
        } else {
            this.y_speed = this.y_speed - 0.1;
        }
    } else if (right_x > paddle2.x && ball.y > paddle2.y && ball.y < (paddle2.y + paddle2.height)) { // Bounce of right paddle
        this.x_speed = -this.x_speed - 0.1;
        if (this.y_speed > 0) {
            this.y_speed = this.y_speed + 0.1;
        } else {
            this.y_speed = this.y_speed - 0.1;
        }
    }
}

// Gamemode changer
pvpBtn = document.getElementById("pvpBtn");
pvpBtn.addEventListener("click", function() {
    changeGamemode("pvp");
});

pvaiBtn = document.getElementById("pvaiBtn");
pvaiBtn.addEventListener("click", function() {
    changeGamemode("pvai");
});

controlsBtn = document.getElementById("controlsBtn");
controlsBtn.addEventListener("click", function() {
    changeGamemode("controls")
});

function changeGamemode(gamemode) {
    this.gamemode = gamemode;
    this.score = [0, 0];
    reset();
    if (this.gamemode == "pvai") {
        document.getElementById("difficulty").style.display = "flex";
    } else {
        document.getElementById("difficulty").style.display = "none";
    }
}

// Change difficulty
easyBtn = document.getElementById("easyBtn")
easyBtn.addEventListener("click", function() {
    changeDifficulty("easy")
});

mediumBtn = document.getElementById("mediumBtn")
mediumBtn.addEventListener("click", function() {
    changeDifficulty("medium")
});

hardBtn = document.getElementById("hardBtn")
hardBtn.addEventListener("click", function() {
    changeDifficulty("hard")
});

function changeDifficulty(difficulty) {
    this.difficulty = difficulty;
    this.score = [0, 0];
    reset();
}

// Controlls
window.addEventListener("keydown", function(event) {
    this.keysDown[event.keyCode] = true;
});

window.addEventListener("keyup", function(event) {
    delete this.keysDown [event.keyCode];
});

// Get new ball X speed
function newSpeed() {
    var newSpeed = Math.random() * (3 - -3) -3;
    while (newSpeed < 1.5 && newSpeed > -1.5) {
    newSpeed = Math.random() * (3 - -3) -3;
    }
    return newSpeed;
}

// Reset
function reset() {
    ball.x = 400;
    ball.y = 300;
    ball.x_speed = newSpeed();
    ball.y_speed = newSpeed(); 
}

// Increase score by 1
function increaseScore(x) {
    if (x < 400) {
        this.score[0]++;
    } else {
        this.score[1]++;
    }
}