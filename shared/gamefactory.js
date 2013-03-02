
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
