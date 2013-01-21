
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
	//mouse click
	if(!this.mouseDown && command.mouseDown) {
		//click, create entity
		var bullet = this.simulation.world.addEntity(shooter.entities.bullet);
		bullet.center(command.mouseX, command.mouseY);
	}

	//save
	this.mouseDown = command.mouseDown;

	//vertical
	if(command.w && !command.s) {
		this.player.y -= 5;
	}else if(command.s && !command.w) {
		this.player.y += 5;
	}

	//horizontal
	if(command.a && !command.d) {
		this.player.x -= 5;
	}else if(command.d && !command.a) {
		this.player.x += 5;
	}
}

shooter.commands.CommandProcessor.prototype.rollback = function(p) {
	//rollback values
	this.mouseDown = p.mouseDown;
}
