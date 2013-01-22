
//==================================================//
// components/explodesoncollision.js
//==================================================//

shooter.components.explodesOnCollision = {
	load : function(entity) {
		//register collisions
		for(var i=1, j=arguments.length; i<j; i++) {
			entity.registerCollision(arguments[i], this);
		}

		//return
		return this;
	},

	didCollide : function(entity1, entity2) {
		//create explosion
		var explosion = entity1.world.addEntity(shooter.entities.explosion);
		explosion.center(Math.floor(entity1.centerX), Math.floor(entity1.centerY));

		//recycle
		entity1.world.recycleEntity(entity1);
	}
}
