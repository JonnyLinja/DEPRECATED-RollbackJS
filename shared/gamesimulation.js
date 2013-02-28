
//==================================================//
// gamesimulation.js
//==================================================//

shooter.GameSimulation = function() {
	//super
	rollbackgameengine.World.call(this, {types:[shooter.entities.bullet, shooter.entities.alien, shooter.entities.human, shooter.entities.explosion, shooter.entities.wall]});

	//walls
	var top = this.addEntity(shooter.entities.wall);
	top.x = -800;
	top.y = -640;
	top.width = 2400;
	top.height = 640;
	var bottom = this.addEntity(shooter.entities.wall);
	bottom.x = -800;
	bottom.y = 640;
	bottom.width = 2400;
	bottom.height = 640;
	var left = this.addEntity(shooter.entities.wall);
	left.x = -800;
	left.y = 0;
	left.width = 800;
	left.height = 640;
	var right = this.addEntity(shooter.entities.wall);
	right.x = 800;
	right.y = 0;
	right.width = 800;
	right.height = 640;

	//p1
	this.p1 = this.addEntity(shooter.entities.human);
	this.p1.x = 50;
	this.p1.y = 50;

	//p2
	this.p2 = this.addEntity(shooter.entities.alien);
	this.p2.x = 600;
	this.p2.y = 300;

	//processor1
	this.processor1 = new shooter.commands.CommandProcessor(this, this.p1);

	//processor2
	this.processor2 = new shooter.commands.CommandProcessor(this, this.p2);
};

//inheritance

shooter.GameSimulation.prototype = function() {
  function F() {};
  F.prototype = rollbackgameengine.World.prototype;
  return new F;
}();

//execute

shooter.GameSimulation.prototype.execute = function(player, command) {
	if(player === 0) {
		//p1
		this.processor1.update(command);
	}else if(player === 1) {
		//p2
		this.processor2.update(command);
	}
};

//rollback

shooter.GameSimulation.prototype.rollback = function(gamesimulation) {
	//rollback processors
	this.processor1.rollback(gamesimulation.processor1);
	this.processor2.rollback(gamesimulation.processor2);

	//super
	rollbackgameengine.World.prototype.rollback.call(this, gamesimulation);
};
