
//==================================================//
// entities/bullet.js
//==================================================//

shooter.entities.bullet = {
	//load
	load : function(entity) {
		entity.loadComponents(
			rollbackgameengine.components.frame.load(entity, 0, 0, 14, 12),
			rollbackgameengine.components.collision.load(entity),
			shooter.components.diesOnCollision.load(entity, shooter.entities.human, shooter.entities.alien),
			rollbackgameengine.components.preventOverlap.load(entity, shooter.entities.wall),
			rollbackgameengine.components.spritemap.load(entity, "images/airball.PNG")
		);
	},
};
