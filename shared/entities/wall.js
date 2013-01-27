
//==================================================//
// entities/wall.js
//==================================================//

shooter.entities.wall = {
	//load
	load : function(entity) {
		//disable sync
		entity.syncable = false;

		//load components
		entity.loadComponents(
			rollbackgameengine.components.frame.load(entity, 0, 0, 0, 0),
			rollbackgameengine.components.collision.load(entity)
		);
	},
};
