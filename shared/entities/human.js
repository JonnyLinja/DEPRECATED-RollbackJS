
//==================================================//
// entities/human.js
//==================================================//

shooter.entities.human = {
	//load
	load : function(entity) {
		entity.loadComponents(
			rollbackgameengine.components.frame.load(entity, 0, 0, 34, 33),
			rollbackgameengine.components.collision.load(entity),
			shooter.components.damagedOnCollision.load(entity, shooter.entities.bullet),
			shooter.components.stopsOnCollision.load(entity, shooter.entities.alien),
			rollbackgameengine.components.spritemap.load(entity, "images/humangun.png")
		);
	},
};
