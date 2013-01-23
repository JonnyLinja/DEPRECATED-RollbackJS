
//==================================================//
// commands/commandprocessor.js
//==================================================//

shooter.commands.CommandProcessor = function(simulation, player) {
	//simulation
	this.simulation = simulation;

	//player
	this.player = player;

	//keyboard
	this.w = false;
	this.a = false;
	this.s = false;
	this.d = false;

	//mouse
	this.mouseX = 0;
	this.mouseY = 0;
	this.mouseDown = false;
}

shooter.commands.CommandProcessor.prototype.update = function(command) {
	//math
	var dx = command.mouseX - this.player.centerX;
	var dy = command.mouseY - this.player.centerY;

	//click
	if(!this.mouseDown && command.mouseDown) {
		//create bullet
		var bullet = this.simulation.world.addEntity(shooter.entities.bullet);

		//math
		var mag = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
		var ratio = bullet.speed / mag;

		//set velocity
		bullet.vx = dx * ratio;
		bullet.vy = dy * ratio;

		//position bullet - prevent from shooting yourself
		bullet.center(this.player.centerX, this.player.centerY);
		while(this.simulation.world.collides(this.player, bullet)) {
			bullet.x += bullet.vx;
			bullet.y += bullet.vy;
		}
		bullet.x += bullet.vx;
		bullet.y += bullet.vy;
	}
	this.mouseDown = command.mouseDown;

	//movement
	var isMoving = false;

	//vertical
	if(command.w && !command.s) {
		this.player.y -= 5;
		isMoving = true;
	}else if(command.s && !command.w) {
		this.player.y += 5;
		isMoving = true;
	}

	//horizontal
	if(command.a && !command.d) {
		this.player.x -= 5;
		isMoving = true;
	}else if(command.d && !command.a) {
		this.player.x += 5;
		isMoving = true;
	}

	//direction - using human animations since lazy -> eventually should store in 1 location or have 1 processor per player type
	dx *= -1;
	dy *= -1;
	var angle = Math.atan2(dy, dx) * 180 / Math.PI;
	if(angle < 0) {
		angle += 360;
	}
	if(angle >= 337 || angle <= 23) {
		//left
		if(isMoving) {
			this.player.animateSpritemap(shooter.entities.human.animations.walkleft, true);
		}else {
			this.player.spritemapAnimationFrame = shooter.entities.human.animations.faceleft;
		}
	}else if(angle < 67) {
		//top left
		if(isMoving) {
			this.player.animateSpritemap(shooter.entities.human.animations.walkup, true);
		}else {
			this.player.spritemapAnimationFrame = shooter.entities.human.animations.faceup;
		}
	}else if(angle <= 113) {
		//top
		if(isMoving) {
			this.player.animateSpritemap(shooter.entities.human.animations.walkup, true);
		}else {
			this.player.spritemapAnimationFrame = shooter.entities.human.animations.faceup;
		}
	}else if(angle < 157) {
		//top right
		if(isMoving) {
			this.player.animateSpritemap(shooter.entities.human.animations.walkup, true);
		}else {
			this.player.spritemapAnimationFrame = shooter.entities.human.animations.faceup;
		}
	}else if(angle <= 203) {
		//right
		if(isMoving) {
			this.player.animateSpritemap(shooter.entities.human.animations.walkright, true);
		}else {
			this.player.spritemapAnimationFrame = shooter.entities.human.animations.faceright;
		}
	}else if(angle < 247) {
		//bottom right
		if(isMoving) {
			this.player.animateSpritemap(shooter.entities.human.animations.walkdown, true);
		}else {
			this.player.spritemapAnimationFrame = shooter.entities.human.animations.facedown;
		}
	}else if(angle <= 293) {
		//bottom
		if(isMoving) {
			this.player.animateSpritemap(shooter.entities.human.animations.walkdown, true);
		}else {
			this.player.spritemapAnimationFrame = shooter.entities.human.animations.facedown;
		}
	}else if(angle < 337) {
		//bottom left
		if(isMoving) {
			this.player.animateSpritemap(shooter.entities.human.animations.walkdown, true);
		}else {
			this.player.spritemapAnimationFrame = shooter.entities.human.animations.facedown;
		}
	}else {
		//error
		console.log("ERRAR");
		//this.player.spritemapAnimationFrame = shooter.entities.human.animations.facedown;
	}
}

shooter.commands.CommandProcessor.prototype.rollback = function(p) {
	//rollback values
	this.mouseDown = p.mouseDown;
}
