
//==================================================//
// entities/explosion.js
//==================================================//

shooter.entities.explosion = {
	//load
	load : function(entity) {
		entity.loadComponents(
			rollbackgameengine.components.frame.load(entity, 0, 0, 79, 85),
			rollbackgameengine.components.spritemap.load(entity, "images/blood.PNG"),
			rollbackgameengine.components.removedAfter.load(entity, this.animations.explode.length)
		);
	},

	//animations
	animations : {
		explode : [
			0, 0, 0, 1, 1, 1, 2, 2, 2
		]
	},

	//added to world
	addedToWorld : function(entity) {
		entity.animateSpritemap(this.animations.explode, false);
	}
};
