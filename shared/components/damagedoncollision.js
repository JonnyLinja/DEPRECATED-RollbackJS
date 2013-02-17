
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
