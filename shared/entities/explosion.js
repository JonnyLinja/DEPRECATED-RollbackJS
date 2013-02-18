
//==================================================//
// entities/explosion.js
//==================================================//

shooter.entities.explosion = {
	//components
	components : function() {
		return [
			rollbackgameengine.components.frame,			{ x:0, y:0, width:79, height:85 },
			rollbackgameengine.components.spritemap,		{ source:"images/blood.png", animations:[{ id:"explode", frames:[0, 1, 2], rate:3, loop:false }] },
			rollbackgameengine.components.removedAfter,		{ frames:9 }
		];
	},

	//sync
	sync : rollbackgameengine.sync.sometimes,

	//added to world
	addedToWorld : function(entity) {
		entity.animateSpritemap("explode");
	}
};
