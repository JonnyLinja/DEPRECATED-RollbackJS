
//==================================================//
// entities/explosion.js
//==================================================//

shooter.entities.explosion = {
	//load
	load : function(entity) {
		entity.loadComponents(
			rollbackgameengine.components.frame.load(entity, 0, 0, 79, 85),
			rollbackgameengine.components.spritemap.load(entity, "images/blood.png"),
			rollbackgameengine.components.removedAfter.load(entity, 9)
		);
	},

	//sync
	sync : rollbackgameengine.sync.sometimes,

	//animations
	animations : {
		explode : [
			0, 1, 2
		]
	},

	//added to world
	addedToWorld : function(entity) {
		entity.animateSpritemap(this.animations.explode, false, 3);
	}
};
