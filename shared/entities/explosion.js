
//==================================================//
// entities/explosion.js
//==================================================//

shooter.entities.explosion = {
	//components
	components : function() {
		return [
			rollbackgameengine.components.frame,			{ x:0, y:0, width:79, height:85 },
			rollbackgameengine.components.spritemap,		{ source:"images/blood.png" },
			rollbackgameengine.components.removedAfter,		{ frames:9 }
		];
	},

	//sync
	sync : rollbackgameengine.sync.sometimes,

	//animations
	animations : {
		explode : [
			0, 1, 2
		]
	},

	//added to world
	addedToWorld : function(entity) {
		entity.animateSpritemap(this.animations.explode, false, 3);
	}
};
