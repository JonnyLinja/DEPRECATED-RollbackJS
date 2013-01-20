
//==================================================//
// components/diesoncollision.js
//==================================================//

shooter.components.diesOnCollision = {
	load : function(entity) {
		//register collisions
		for(var i=1, j=arguments.length; i<j; i++) {
			entity.registerCollision(arguments[i], this);
		}

		//return
		return this;
	},

	didCollide : function(entity1, entity2) {
		//recycle
		entity1.world.recycleEntity(entity1);
	}
}
