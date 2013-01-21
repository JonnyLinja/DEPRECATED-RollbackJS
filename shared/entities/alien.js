
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
			rollbackgameengine.components.preventOverlap.load(entity, shooter.entities.human),
			rollbackgameengine.components.spritemap.load(entity, "images/aliengun.png")
		);
	},

	//zposition
	zPosition : 0,

	//update
	update : function(entity) {
	}
};
