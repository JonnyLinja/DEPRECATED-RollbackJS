
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
};
