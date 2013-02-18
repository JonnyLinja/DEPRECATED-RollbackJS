
//==================================================//
// entities/bullet.js
//==================================================//

shooter.entities.bullet = {
	//components
	components : function() {
		return [
			rollbackgameengine.components.frame,			{ x:0, y:0, width:14, height:12 },
			rollbackgameengine.components.collision,		{ },
			shooter.components.velocity,					{ speed:10 },
			shooter.components.removeOffscreen,				{ },
			shooter.components.explodesOnCollision,			{ types:[shooter.entities.human, shooter.entities.alien] },
			rollbackgameengine.components.spritemap,		{ source:"images/airball.png", animations:[{ id:"spin", frames:[0, 1, 2], loop:true }] }
		];
	},

	//sync
	sync : rollbackgameengine.sync.sometimes,

	//added to world
	addedToWorld : function(entity) {
		entity.animateSpritemap("spin");
	}
};
