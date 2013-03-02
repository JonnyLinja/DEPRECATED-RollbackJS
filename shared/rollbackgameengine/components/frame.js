
//==================================================//
// rollbackgameengine/components/frame.js
//==================================================//

rollbackgameengine.components.frame = {
	loadEntity : function(entity, options) {
		//x
		entity.__defineGetter__("x",  this._getX);
		entity.__defineSetter__("x",  this._setX);
		entity._x = 0;
		entity._changedX = false;

		//y
		entity.__defineGetter__("y",  this._getY);
		entity.__defineSetter__("y",  this._setY);
		entity._y = 0;
		entity._changedY = false;

		//add default properties
		entity.width = options.width;
		entity.height = options.height;
		entity.moveX = 0;
		entity.moveY = 0;

		//add get convenience functions
		entity.__defineGetter__("right",  this._right);
		entity.__defineGetter__("bottom",  this._bottom);
		entity.__defineGetter__("centerX",  this._centerX);
		entity.__defineGetter__("centerY",  this._centerY);

		//add center function
		entity.center = this._center;
	},

	update : function(entity) {
		//move
		entity.x += entity.moveX;
		entity.y += entity.moveY;
		entity.moveX = 0;
		entity.moveY = 0;
	},

	applyPrecision : function(entity) {
		//problem - it kind of creates a bunch of garbage :(

		//x
		if(entity._changedX) {
			entity._changedX = false;
			entity._x = parseFloat(entity._x.toFixed(2));
		}

		//y
		if(entity._changedY) {
			entity._changedY = false;
			entity._y = parseFloat(entity._y.toFixed(2));
		}
	},
	
	rollback : function(entity1, entity2) {
		//rollback values
		entity1.x = entity2.x;
		entity1.y = entity2.y;
		//entity1.width = entity2.width;
		//entity1.height = entity2.height;
		//entity1.moveX = entity2.moveX;
		//entity1.moveY = entity2.moveY;
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
	_getX : function() {
		return this._x;
	},

	//this refers to entity
	_setX : function(value) {
		this._x = value;
		this._changedX = true;
	},

	//this refers to entity
	_getY : function() {
		return this._y;
	},

	//this refers to entity
	_setY : function(value) {
		this._y = value;
		this._changedY = true;
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
