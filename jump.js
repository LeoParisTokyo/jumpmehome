/**
 * JumpMeHome
 *
 * @author    Leonard MOUILLET & Julien MOREAU
 * @copyright 2018 - All rights reserved
 *
 * Last commit of this file:
 * $Id$
 */

// Constants (MS IE 8 and earlier versions do not support "const" keyword):
var ballRadius = 10;
var brickWidth = 80;
var brickHeight = 40;
var brickGap = 2;

// global properties:
var canvas;
var context;
var playerX = 75;
var playerY = 560;
var playerSpeedX = 0;
var playerSpeedY = 0;
var brickGridX = 0;
var gameSpeedX = 6;
var brickGrid = [];
var lastAdded;
var isPaused;
var endLevel = false;
var isSpeedUp = false;
var score = 0;
var gravity = 3;
var jumpY = 30;
var fall = false;

window.onload = function(){
	canvas = document.getElementById('gameCanvas');
	context = canvas.getContext('2d');

	setInterval(updateAll, 1000/30);

	document.addEventListener('keydown', keyPressed);
	canvas.addEventListener('mousedown', mouseClicked);

	gameReset();
}

function speedUp(){
	if ((gameSpeedX == 6 && score >= 25)
		|| (gameSpeedX == 7 && score >= 50)
		|| (gameSpeedX == 8 && score >= 75)
		|| (gameSpeedX == 9 && score >= 100)
		|| (gameSpeedX == 10 && score >= 125)
		|| (gameSpeedX == 11 && score >= 150)){

		gameSpeedX++;
		gravity += 0.5;
		isSpeedUp = true;
		setTimeout(function(){
			isSpeedUp = false;
		},1500);
	}
}

function updateAll(){
	moveAll();
	drawAll();
}

function moveAll(){
	if (isPaused || endLevel){
		return;
	}

	brickGridX += gameSpeedX;
	movePlayer();
	speedUp();
}

function movePlayer(){

	playerY += playerSpeedY;
	var ballIndexMin = Math.floor((playerX - ballRadius + brickGridX) / brickWidth);
	var ballIndexMax = Math.floor((playerX + ballRadius + brickGridX) / brickWidth);

	if (playerY > canvas.height){
			endLevel = true;
	}

	if (playerY < canvas.height - 50){
		playerSpeedY += gravity;
	}

	if (brickGrid[ballIndexMin] == 0 && brickGrid[ballIndexMax] == 0){
		if (playerY >= canvas.height - 50){
			playerSpeedY += gravity;
			fall = true;
		}
	} else if ((brickGrid[ballIndexMin] > 0 || brickGrid[ballIndexMax] > 0) && !fall){
		if (playerY >= canvas.height - 50){
			playerSpeedY = 0;
			playerY = canvas.height - 50;
			if (brickGrid[ballIndexMax] == 1){
				brickGrid[ballIndexMax] = 2;
				score++;
			}
		}
	}
}


function drawAll(){

	clearScreen();

	if (isPaused){
		pauseScreen();
	}
	if (endLevel){
		endScreen();
		return;
	}

	drawPlayer();

	drawBricks();

	drawScore();

	if (isSpeedUp){
		drawSpeedUpMessage();
	}
}

function clearScreen(){
	colorRect(0,0,canvas.width, canvas.height, 'black');
}

function pauseScreen(){
	context.fillStyle = 'white';
	context.font = "30px Arial";
	context.fillText('Click to continue', 280, 300);
	return;
}

function endScreen(){
	clearScreen();
	context.fillStyle = 'white';
	context.font = "30px Arial";
	context.fillText('Score: ' + score, 280, 150);
	context.fillText('Click to retry', 280, 350);
	return;
}

function drawPlayer(){
	colorCircle(playerX, playerY, ballRadius, 'white');
}

function drawScore(){
	context.fillStyle = 'white';
	context.font = "30px Arial";
	context.fillText("" + score, 100, 100);
	return;
}

function drawSpeedUpMessage(){
	context.fillStyle = 'white';
	context.font = "50px Arial";
	context.fillText('Speed Up', 400, 200);
}

function gameReset(){
	varReset();
	ballReset();
	brickReset();
}

function ballReset(){
	playerX = 100;
	playerY = canvas.height - 50;
}

function brickReset(){
	brickGrid = [2,2,2,2,2,2,2,2,2,2];
}

function varReset(){
	brickGridX = 0;
	gameSpeedX = 6;
	brickGrid = [];
	isPaused = false;
	endLevel = false;
	isSpeedUp = false;
	fall = false;
	score = 0;
	gravity = 3;
	jumpY = 30;
}

function removeBrick(){
	brickGridX -= brickWidth;
	brickGrid.shift();
}

function addBrick(){
	if (lastAdded == 0){
		brickGrid.push(1);
		lastAdded = 1;
	} else if (Math.random() < 0.5) {
		brickGrid.push(0);
		lastAdded = 0;
	} else {
		brickGrid.push(2);
		lastAdded = 2;
	}
}

function drawBricks(){
	for (var i = brickGrid.length; i >= 0; i--){
		var pos = Math.floor(((brickWidth * i) - brickGridX) / 80) + 1;
		if (pos <= -1){
			removeBrick(); //remove element from array when it leaves the screen
			addBrick(); //add new element to array
		}
		if (pos >= 0 && pos < 6){  // only draw inside of the screen
			if (brickGrid[i]){
				colorRect((brickWidth * i) - brickGridX,canvas.height  - brickHeight, brickWidth - brickGap, brickHeight - brickGap, 'blue');
				context.font = "20px Arial";
				colorText("" + pos, (brickWidth * i) - brickGridX + brickWidth/2, canvas.height  - brickHeight / 2, 'white');
			}
		}
	}
}

function jump(){
	playerSpeedY -= jumpY;
}

function keyPressed(evt){
	//console.log(evt.keyCode);
	//if (evt.keyCode == 32){
		if (playerY == canvas.height - 50){
			jump();
		}

	//}
}

function mouseClicked(evt){
	if (endLevel){
		gameReset();
	} else if (isPaused){
		isPaused = false;
	} else {
		isPaused = true;
	}
}

function colorRect(topLeftX, topLeftY, width, height, color){
	context.fillStyle = color;
	context.fillRect(topLeftX, topLeftY, width, height);

}

function colorCircle(centerX, centerY, radius, color){
	context.fillStyle = color;
	context.beginPath();
	context.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
	context.fill();
}

function colorText(text, textX, textY, color){
	context.fillStyle = color;
	context.fillText(text, textX, textY);
}

// vim: set noexpandtab tabstop=4 shifwidth=4
