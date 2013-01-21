
//==================================================//
// entities/alien.js
//==================================================//

shooter.entities.alien = {
	//load
	load : function(entity) {
		entity.loadComponents(
			rollbackgameengine.components.frame.load(entity, 0, 0, 31, 33),
			rollbackgameengine.components.collision.load(entity),
			shooter.components.damagedOnCollision.load(entity, shooter.entities.bullet),
			rollbackgameengine.components.preventOverlap.load(entity, shooter.entities.human, shooter.entities.wall),
			rollbackgameengine.components.spritemap.load(entity, "images/aliengun.png")
		);
	},

	//animations
	animations : {
		walkdown : [
			0, 1, 2
		],
		spin : [
			0, 3, 6, 9
		],
	},

	//added to world
	addedToWorld : function(entity) {
		entity.animateSpritemap(this.animations.spin, true);
	}
};
