var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

canvas.width = window.innerWidth
canvas.height = window.innerHeight;
var W = canvas.width;
var H = canvas.height;
document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

let tank1 = new Image();
tank1.src = "./tanks/tank1.png";
let tank2 = new Image();
tank2.src = "./tanks/tank2.png";

var explosion1 = new Image();
explosion1.src = "./tanks/tile000.png";
var explosion2 = new Image();
explosion2.src = "./tanks/tile001.png";
var explosion3 = new Image();
explosion3.src = "./tanks/tile002.png";
var explosion4 = new Image();
explosion4.src = "./tanks/tile003.png";
var explosion5 = new Image();
explosion5.src = "./tanks/tile004.png";
var explosion6 = new Image();
explosion6.src = "./tanks/tile005.png";
var explosion7 = new Image();
explosion7.src = "./tanks/tile006.png";
var explosion8 = new Image();
explosion8.src = "./tanks/tile007.png";
var explosion9 = new Image();
explosion9.src = "./tanks/tile008.png";
var explosion10 = new Image();
explosion10.src = "./tanks/tile009.png";
var explosion11 = new Image();
explosion11.src = "./tanks/tile010.png";
var explosion12 = new Image();
explosion12.src = "./tanks/tile011.png";
var explosion13 = new Image();
explosion13.src = "./tanks/tile012.png";
var explosion14 = new Image();
explosion14.src = "./tanks/tile013.png";
var explosion15 = new Image();
explosion15.src = "./tanks/tile014.png";
var explosion16 = new Image();
explosion16.src = "./tanks/tile015.png";

let animations = [];

let upPressed = false;
let downPressed = false;
let leftPressed = false;
let rightPressed = false;
let zeroPressed = false;
let wPressed = false;
let sPressed = false;
let aPressed = false;
let dPressed = false;
let spacePressed = false;
let bullets = [];
let walls = [];
let joysticks = {};
let shoot_time_frame = 1000;
let shoot_cooldown=1000;

/*_=======_=======_=======_=======_=======_=======_=======_=======_=======__*/

class Vector {
	constructor(x, y) {
		this.x = x; this.y = y
	}

	add(v) {
		return new Vector(this.x + v.x, this.y + v.y)
	}

	sub(v) {
		return new Vector(this.x - v.x, this.y - v.y)
	}

	mult(d) {
		return new Vector(this.x * d, this.y * d)
	}

	dot(v) {
		return this.x * v.x + this.y * v.y
	}

	get norm() {
		return new Vector(this.x / this.length, this.y / this.length)
	}

	get copy() {
		return new Vector(this.x, this.y)
	}

	get length() {
		return Math.hypot(this.x, this.y)
	}

	rotate(a) {
		let x = this.x; let y = this.y
		this.x = x * cos(a) + y * sin(a)
		this.y = -x * sin(a) + y * cos(a)
	}

	draw(cx = ctx, color = "black", radius) {
		cx.fillStyle = color
		cx.beginPath()
		cx.lineCap = "round";
		cx.arc(this.x, this.y, radius || 1, 0, 2 * Math.PI)
		cx.fill()
		cx.closePath()
	}
}

/*_=======_=======_=======_=======_=======_=======_=======_=======_=======__*/

class Joystick {
	constructor(id, x, y, active = true, fire = false) {
		this.id = id; this.active = active; this.fire = fire;
		this.pos = new Vector(x, y)
		this._touch = new Vector(x, y)
		this._vector = new Vector(0, 0)
	}

	set touch(vec) {
		this._touch = vec
		let v = this._touch.sub(this.pos)
		if (v.length > 40) {
			this.fire = true;
			v = v.norm.mult(40)
			this._touch = this.pos.add(v)
		} else { this.fire = false; } this._vector = v;

	}
	get vector() { return this._vector }

	draw(cx = ctx) {
		if (this.active) {
			let p = this.pos; let t = this._touch
			cx.strokeStyle = "black"
			cx.beginPath()
			cx.arc(p.x, p.y, 40, 0, 2 * Math.PI); cx.stroke()
			cx.closePath(); cx.beginPath()
			cx.arc(t.x, t.y, 20, 0, 2 * Math.PI); cx.stroke()
			cx.closePath()
			if (this.info) {
				cx.save();
				cx.translate(p.x, p.y);
				cx.font = "12px Helivicia"
				cx.textAlign = "center"
				cx.textBaseline = "middle"
				cx.fillStyle = "black"
				cx.rotate(Math.PI / 2);
				cx.fillText(this.info, 0, 0);
				cx.restore();
			}
		}
	}
}

/*_=======_=======_=======_=======_=======_=======_=======_=======_=======__*/


const touch_start = e => {
	
	let touches = e.changedTouches
	for (let j = 0; j < touches.length; j++) {
		let i = touches[j].clientY < H / 2 ? 0 : 1
		joysticks["$" + i] = new Joystick(
			touches[j].identifier,
			touches[j].clientX, touches[j].clientY
		); joysticks["$" + i].info = i == 1 ? "look" : "move"
	}
}

/*_=======_=======_=======_=======_=======_=======_=======_=======_=======__*/

const touch_move = e => {
	let c = e.changedTouches
	for (let j = 0; j < c.length; j++) {
		for (let i in joysticks) {
			if (c[j].identifier == joysticks[i].id) {

				joysticks[i].touch = new Vector(c[j].clientX, c[j].clientY)
			}
		}
	}

}

/*_=======_=======_=======_=======_=======_=======_=======_=======_=======__*/

const touch_end = e => {
	let c = e.changedTouches

	for (let j = 0; j < c.length; j++) {
		for (let i in joysticks) {
			if (c[j].identifier == joysticks[i].id &&
				joysticks[i].active) {
				joysticks[i].active = false
				if (i == "$1") {

					target_ray = null
				}
			}
		}
	}
}

/*_=======_=======_=======_=======_=======_=======_=======_=======_=======__*/

const touch_cancel = e => {
	touch_end(e)
}

/*_=======_=======_=======_=======_=======_=======_=======_=======_=======__*/

const add_event_listeners = () => {
	window.addEventListener("touchstart", touch_start)
	window.addEventListener("touchmove", touch_move)
	window.addEventListener("touchend", touch_end)
	window.addEventListener("touchcancel", touch_cancel)
}
add_event_listeners();

/*_=======_=======_=======_=======_=======_=======_=======_=======_=======__*/

const draw_joysticks = () => {

	for (let i in joysticks)
		joysticks[i].draw();
}

/*_=======_=======_=======_=======_=======_=======_=======_=======_=======__*/
/*_=======_=======_=======_=======_=======_=======_=======_=======_=======__*/

function XY(x,y) {
	this.x = x;
	this.y = y;

}
function playSound(source) {
	let sound = new Audio();
	sound.src = source;
	sound.play();
}

function Polygon(vertices, edges) {
	this.vertices = vertices;
	this.edges = edges;
}
function Animation(type,x,y) {
	this.type = type;
	this.x = x;
	this.y = y;
	this.stopIt = 16;
	this.startIt = 0;
	this.animationDelay = 0;
}

function drawAnimations() {
	for(let a = 0; a<animations.length; a++){
		if(animations[a].type ==1){
			if(animations[a].startIt == 0){
				ctx.drawImage(explosion1, animations[a].x, animations[a].y);
			}
			if (animations[a].startIt == 1) {
				ctx.drawImage(explosion2, animations[a].x, animations[a].y);
			}
			if (animations[a].startIt == 2) {
				ctx.drawImage(explosion1, animations[a].x, animations[a].y);
			}
			if (animations[a].startIt == 3) {
				ctx.drawImage(explosion3, animations[a].x, animations[a].y);
			}
			if (animations[a].startIt == 4) {
				ctx.drawImage(explosion4, animations[a].x, animations[a].y);
			}
			if (animations[a].startIt == 5) {
				ctx.drawImage(explosion5, animations[a].x, animations[a].y);
			}
			if (animations[a].startIt == 6) {
				ctx.drawImage(explosion6, animations[a].x, animations[a].y);
			}
			if (animations[a].startIt == 7) {
				ctx.drawImage(explosion7, animations[a].x, animations[a].y);
			}
			if (animations[a].startIt == 8) {
				ctx.drawImage(explosion8, animations[a].x, animations[a].y);
			}
			if (animations[a].startIt == 9) {
				ctx.drawImage(explosion9, animations[a].x, animations[a].y);
			}
			if (animations[a].startIt == 10) {
				ctx.drawImage(explosion10, animations[a].x, animations[a].y);
			}
			if (animations[a].startIt == 11) {
				ctx.drawImage(explosion11, animations[a].x, animations[a].y);
			}
			if (animations[a].startIt == 12) {
				ctx.drawImage(explosion12, animations[a].x, animations[a].y);
			}
			if (animations[a].startIt == 13) {
				ctx.drawImage(explosion13, animations[a].x, animations[a].y);
			}
			if (animations[a].startIt == 14) {
				ctx.drawImage(explosion14, animations[a].x, animations[a].y);
			}
			if (animations[a].startIt == 15) {
				ctx.drawImage(explosion15, animations[a].x, animations[a].y);
			}

			animations[a].animationDelay++;
			if(animations[0].animationDelay==8){
				animations[a].startIt++;
				animations[a].animationDelay = 0;
			}
			if (animations[0].startIt >= 16) {
				animations.splice(a,1);
			}
		}
	}
}

function keyDownHandler(e) {
	if (e.keyCode == 38) {
		upPressed = true;
	}
	if (e.keyCode == 40) {
		downPressed = true;
	}
	if (e.keyCode ==37 ) {
		leftPressed = true;
	}
	if (e.keyCode ==39 ) {
		rightPressed = true;
	}
	if (e.keyCode == 32 && player2.canFire && !player1.hasBeenHit) {
		spacePressed = true;
	}
	if (e.keyCode == 87) {
		wPressed = true;
	}
	if (e.keyCode == 65) {
		aPressed = true;
	}
	if (e.keyCode == 83) {
		sPressed = true;
	}
	if (e.keyCode == 68) {
		dPressed = true;
	}
	if (e.keyCode == 13 && player1.canFire && !player2.hasBeenHit) {
		zeroPressed = true;
	}
}
function keyUpHandler(e) {
	if (e.keyCode == 38) {
		upPressed = false;
	}
	if (e.keyCode == 40) {
		downPressed = false;
	}
	if (e.keyCode == 37) {
		leftPressed = false;
	}
	if (e.keyCode == 39) {
		rightPressed = false;
	}
	if (e.keyCode == 32) {
		spacePressed = false;
	}
	if (e.keyCode == 87) {
		wPressed = false;
	}
	if (e.keyCode == 65) {
		aPressed = false;
	}
	if (e.keyCode == 83) {
		sPressed = false;
	}
	if (e.keyCode == 68) {
		dPressed = false;
	}
	if (e.keyCode == 13) {
		zeroPressed = false;
	}
}
function currentSeconds() {
	let time = new Date();
	return time/1000;
}
function resetBullet1(params) {
	player1.canFire = true;
}
function resetBullet2(params) {
	player2.canFire = true;
}
function Wall(x,y,w,h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
}

walls.push(new Wall(W/8, 100, 300, 20));
walls.push(new Wall(W/1.5, 100, 300, 20));
walls.push(new Wall(W/2, 100, 20, 300));
walls.push(new Wall(W/3, 100, 20, 300));
walls.push(new Wall(W/1.5, 100, 20, 300));
walls.push(new Wall(0, 0, W, 10));
walls.push(new Wall(0, 0, 10, H));
walls.push(new Wall(0, H-10, W, 10));
walls.push(new Wall(W-10, 0, 10, H));


function drawWalls() {
	for(let i=0;i<walls.length;i++){
		ctx.fillStyle = "rgb(0,0,0)"
		ctx.fillRect(walls[i].x,walls[i].y,walls[i].w,walls[i].h);
		for (let j = 0; j <bullets.length; j++) {
			if(bullets[j].x >= walls[i].x && 
				bullets[j].x+bullets[j].w <= walls[i].x + walls[i].w&&
				bullets[j].y >= walls[i].y &&
				bullets[j].y+bullets[j].h<= walls[i].y + walls[i].h)
				{
					let bulletHalfW = bullets[j].w/2;
					let bulletHalfH = bullets[j].h / 2;
					let wallHalfW = walls[i].w / 2;
					let wallHalfH = walls[i].h / 2;
					let bulletCenterX = bullets[j].x + bullets[j].w/2;
					let bulletCenterY = bullets[j].y + bullets[j].h / 2;
					let wallCenterX = walls[i].x + walls[i].w / 2;
					let wallCenterY = walls[i].y + walls[i].h / 2;
					let diffX = bulletCenterX - wallCenterX;
					let diffY = bulletCenterY - wallCenterY;
					let minXDist = bulletHalfW+wallHalfW;
					let minYDist = bulletHalfH+wallHalfH;

					let depthX = diffX > 0 ? minXDist - diffX: -minXDist-diffX;
					let depthY = diffY > 0 ? minYDist - diffY : -minYDist - diffY;

					if(depthX != 0 && depthY !=0){
						if(Math.abs(depthX)<Math.abs(depthY)){
							bullets[j].rotation = (bullets[j].rotation*(-1))+180;
						}else{
							bullets[j].rotation = (bullets[j].rotation * (-1)) + 360;

						}
				}
			
		}
	}	
}
}

function Bullet(x, y , speed, rotation) {
	this.x = x;
	this.y = y;
	this.speed = speed;
	this.rotation = rotation;
	this.timeOfBirth = currentSeconds();
	this.w = 3;
	this.h = 3;

}
function drawImageRot(img, x, y,width, height, deg) {
	let rad = deg*Math.PI/180;
	ctx.translate(x+width/2,y+height/2);
	ctx.rotate(rad);
	ctx.drawImage(img, width/2*-1, height/2*-1, width, height);
	ctx.rotate(rad*-1);
	ctx.translate((x+width/2)*-1,(y+height/2)*-1);

}

function controls() {
	let isCollision = false;
	if (leftPressed) {
		player1.rot -= 1;
	}
	if (rightPressed) {
		player1.rot += 1;
	}
	if (upPressed) {
	
		let p1 = new Player(player1.x + Math.cos((player1.rot) * Math.PI / 180),
			player1.y + Math.sin((player1.rot) * Math.PI / 180),
			player1.rot, player1.w, player1.h);
		let p2 = new Player(player2.x + Math.cos((player2.rot) * Math.PI / 180),
			player2.y + Math.sin((player2.rot) * Math.PI / 180),
			player2.rot, player2.w, player2.h); 
		
		
		for (let i = 0; i < walls.length; i++) {
			

			if (willCollide(p1, walls[i]) || willCollide(p1, p2)) {
				isCollision = true;
				break;
			}
			


		}
		if (!isCollision) {
			player1.x += Math.cos(player1.rot * Math.PI / 180);
			player1.y += Math.sin(player1.rot * Math.PI / 180);
		}
		
	}
	if (downPressed) {
	
		
		
		
		let p1 = new Player(player1.x - Math.cos((player1.rot) * Math.PI / 180),
			player1.y - Math.sin((player1.rot) * Math.PI / 180),
			player1.rot, player1.w, player1.h);
		let p2 = new Player(player2.x - Math.cos((player2.rot) * Math.PI / 180),
			player2.y - Math.sin((player2.rot) * Math.PI / 180),
			player2.rot, player2.w, player2.h);
		for (let i = 0; i < walls.length; i++) {
			
			if (willCollide(p1, walls[i]) || willCollide(p1, p2)) {
				isCollision = true;
				break;
			}
			

		}
		if (!isCollision) {
			player1.x -= Math.cos((player1.rot) * Math.PI / 180);
			player1.y -= Math.sin((player1.rot) * Math.PI / 180);
		}
		
	}
	if (zeroPressed && player1.canFire) {
		let x = player1.x + player1.w / 2 + 25 * Math.cos(player1.rot * Math.PI / 180);
		let y = player1.y + player1.h / 2 + 25 * Math.sin(player1.rot * Math.PI / 180);
		bullets.push(new Bullet(x, y, 1.5, player1.rot));
		playSound("./tanks/fire.flac");
		player1.canFire = false;
	}
	if (aPressed) {
		player2.rot -= 1;
	}
	if (dPressed) {
		player2.rot += 1;
	}
	if (wPressed) {
		let p1 = new Player(player1.x + Math.cos((player1.rot) * Math.PI / 180),
			player1.y + Math.sin((player1.rot) * Math.PI / 180),
			player1.rot, player1.w, player1.h);
		let p2 = new Player(player2.x + Math.cos((player2.rot) * Math.PI / 180),
			player2.y + Math.sin((player2.rot) * Math.PI / 180),
			player2.rot, player2.w, player2.h);
		
		for (let i = 0; i < walls.length; i++) {
			
			if (willCollide(p2, walls[i] || willCollide(p1, p2))) {
				isCollision = true;
				break;
			}
			

		}
		if (!isCollision) {
			player2.x += Math.cos((player2.rot) * Math.PI / 180);
			player2.y += Math.sin((player2.rot) * Math.PI / 180);
		}
	}
	if (sPressed) {
		let p1 = new Player(player1.x - Math.cos((player1.rot) * Math.PI / 180),
			player1.y - Math.sin((player1.rot) * Math.PI / 180),
			player1.rot, player1.w, player1.h);
		let p2 = new Player(player2.x - Math.cos((player2.rot) * Math.PI / 180),
			player2.y - Math.sin((player2.rot) * Math.PI / 180),
			player2.rot, player2.w, player2.h);
		
		
		for (let i = 0; i < walls.length; i++) {
			
			if (willCollide(p2, walls[i])||willCollide(p1,p2)) {
				isCollision = true;
				break;
			}
			
	}
		if (!isCollision) {
			player2.x -= Math.cos((player2.rot) * Math.PI / 180);
			player2.y -= Math.sin((player2.rot) * Math.PI / 180);
		}
}
	if (spacePressed && player2.canFire) {
		let x = player2.x + player2.w / 2 + 25 * Math.cos(player2.rot * Math.PI / 180);
		let y = player2.y + player2.h / 2 + 25 * Math.sin(player2.rot * Math.PI / 180);
		bullets.push(new Bullet(x, y, 1.5, player2.rot));
		playSound("./tanks/fire.flac");
		player2.canFire = false;

	}

	

		let mv = joysticks["$0"]
		if (mv && mv.active) {



			
			let e = mv.vector.norm;
			let dx = e.x;
			let dy = e.y;

			let alpha = Math.atan(dy / dx);
			if (dx < 0) {
				alpha = alpha + Math.PI;
			}
			let degree = (alpha) * (180 / Math.PI);
			if (degree < 0) { degree += 360; }
			


			
		
			let p1 = new Player(player1.x + Math.cos((player1.rot) * Math.PI / 180),
				player1.y + Math.sin((player1.rot) * Math.PI / 180),
				player1.rot, player1.w, player1.h);
			let p2 = new Player(player2.x + Math.cos((player2.rot) * Math.PI / 180),
				player2.y + Math.sin((player2.rot) * Math.PI / 180),
				player2.rot, player2.w, player2.h);

			
			
				
			
			
			isCollision = willCollideWithBoxes(p2, walls) || willCollide(p1, p2) ? true : false;

			if (!isCollision) {
				player2.x += Math.cos((player2.rot) * Math.PI / 180);
				player2.y += Math.sin((player2.rot) * Math.PI / 180);
			}
			player2.rot = (degree || 0);

		}

		let lv = joysticks["$1"]
		if (lv && lv.active) {

			if ( shoot_time_frame < 0) {
				let x = player2.x + player2.w / 2 + 25 * Math.cos(player2.rot * Math.PI / 180);
				let y = player2.y + player2.h / 2 + 25 * Math.sin(player2.rot * Math.PI / 180);
				bullets.push(new Bullet(x, y, 1.5, player2.rot));
				playSound("./tanks/fire.flac");
				player2.canFire = false;
				shoot_time_frame = shoot_cooldown
			}

		}



	
	

}

function drawBullets() {

	for(let i = 0; i< bullets.length; i++){
		
		ctx.fillStyle= "black";
		ctx.fillRect(bullets[i].x, bullets[i].y, bullets[i].w, bullets[i].h);
		bullets[i].x += bullets[i].speed*Math.cos(bullets[i].rotation*Math.PI/180);
		bullets[i].y += bullets[i].speed * Math.sin(bullets[i].rotation * Math.PI / 180);
		if(willCollide(player1,bullets[i])&&!player1.hasBeenHit){
			animations.push(new Animation(1, player1.x,player1.y));
			playSound("./tanks/explosion.mp3");
			bullets.splice(i,1);
			player2.score++;
			playerHitTime = currentSeconds();
			player1.hasBeenHit = true;
		} else if (willCollide(player2, bullets[i]) && !player2.hasBeenHit) {
			animations.push(new Animation(1, player2.x, player2.y));
			playSound("./tanks/explosion.mp3");
			bullets.splice(i, 1);
			player1.score++;
			playerHitTime = currentSeconds();
			player2.hasBeenHit = true;
		}else if(currentSeconds()-bullets[i].timeOfBirth>7){
			bullets.splice(i,1);
		}
}
}

class Player {
	constructor(x, y, rot, w, h){
	this.x=x;
	this.y=y;
	this.rot=rot;
	this.w=w;
	this.h=h;
	this.canFire = true;
	this.score=0;
	this.hasBeenHit=false;
	}
	

}

let player2 = new Player(50, 100, 0, 40, 30);
let player1 = new Player(70, 400, 0, 40, 30);
function willCollide(box1 , box2) {
	let Bp1 = box2.x + box2.w / 2;
	let Bq1 = box2.y + box2.h / 2;
	let Bx1 = box2.x;
	let By1 = box2.y;
	let Bx2 = box2.x+box2.w;
	let By2 = box2.y;
	let Bx3 = box2.x;
	let By3 = box2.y+box2.h;
	let Bx4 = box2.x+box2.w;
	let By4 = box2.y+box2.h;
	let Btheta = 0 * Math.PI / 180;
	let bx1 = (Bx1 - Bp1) * Math.cos(Btheta) - (By1 - Bq1) * Math.sin(Btheta) + Bp1; 
	let by1 = (Bx1 - Bp1) * Math.sin(Btheta) + (By1 - Bq1) * Math.cos(Btheta) + Bq1; 
	let bx2 = (Bx2 - Bp1) * Math.cos(Btheta) - (By2 - Bq1) * Math.sin(Btheta) + Bp1; 
	let by2 = (Bx2 - Bp1) * Math.sin(Btheta) + (By2 - Bq1) * Math.cos(Btheta) + Bq1; 
	let bx3 = (Bx3 - Bp1) * Math.cos(Btheta) - (By3 - Bq1) * Math.sin(Btheta) + Bp1; 
	let by3 = (Bx3 - Bp1) * Math.sin(Btheta) + (By3 - Bq1) * Math.cos(Btheta) + Bq1; 
	let bx4 = (Bx4 - Bp1) * Math.cos(Btheta) - (By4 - Bq1) * Math.sin(Btheta) + Bp1; 
	let by4 = (Bx4 - Bp1) * Math.sin(Btheta) + (By4 - Bq1) * Math.cos(Btheta) + Bq1; 
	let p1 = box1.x + box1.w / 2;
	let q1 = box1.y + box1.h / 2;
	let x1 = box1.x;
	let y1 = box1.y;
	let x2 = box1.x + box1.w;
	let y2 = box1.y;
	let x3 = box1.x;
	let y3 = box1.y + box1.h;
	let x4 = box1.x + box1.w;
	let y4 = box1.y + box1.h;
	let theta = (box1.rot) * Math.PI / 180;
	let p1x1 = (x1 - p1) * Math.cos(theta) - (y1 - q1) * Math.sin(theta) + p1;
	let p1y1 = (x1 - p1) * Math.sin(theta) + (y1 - q1) * Math.cos(theta) + q1;
	let p1x2 = (x2 - p1) * Math.cos(theta) - (y2 - q1) * Math.sin(theta) + p1;
	let p1y2 = (x2 - p1) * Math.sin(theta) + (y2 - q1) * Math.cos(theta) + q1;
	let p1x3 = (x3 - p1) * Math.cos(theta) - (y3 - q1) * Math.sin(theta) + p1;
	let p1y3 = (x3 - p1) * Math.sin(theta) + (y3 - q1) * Math.cos(theta) + q1;
	let p1x4 = (x4 - p1) * Math.cos(theta) - (y4 - q1) * Math.sin(theta) + p1;
	let p1y4 = (x4 - p1) * Math.sin(theta) + (y4 - q1) * Math.cos(theta) + q1; 
	/*
	ctx.strokeStyle = "rgb(255,0,0)"
	ctx.beginPath();
	ctx.moveTo(p1x1, p1y1);
	ctx.lineTo(p1x2, p1y2);
	ctx.lineTo(p1x4, p1y4);
	ctx.lineTo(p1x3,p1y3);
	ctx.lineTo(p1x1,p1y1);
	ctx.stroke();
	ctx.closePath();
	*/
	var polygonAVertices = [
		new XY(p1x1, p1y1),
		new XY(p1x2, p1y2),
		new XY(p1x4, p1y4),
		new XY(p1x3, p1y3)]
	var polygonAEdges = [
		new XY(p1x2-p1x1,p1y2-p1y1),
		new XY(p1x4-p1x2,p1y4-p1y2),
		new XY(p1x3-p1x4,p1y3-p1y4),
		new XY(p1x1-p1x3,p1y1-p1y3)]
	var polygonBVertices = [
		new XY(bx1, by1),
		new XY(bx2, by2),
		new XY(bx4, by4),
		new XY(bx3, by3)]
	var polygonBEdges = [
		new XY(bx2-bx1,by2-by1),
		new XY(bx4-bx2,by4-by2),
		new XY(bx3-bx4,by3-by4),
		new XY(bx1-bx3,by1-by3)]
	var polygonA = new Polygon(polygonAVertices,
		polygonAEdges);
	var polygonB = new Polygon(polygonBVertices,
		polygonBEdges);
	if(sat(polygonA,polygonB)){
		
		return true;
		}
	return false;
}
function sat(polygonA, polygonB) {
	let perpendicularLine = null;
	let dot = 0;
	let perpendicularStack = [];
	let amin = null;
	let amax = null;
	let bmin = null;
	let bmax = null;
	for (let i = 0; i < polygonA.edges.length; i++) {
		perpendicularLine = new XY(-polygonA.edges[i].y,
			polygonA.edges[i].x);
		perpendicularStack.push(perpendicularLine);
	}
	for (let i = 0; i < polygonB.edges.length; i++) {
		perpendicularLine = new XY(-polygonB.edges[i].y,
			polygonB.edges[i].x);
		perpendicularStack.push(perpendicularLine);
	}
	for (let i = 0; i < perpendicularStack.length; i++) {
		amin = null;
		amax = null;
		bmin = null;
		bmax = null;
		for (let j = 0; j < polygonA.vertices.length; j++) {
			dot = polygonA.vertices[j].x *
				perpendicularStack[i].x +
				polygonA.vertices[j].y *
				perpendicularStack[i].y;
			if (amax === null || dot > amax) {
				amax = dot;
			}
			if (amin === null || dot < amin) {
				amin = dot;
			}
		}
		for (let j = 0; j < polygonB.vertices.length; j++) {
			dot = polygonB.vertices[j].x *
				perpendicularStack[i].x +
				polygonB.vertices[j].y *
				perpendicularStack[i].y;
			if (bmax === null || dot > bmax) {
				bmax = dot;
			}
			if (bmin === null || dot < bmin) {
				bmin = dot;
			}
		}
		if ((amin < bmax && amin > bmin) ||
			(bmin < amax && bmin > amin)) {
			continue;
		}
		else {
			return false;
		}
	}
	return true;
}
function drawScore() {
	ctx.fillStyle = "rgb(0,0,0)"
	ctx.font = "20px Times New Roman";
	ctx.fillText("Player 1 Score: " + player1.score, 20, 30);
	ctx.fillText("Player 2 Score: " + player2.score, 640, 30);
}
function willCollideWithBoxes(box1,boxes) {
	
	for(let i = 0; i< boxes.length; i++){
		if(willCollide(box1, boxes[i])){
			return true;
		}
	}
	return false;
}

function resetGame() {
	if(player1.hasBeenHit || player2.hasBeenHit){
		if(currentSeconds() - playerHitTime > 4){
			player1.x = Math.floor(Math.random()*720+40);
			player1.y = Math.floor(Math.random() * 520 + 40);
			player1.rot = Math.floor(Math.random() * 360);
			player2.x = Math.floor(Math.random() * 720 + 40);
			player2.y = Math.floor(Math.random() * 520 + 40);
			player2.rot = Math.floor(Math.random() * 360);
		
			while (willCollideWithBoxes(player1, walls) || willCollideWithBoxes(player2, walls)) {
				player1.x = Math.floor(Math.random() * 720 + 40);
				player1.y = Math.floor(Math.random() * 520 + 40);
				player1.rot = Math.floor(Math.random() * 360);
				player2.x = Math.floor(Math.random() * 720 + 40);
				player2.y = Math.floor(Math.random() * 520 + 40);
				player2.rot = Math.floor(Math.random() * 360);
				player1.hasBeenHit = false;
				player2.hasBeenHit = false;
				bullets = [];
			}
		}
	}
}
function draw(){
	ctx.clearRect(0, 0, W,H);
	draw_joysticks();
	controls();
	drawBullets();
	drawWalls();
	drawAnimations();
	drawScore();
	resetGame();
	shoot_time_frame -= 1000 / 60
	
	if(!player1.hasBeenHit){
		drawImageRot(tank1, player1.x, player1.y, player1.w, player1.h, player1.rot);
	}
	if (!player2.hasBeenHit) {
		drawImageRot(tank2, player2.x, player2.y, player2.w, player2.h, player2.rot);
	}
}

setInterval(() => {
	draw();
}, 10);
setInterval(() => {
	resetBullet1();
}, 500);
setInterval(() => {
	resetBullet2();
}, 500);