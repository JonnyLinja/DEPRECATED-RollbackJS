
//==================================================//
// rollbackgameengine/components/frame.js
//==================================================//

rollbackgameengine.components.frame = {
	load : function(entity, x, y, width, height) {
		//add default properties to parent
		entity.x = x;
		entity.y = y;
		entity.width = width;
		entity.height = height;
		entity.moveX = 0;
		entity.moveY = 0;

		//add get functions
		entity.__defineGetter__("right",  this._right);
		entity.__defineGetter__("bottom",  this._bottom);
		entity.__defineGetter__("centerX",  this._centerX);
		entity.__defineGetter__("centerY",  this._centerY);

		//add center function
		entity.center = this._center;

		//return
		return this;
	},

	update : function(entity) {
		//move
		entity.x += entity.moveX;
		entity.y += entity.moveY;
		entity.moveX = 0;
		entity.moveY = 0;
	},
	
	rollback : function(entity1, entity2) {
		//rollback values
		entity1.x = entity2.x;
		entity1.y = entity2.y;
		entity1.width = entity2.width;
		entity1.height = entity2.height;
		entity1.moveX = entity2.moveX;
		entity1.moveY = entity2.moveY;
	},

	encode : function(entity, outgoingMessage) {
		outgoingMessage.addSignedNumber(entity.x, 2);
		outgoingMessage.addSignedNumber(entity.y, 2);
	},

	decode : function(entity, incomingMessage) {
		entity.x = incomingMessage.nextSignedNumber(2);
		entity.y = incomingMessage.nextSignedNumber(2);
	},

	//this refers to entity
	_right : function() {
		return this.x + this.width;
	},

	//this refers to entity
	_bottom : function() {
		return this.y + this.height;
	},

	//this refers to entity
	_centerX : function() {
		return (this.width * 0.5) + this.x;
	},

	//this refers to entity
	_centerY : function() {
		return (this.height * 0.5) + this.y;
	},

	//this refers to entity
	_center : function(x, y) {
		this.x = x - Math.floor(this.width * 0.5);
		this.y = y - Math.floor(this.height * 0.5);
	}
}
