//==================================================//
// shooter.js
//==================================================//

//declare namespaces
var shooter = {};
shooter.commands = {};
shooter.entities = {};
shooter.components = {};

//nodejs
if(typeof window === 'undefined') {
	module.exports = shooter;

	//this needs to be tested later, note that rollbackengine needs to be bundled together as well
	//in theory abuses function only scope to create rollbackengine
	var rollbackgameengine = require('./rollbackserverengine/gameengine.js');
}

//easy to read combine script
/*
type shared\shooter.js shared\components\HP.js shared\components\velocity.js shared\components\removeoffscreen.js shared\components\damagedoncollision.js
shared\components\explodesoncollision.js shared\entities\alien.js shared\entities\human.js shared\entities\bullet.js shared\entities\explosion.js
shared\entities\wall.js shared\gamefactory.js shared\commands\command.js shraed\commands\commandprocessor.js > shootergame.js
*/

//combined script
//type shared\shooter.js shared\components\HP.js shared\components\velocity.js shared\components\removeoffscreen.js shared\components\damagedoncollision.js shared\components\explodesoncollision.js shared\entities\alien.js shared\entities\human.js shared\entities\bullet.js shared\entities\explosion.js shared\entities\wall.js shared\gamefactory.js shared\commands\command.js shared\commands\commandprocessor.js > shootergame.js

//==================================================//
// components/hp.js
//==================================================//

shooter.components.hp = {
	loadEntity : function(entity, options) {
		//set hp
		entity.hp = options.hp;
	},

	rollback : function(entity1, entity2) {
		entity1.hp = entity2.hp;
	}
}

//==================================================//
// components/velocity.js
//==================================================//

shooter.components.velocity = {
	loadType : function(type, options) {
		//set speed
		type.speed = options.speed;
	},

	loadEntity : function(entity, options) {
		//set velocity values
		entity.vx = 0;
		entity.vy = 0;
	},

	update : function(entity) {
		//move by velocity
		entity.x += entity.vx;
		entity.y += entity.vy;
	},

	rollback : function(entity1, entity2) {
		//rollback values
		entity1.vx = entity2.vx;
		entity1.vy = entity2.vy;
	},

	encode : function(entity, outgoingMessage) {
		outgoingMessage.addSignedNumber(entity.vx, 2);
		outgoingMessage.addSignedNumber(entity.vy, 2);
	},

	decode : function(entity, incomingMessage) {
		entity.vx = incomingMessage.nextSignedNumber(2);
		entity.vy = incomingMessage.nextSignedNumber(2);
	}
}

//==================================================//
// components/removeoffscreen.js
//==================================================//

shooter.components.removeOffscreen = {
	update : function(entity) {
		//hardcoded width and height until can figure out where to store width/height
		if(entity.right < 0 || entity.x > 800 || entity.bottom < 0 || entity.y > 640) {
			entity.world.recycleEntity(entity);
		}
	}
}

//==================================================//
// components/damagedoncollision.js
//==================================================//

shooter.components.damagedOnCollision = {
	loadType : function(type, options) {
		//register collisions
		for(var i=0, j=options.types.length; i<j; i++) {
			type.registerCollision(options.types[i], this);
		}
	},

	didCollide : function(entity1, entity2) {
		entity1.HP--;
	}
}

//==================================================//
// components/explodesoncollision.js
//==================================================//

shooter.components.explodesOnCollision = {
	loadType : function(type, options) {
		//register collisions
		for(var i=0, j=options.types.length; i<j; i++) {
			type.registerCollision(options.types[i], this);
		}
	},

	didCollide : function(entity1, entity2) {
		//create explosion
		var explosion = entity1.world.addEntity(shooter.entities.explosion);
		explosion.center(Math.floor(entity1.centerX), Math.floor(entity1.centerY));

		//recycle
		entity1.world.recycleEntity(entity1);
	}
}

//==================================================//
// entities/alien.js
//==================================================//

shooter.entities.alien = {
	//components
	components : function() {
		return [
			rollbackgameengine.components.frame,			{ x:0, y:0, width:31, height:33 },
			rollbackgameengine.components.collision,		{ },
			shooter.components.damagedOnCollision,			{ types:[shooter.entities.bullet] },
			rollbackgameengine.components.preventOverlap,	{ types:[shooter.entities.human, shooter.entities.wall] },
			rollbackgameengine.components.spritemap,		{ source:"images/aliengun.png", animations:[
																{ id:"walkdown", frames:[0, 1, 2], rate:3, loop:true },
																{ id:"facedown", frames:[1], loop:false },
																{ id:"walkright", frames:[3, 4, 5], rate:3, loop:true},
																{ id:"faceright", frames:[4], loop:false },
																{ id:"walkleft", frames:[6, 7, 8], rate:3, loop: true },
																{ id:"faceleft", frames:[7], loop:false },
																{ id:"walkup", frames:[9, 10, 11], rate:3, loop:true },
																{ id:"faceup", frames:[10], loop:false }
															] }
		];
	},

	//sync
	sync : rollbackgameengine.sync.singleton
};

//==================================================//
// entities/human.js
//==================================================//

shooter.entities.human = {
	//components
	components : function() {
		return [
			rollbackgameengine.components.frame,			{ x:0, y:0, width:34, height:33 },
			rollbackgameengine.components.collision,		{ },
			shooter.components.damagedOnCollision,			{ types:[shooter.entities.bullet] },
			rollbackgameengine.components.preventOverlap,	{ types:[shooter.entities.alien, shooter.entities.wall] },
			rollbackgameengine.components.spritemap,		{ source:"images/humangun.png", animations:[
																{ id:"walkdown", frames:[0, 1, 2], rate:3, loop:true },
																{ id:"facedown", frames:[1], loop:false },
																{ id:"walkright", frames:[3, 4, 5], rate:3, loop:true},
																{ id:"faceright", frames:[4], loop:false },
																{ id:"walkleft", frames:[6, 7, 8], rate:3, loop: true },
																{ id:"faceleft", frames:[7], loop:false },
																{ id:"walkup", frames:[9, 10, 11], rate:3, loop:true },
																{ id:"faceup", frames:[10], loop:false }
															] }
		];
	},

	//sync
	sync : rollbackgameengine.sync.singleton
};

//==================================================//
// entities/bullet.js
//==================================================//

shooter.entities.bullet = {
	//components
	components : function() {
		return [
			rollbackgameengine.components.frame,			{ x:0, y:0, width:14, height:12 },
			rollbackgameengine.components.collision,		{ },
			shooter.components.velocity,					{ speed:10 },
			shooter.components.removeOffscreen,				{ },
			shooter.components.explodesOnCollision,			{ types:[shooter.entities.human, shooter.entities.alien] },
			rollbackgameengine.components.spritemap,		{ source:"images/airball.png", animations:[{ id:"spin", frames:[0, 1, 2], loop:true }] }
		];
	},

	//sync
	sync : rollbackgameengine.sync.sometimes,

	//added to world
	addedToWorld : function(entity) {
		entity.animateSpritemap("spin");
	}
};

//==================================================//
// entities/explosion.js
//==================================================//

shooter.entities.explosion = {
	//components
	components : function() {
		return [
			rollbackgameengine.components.frame,			{ x:0, y:0, width:79, height:85 },
			rollbackgameengine.components.spritemap,		{ source:"images/blood.png", animations:[{ id:"explode", frames:[0, 1, 2], rate:3, loop:false }] },
			rollbackgameengine.components.removedAfter,		{ frames:9 }
		];
	},

	//sync
	sync : rollbackgameengine.sync.sometimes,

	//added to world
	addedToWorld : function(entity) {
		entity.animateSpritemap("explode");
	}
};

//==================================================//
// entities/wall.js
//==================================================//

shooter.entities.wall = {
	//components
	components : function() {
		return [
			rollbackgameengine.components.frame,			{ x:0, y:0, width:0, height:0 },
			rollbackgameengine.components.collision,		{ }
		];
	}
};

//==================================================//
// gamefactory.js
//
// If player has multiple pre game options, like character select
// then do not make it a singleton, make it a class
//==================================================//

shooter.gameFactory = {
	create : function() {
		//create world
		var world = new rollbackgameengine.World({
			factory : this,
			types : [shooter.entities.bullet, shooter.entities.alien, shooter.entities.human, shooter.entities.explosion, shooter.entities.wall]
		});

		//walls
		var top = world.addEntity(shooter.entities.wall);
		top.x = -800;
		top.y = -640;
		top.width = 2400;
		top.height = 640;
		var bottom = world.addEntity(shooter.entities.wall);
		bottom.x = -800;
		bottom.y = 640;
		bottom.width = 2400;
		bottom.height = 640;
		var left = world.addEntity(shooter.entities.wall);
		left.x = -800;
		left.y = 0;
		left.width = 800;
		left.height = 640;
		var right = world.addEntity(shooter.entities.wall);
		right.x = 800;
		right.y = 0;
		right.width = 800;
		right.height = 640;

		//p1
		var p1 = world.addEntity(shooter.entities.human);
		p1.x = 50;
		p1.y = 50;

		//p2
		var p2 = world.addEntity(shooter.entities.alien);
		p2.x = 600;
		p2.y = 300;

		//processors
		world.processors[0] = new shooter.commands.CommandProcessor(world, p1);
		world.processors[1] = new shooter.commands.CommandProcessor(world, p2);

		//return
		return world;
	}
};

//==================================================//
// commands/command.js
// controllers will set this.frame
// however command itself does not manage it
//==================================================//

shooter.commands.Command = function() {
	this.reset();
};

//reset

shooter.commands.Command.prototype.reset = function() {
	//booleans
	this.w = false;				//1
	this.a = false;				//1
	this.s = false;				//1
	this.d = false;				//1
	this.mouseDown = false;		//1
	this.mouseX = 0;			//10
	this.mouseY = 0;			//10
};

//loading

shooter.commands.Command.prototype.loadFromMessage = function(incomingmessage) {
	//booleans
	this.w = incomingmessage.nextBoolean();
	this.a = incomingmessage.nextBoolean();
	this.s = incomingmessage.nextBoolean();
	this.d = incomingmessage.nextBoolean();
	this.mouseDown = incomingmessage.nextBoolean();
	this.mouseX = incomingmessage.nextUnsignedInteger(10);
	this.mouseY = incomingmessage.nextUnsignedInteger(10);
};

shooter.commands.Command.prototype.loadFromCommand = function(command) {
	//booleans
	this.w = command.w;
	this.a = command.a;
	this.s = command.s;
	this.d = command.d;
	this.mouseDown = command.mouseDown;
	this.mouseX = command.mouseX;
	this.mouseY = command.mouseY;
};

//sending

shooter.commands.Command.prototype.totalBitSize = 25; //calculate based on data

shooter.commands.Command.prototype.addDataToMessage = function(outgoingmessage) {
	//booleans
	outgoingmessage.addBoolean(this.w);
	outgoingmessage.addBoolean(this.a);
	outgoingmessage.addBoolean(this.s);
	outgoingmessage.addBoolean(this.d);
	outgoingmessage.addBoolean(this.mouseDown);
	outgoingmessage.addUnsignedInteger(this.mouseX, 10);
	outgoingmessage.addUnsignedInteger(this.mouseY, 10);
};

//helper

shooter.commands.Command.prototype.toString = function() {
	return "<" + this.w + ", " + this.a + ", " + this.s + ", " + this.d + ">";
};

//==================================================//
// commands/commandprocessor.js
//==================================================//

shooter.commands.CommandProcessor = function(world, player) {
	//world
	this.world = world;

	//player
	this.player = player;

	//mouse
	this.mouseDown = false;
};

shooter.commands.CommandProcessor.prototype.update = function(command) {
	//math
	var dx = command.mouseX - this.player.centerX;
	var dy = command.mouseY - this.player.centerY;

	//click
	if(!this.mouseDown && command.mouseDown) {
		//create bullet
		var bullet = this.world.addEntity(shooter.entities.bullet);

		//math
		var mag = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
		var ratio = shooter.entities.bullet.speed / mag;

		//set velocity
		bullet.vx = dx * ratio;
		bullet.vy = dy * ratio;

		//position bullet - prevent from shooting yourself
		bullet.center(this.player.centerX, this.player.centerY);
		while(this.world.collides(this.player, bullet)) {
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
		this.player.y += 4;
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

	//4way
	if(angle > 315 || angle <= 45) {
		//left
		if(isMoving) {
			this.player.animateSpritemap("walkleft");
		}else {
			this.player.animateSpritemap("faceleft");
		}
	}else if(angle <= 135) {
		//top
		if(isMoving) {
			this.player.animateSpritemap("walkup");
		}else {
			this.player.animateSpritemap("faceup");
		}
	}else if(angle <= 225) {
		//right
		if(isMoving) {
			this.player.animateSpritemap("walkright");
		}else {
			this.player.animateSpritemap("faceright");
		}
	}else {
		//bottom
		if(isMoving) {
			this.player.animateSpritemap("walkdown");
		}else {
			this.player.animateSpritemap("facedown");
		}
	}

	//8way
	/*
	if(angle >= 337 || angle <= 23) {
		//left
		if(isMoving) {
		}else {
		}
	}else if(angle < 67) {
		//top left
		if(isMoving) {
		}else {
		}
	}else if(angle <= 113) {
		//top
		if(isMoving) {
		}else {
		}
	}else if(angle < 157) {
		//top right
		if(isMoving) {
		}else {
		}
	}else if(angle <= 203) {
		//right
		if(isMoving) {
		}else {
		}
	}else if(angle < 247) {
		//bottom right
		if(isMoving) {
		}else {
		}
	}else if(angle <= 293) {
		//bottom
		if(isMoving) {
		}else {
		}
	}else if(angle < 337) {
		//bottom left
		if(isMoving) {
		}else {
		}
	}else {
		//error
		console.log("ERRAR");
	}
	*/
};

shooter.commands.CommandProcessor.prototype.rollback = function(p) {
	//rollback values
	this.mouseDown = p.mouseDown;
};

shooter.commands.CommandProcessor.prototype.encode = function(outgoingMessage) {
	outgoingMessage.addBoolean(this.mouseDown);
};

shooter.commands.CommandProcessor.prototype.decode = function(incomingMessage) {
	this.mouseDown = incomingMessage.nextBoolean();
};
