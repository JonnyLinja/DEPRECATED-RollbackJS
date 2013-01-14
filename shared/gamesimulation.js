
//==================================================//
// gamesimulation.js
//==================================================//

shooter.GameSimulation = function() {
	//create world
	this.world = new rollbackgameengine.World();

	//initialize collisions
	this.world.addCollision(shooter.entities.alien, shooter.entities.bullet);
	this.world.addCollision(shooter.entities.human, shooter.entities.bullet);
	this.world.addCollision(shooter.entities.alien, shooter.entities.human);

	//initialize entities
	this.p1 = this.world.addEntity(shooter.entities.human);
	this.p1.x = 50;
	this.p1.y = 50;
	this.p2 = this.world.addEntity(shooter.entities.alien);
	this.p2.x = 600;
	this.p2.y = 300;
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

	if(player == 1) {
		//p1

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
	}else if(player == 2) {
		//p2

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
