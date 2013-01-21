
//==================================================//
// gamesimulation.js
//==================================================//

shooter.GameSimulation = function() {
	//create world
	this.world = new rollbackgameengine.World(shooter.entities.bullet, shooter.entities.alien, shooter.entities.human, shooter.entities.wall);

	//walls
	var top = this.world.addEntity(shooter.entities.wall);
	top.x = -800;
	top.y = -640;
	top.width = 2400;
	top.height = 640;
	var bottom = this.world.addEntity(shooter.entities.wall);
	bottom.x = -800;
	bottom.y = 640;
	bottom.width = 2400;
	bottom.height = 640;
	var left = this.world.addEntity(shooter.entities.wall);
	left.x = -800;
	left.y = 0;
	left.width = 800;
	left.height = 640;
	var right = this.world.addEntity(shooter.entities.wall);
	right.x = 800;
	right.y = 0;
	right.width = 800;
	right.height = 640;

	//initialize entities
	this.p1 = this.world.addEntity(shooter.entities.human);
	this.p1.x = 50;
	this.p1.y = 50;
	this.p2 = this.world.addEntity(shooter.entities.alien);
	this.p2.x = 600;
	this.p2.y = 300;

	//initialize mouse state
	this.p1.mouseDown = false;
	this.p2.mouseDown = false;
}

//getters and setters

shooter.GameSimulation.prototype.__defineGetter__("frame", function() {
	return this.world.frame;
});

shooter.GameSimulation.prototype.__defineSetter__("frame", function(f) {
	this.world.frame = f;
});

//execute

//should eventually point to command processors in elementa kai
//for shooter just dump it here
shooter.GameSimulation.prototype.execute = function(player, command) {
	//console.log("executing command " + command.w + ", " + command.a + ", " + command.s + ", " + command.d);

	if(player === 0) {
		//p1

		//mouse
		if(!this.p1.mouseDown && command.mouseDown) {
			//click, create entity
			var bullet = this.world.addEntity(shooter.entities.bullet);
			bullet.x = command.mouseX;
			bullet.y = command.mouseY;
		}
		this.p1.mousedown = command.mouseDown;

		//vertical
		if(command.w && !command.s) {
			this.p1.y -= 5;
		}else if(command.s && !command.w) {
			this.p1.y += 5;
		}

		//horizontal
		if(command.a && !command.d) {
			this.p1.x -= 5;
		}else if(command.d && !command.a) {
			this.p1.x += 5;
		}
	}else if(player === 1) {
		//p2

		//mouse
		if(!this.p2.mouseDown && command.mouseDown) {
			//click, create entity
			var bullet = this.world.addEntity(shooter.entities.bullet);
			bullet.x = command.mouseX;
			bullet.y = command.mouseY;
		}
		this.p2.mousedown = command.mouseDown;

		//vertical
		if(command.w && !command.s) {
			this.p2.y -= 5;
		}else if(command.s && !command.w) {
			this.p2.y += 5;
		}

		//horizontal
		if(command.a && !command.d) {
			this.p2.x -= 5;
		}else if(command.d && !command.a) {
			this.p2.x += 5;
		}
	}
}

//world functions

shooter.GameSimulation.prototype.update = function() {
	this.world.update();
}

shooter.GameSimulation.prototype.render = function(ctx) {
	this.world.render(ctx);
}

shooter.GameSimulation.prototype.rollback = function(gamesimulation) {
	this.world.rollback(gamesimulation.world);
}
