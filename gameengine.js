// This game shell was happily copied from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011
CURRENT_LEVEL = 1;
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();


function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}

function GameEngine() {
	this.entities = [];
	this.otherEntities = [];
    this.showOutlines = false;
    this.ctx = null;
    this.click = null;
    this.mouse = null;
    this.wheel = null;
	this.mute = false;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
}

GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;

    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.startInput();
    this.timer = new Timer();
    console.log('game initialized');
}

GameEngine.prototype.start = function () {
    console.log("starting game");
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

GameEngine.prototype.startInput = function () {
    console.log('Starting input');
    var that = this;
	this.ctx.canvas.addEventListener("mousemove", function (e) {
		//console.log(e.clientX + " " + e.clientY);
		that.stBtnHover = e.clientX < 894 || e.clientX > 1240 || e.clientY < 65 || e.clientY > 203 ? false : true;
		that.contBtnHover = e.clientX < 284 || e.clientX > 631 || e.clientY < 427 || e.clientY > 566 ? false : true;
		that.endBtnHover = e.clientX < 645 || e.clientX > 1021 || e.clientY < 427 || e.clientY > 566 ? false : true;
		that.winBtnHover = e.clientX < 894 || e.clientX > 1240 || e.clientY < 65 || e.clientY > 203 ? false : true;
	
	}, false);

    this.ctx.canvas.addEventListener("keydown", function (e) {	
		if (String.fromCharCode(e.which) === 'W') that.w = true;
			if (String.fromCharCode(e.which) === 'D') that.right = true;
			if (String.fromCharCode(e.which) === 'A') that.left = true;
			if (String.fromCharCode(e.which) === 'S') that.down = true;
			if (String.fromCharCode(e.which) === ' ') that.space = true;
			if (String.fromCharCode(e.which) === 'M') {
				that.m = e.repeat ? false : true
				if (that.m) {
					that.mute = !that.mute;
				}
			}
			
			e.preventDefault();
    }, false);
	this.ctx.canvas.addEventListener("click", function (e) {
		that.click = true;
		that.mouseTimer = 0;
	}, false);
	this.ctx.canvas.addEventListener("keyup", function(e) {
		if (String.fromCharCode(e.which) === 'D') that.right = false;
		if (String.fromCharCode(e.which) === 'A') that.left = false;
		if (String.fromCharCode(e.which) === 'S') that.down = false;
		if (String.fromCharCode(e.which) === ' ') that.down = false;
		if (String.fromCharCode(e.which) === 'W') that.w = false;
		if (String.fromCharCode(e.which) === 'M') that.m = false;
		check = false;
	}, false);
}

GameEngine.prototype.addEntity = function (entity) {
    console.log('added entity');
	this.entities.push(entity);
    this.otherEntities.push(entity);
}

GameEngine.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].draw(this.ctx);
    }
    this.ctx.restore();
}

GameEngine.prototype.update = function () {
	this.mouseTimer += this.clockTick;
	if (this.click && this.mouseTimer >= 0.05) {
		this.click = false;
		this.mouseTimer = 0;
	}
    var entitiesCount = this.entities.length;
	this.camera.update();
    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];
        if (!entity.removeFromWorld) {
            entity.update();
        }
    }
    for (var i = entitiesCount - 1; i >= 0; --i) {
        if (this.entities[i].removeFromWorld) {
            this.entities.splice(i, 1);
        }
    }
}

GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
    this.w = null;
	this.space = null;
}

function Entity(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.removeFromWorld = false;
}

Entity.prototype.update = function () {
}

Entity.prototype.draw = function (ctx) {
    if (this.game.showOutlines && this.radius) {
        this.game.ctx.beginPath();
        this.game.ctx.strokeStyle = "green";
        this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.game.ctx.stroke();
        this.game.ctx.closePath();
    }
}

Entity.prototype.rotateAndCache = function (image, angle) {
    var offscreenCanvas = document.createElement('canvas');
    var size = Math.max(image.width, image.height);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    offscreenCtx.translate(size / 2, size / 2);
    offscreenCtx.rotate(angle);
    offscreenCtx.translate(0, 0);
    offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
    offscreenCtx.restore();
    return offscreenCanvas;
}
