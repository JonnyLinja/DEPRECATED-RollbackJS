
//==================================================//
// gamesimulation.js
//==================================================//

shooter.GameSimulation = function() {
	//create world
	this.world = new rollbackgameengine.World(shooter.entities.bullet, shooter.entities.alien, shooter.entities.human, shooter.entities.explosion, shooter.entities.wall);

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

	//p1
	this.p1 = this.world.addEntity(shooter.entities.human);
	this.p1.x = 50;
	this.p1.y = 50;

	//p2
	this.p2 = this.world.addEntity(shooter.entities.alien);
	this.p2.x = 600;
	this.p2.y = 300;

	//processor1
	this.processor1 = new shooter.commands.CommandProcessor(this, this.p1);

	//processor2
	this.processor2 = new shooter.commands.CommandProcessor(this, this.p2);
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
		this.processor1.update(command);
	}else if(player === 1) {
		//p2
		this.processor2.update(command);
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
	//rollback processors
	this.processor1.rollback(gamesimulation.processor1);
	this.processor2.rollback(gamesimulation.processor2);

	//rollback world
	this.world.rollback(gamesimulation.world);
}

shooter.GameSimulation.prototype.encode = function(m) {
	this.world.encode(m);
}

shooter.GameSimulation.prototype.decode = function(m) {
	this.world.decode(m);
}
