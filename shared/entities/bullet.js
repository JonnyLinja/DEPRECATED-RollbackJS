
//==================================================//
// entities/bullet.js
//==================================================//

shooter.entities.bullet = {
	//zposition
	zPosition : 1,

	//create
	create : function() {
		return new rollbackgameengine.Entity(
			rollbackgameengine.components.Frame,		[0, 0, 14, 12],
			rollbackgameengine.components.Collision,
			shooter.components.DiesOnCollision,			[shooter.entities.person],
			rollbackgameengine.components.Spritemap,	["images/airball.PNG"]
		);
	}
};
