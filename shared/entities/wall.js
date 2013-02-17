
//==================================================//
// entities/wall.js
//==================================================//

shooter.entities.wall = {
	//components
	components : function() {
		return [
			rollbackgameengine.components.frame,			{ x:0, y:0, width:0, height:0 },
			rollbackgameengine.components.collision,		{ }
		];
	}
};
