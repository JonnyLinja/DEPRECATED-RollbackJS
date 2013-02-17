
//==================================================//
// components/velocity.js
//==================================================//

shooter.components.velocity = {
	loadEntity : function(entity, options) {
		//set velocity values
		entity.speed = options.speed;
		entity.vx = 0;
		entity.vy = 0;
	},

	update : function(entity) {
		//move by velocity
		entity.x += entity.vx;
		entity.y += entity.vy;
	},

	rollback : function(entity1, entity2) {
		//rollback values
		entity1.vx = entity2.vx;
		entity1.vy = entity2.vy;
	}
}
