
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
