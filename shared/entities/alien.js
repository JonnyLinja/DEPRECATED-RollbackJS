
//==================================================//
// entities/alien.js
//==================================================//

shooter.entities.alien = {
	//zposition
	zPosition : 10,

	//create
	create : function() {
		return new rollbackgameengine.Entity(
			rollbackgameengine.components.Frame,		[0, 0, 31, 33],
			rollbackgameengine.components.Collision,
			shooter.components.DamagedOnCollision,		[shooter.entities.bullet],
			shooter.components.StopsOnCollision,		[shooter.entities.human],
			rollbackgameengine.components.Spritemap,	["images/aliengun.png"]
		);
	}
};
