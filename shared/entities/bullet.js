
//==================================================//
// entities/bullet.js
//==================================================//

shooter.entities.bullet = {
	//load
	load : function(entity) {
		entity.loadComponents(
			rollbackgameengine.components.frame.load(entity, 0, 0, 14, 12),
			rollbackgameengine.components.collision.load(entity),
			shooter.components.velocity.load(entity, 10),
			shooter.components.explodesOnCollision.load(entity, shooter.entities.human, shooter.entities.alien),
			rollbackgameengine.components.spritemap.load(entity, "images/airball.png")
		);
	},

	//animations
	animations : {
		spin : [
			0, 1, 2, 3, 4
		]
	},

	//added to world
	addedToWorld : function(entity) {
		entity.animateSpritemap(this.animations.spin, true);
	}
};
