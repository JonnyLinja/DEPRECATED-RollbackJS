
//==================================================//
// entities/human.js
//==================================================//

shooter.entities.human = {
	//zposition
	zPosition : 10,

	//create
	create : function() {
		return new rollbackgameengine.Entity(
			rollbackgameengine.components.Frame,		[0, 0, 34, 33],
			rollbackgameengine.components.Collision,
			shooter.components.DamagedOnCollision,		[shooter.entities.bullet],
			shooter.components.StopsOnCollision,		[shooter.entities.alien],
			rollbackgameengine.components.Spritemap,	["images/humangun.png"]
		);
	}
};
