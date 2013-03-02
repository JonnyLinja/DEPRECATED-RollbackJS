
//==================================================//
// components/velocity.js
//==================================================//

shooter.components.velocity = {
	loadType : function(type, options) {
		//set speed
		type.speed = options.speed;
	},

	loadEntity : function(entity, options) {
		//vx
		entity.__defineGetter__("vx",  this._getVx);
		entity.__defineSetter__("vx",  this._setVx);
		entity._vx = 0;

		//vy
		entity.__defineGetter__("vy",  this._getVy);
		entity.__defineSetter__("vy",  this._setVy);
		entity._vy = 0;
	},

	update : function(entity) {
		//move by velocity
		entity.x += entity.vx;
		entity.y += entity.vy;
	},

	rollback : function(entity1, entity2) {
		//rollback values
		entity1._vx = entity2._vx;
		entity1._vy = entity2._vy;
	},

	encode : function(entity, outgoingMessage) {
		outgoingMessage.addSignedNumber(entity.vx, 2);
		outgoingMessage.addSignedNumber(entity.vy, 2);
	},

	decode : function(entity, incomingMessage) {
		entity._vx = incomingMessage.nextSignedNumber(2);
		entity._vy = incomingMessage.nextSignedNumber(2);
	},

	//this refers to entity
	_getVx : function() {
		return this._vx;
	},

	//this refers to entity
	_setVx : function(value) {
		this._vx = parseFloat(value.toFixed(2));
	},

	//this refers to entity
	_getVy : function() {
		return this._vy;
	},

	//this refers to entity
	_setVy : function(value) {
		this._vy = parseFloat(value.toFixed(2));
	}
}
