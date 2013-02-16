
//==================================================//
// entities/alien.js
//==================================================//

shooter.entities.alien = {
	//load
	load : function(entity) {
		entity.loadComponents(
			rollbackgameengine.components.frame.load(entity, 0, 0, 31, 33),
			rollbackgameengine.components.collision.load(entity),
			shooter.components.damagedOnCollision.load(entity, shooter.entities.bullet),
			rollbackgameengine.components.preventOverlap.load(entity, shooter.entities.human, shooter.entities.wall),
			rollbackgameengine.components.spritemap.load(entity, "images/aliengun.png")
		);
	},

	//sync
	sync : rollbackgameengine.sync.singleton/*,

	//animations
	animations : {
		walkdown	:	{ frames:[0, 1, 2],		loop:true		rate:3	},
		facedown	:	{ frames:[1],			loop:false		rate:1	},
		walkright	:	{ frames:[3, 4, 5],		loop:true		rate:3	},
		faceright	:	{ frames:[4],			loop:false		rate:1	},
		walkleft	:	{ frames:[6, 7, 8],		loop:true		rate:3	},
		faceleft	:	{ frames:[7],			loop:false		rate:1	},
		walkup		:	{ frames:[9, 10, 11],	loop:true		rate:3	},
		faceup 		:	{ frames:[10],			loop:false		rate:1	}
	}*/
};
