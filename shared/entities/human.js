
//==================================================//
// entities/human.js
//==================================================//

shooter.entities.human = {
	//load
	load : function(entity) {
		entity.loadComponents(
			rollbackgameengine.components.frame.load(entity, 0, 0, 34, 33),
			rollbackgameengine.components.collision.load(entity),
			shooter.components.damagedOnCollision.load(entity, shooter.entities.bullet),
			rollbackgameengine.components.preventOverlap.load(entity, shooter.entities.alien, shooter.entities.wall),
			rollbackgameengine.components.spritemap.load(entity, "images/humangun.png")
		);
	},

	//sync
	sync : rollbackgameengine.sync.singleton,

	//animations
	animations : {
		walkdown : [0, 1, 2],
		facedown : 1,
		walkright : [3, 4, 5],
		faceright : 4,
		walkleft : [6, 7, 8],
		faceleft : 7,
		walkup : [9, 10, 11],
		faceup : 10
	}
	/*
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
	}
	*/
};
