
//==================================================//
// components/velocity.js
//==================================================//

shooter.components.velocity = {
	load : function(entity, speed) {
		//set velocity values
		entity.speed = speed;
		entity.vx = 0;
		entity.vy = 0;

		//return
		return this;
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
