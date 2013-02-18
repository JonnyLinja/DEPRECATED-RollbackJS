
//==================================================//
// entities/alien.js
//==================================================//

shooter.entities.alien = {
	//components
	components : function() {
		return [
			rollbackgameengine.components.frame,			{ x:0, y:0, width:31, height:33 },
			rollbackgameengine.components.collision,		{ },
			shooter.components.damagedOnCollision,			{ types:[shooter.entities.bullet] },
			rollbackgameengine.components.preventOverlap,	{ types:[shooter.entities.human, shooter.entities.wall] },
			rollbackgameengine.components.spritemap,		{ source:"images/aliengun.png", animations:[
																{ id:"walkdown", frames:[0, 1, 2], rate:3, loop:true },
																{ id:"facedown", frames:[1], loop:false },
																{ id:"walkright", frames:[3, 4, 5], rate:3, loop:true},
																{ id:"faceright", frames:[4], loop:false },
																{ id:"walkleft", frames:[6, 7, 8], rate:3, loop: true },
																{ id:"faceleft", frames:[7], loop:false },
																{ id:"walkup", frames:[9, 10, 11], rate:3, loop:true },
																{ id:"faceup", frames:[10], loop:false }
															] }
		];
	},

	//sync
	sync : rollbackgameengine.sync.singleton
};
