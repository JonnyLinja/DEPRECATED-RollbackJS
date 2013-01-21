
//==================================================//
// entities/wall.js
//==================================================//

shooter.entities.wall = {
	//load
	load : function(entity) {
		entity.loadComponents(
			rollbackgameengine.components.frame.load(entity, 0, 0, 0, 0),
			rollbackgameengine.components.collision.load(entity)
		);
	},
};
