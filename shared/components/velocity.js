
//==================================================//
// components/velocity.js
//==================================================//

shooter.components.velocity = {
	loadType : function(type, options) {
		//set speed
		type.speed = options.speed;
	},

	loadEntity : function(entity, options) {
		//set velocity values
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
	},

	encode : function(entity, outgoingMessage) {
		outgoingMessage.addSignedNumber(entity.vx, 2);
		outgoingMessage.addSignedNumber(entity.vy, 2);
	},

	decode : function(entity, incomingMessage) {
		entity.vx = incomingMessage.nextSignedNumber(2);
		entity.vy = incomingMessage.nextSignedNumber(2);
	}
}
