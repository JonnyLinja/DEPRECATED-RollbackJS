
//==================================================//
// rollbackgameengine/components/collision.js
//==================================================//

rollbackgameengine.components.collision = {
	loadType : function(type) {
		//collision map
		if(!type._collisionMap) {
			type._collisionMap = {};
		}

		//register
		type.registerCollision = this._registerCollision;
	},

	loadEntity : function(entity) {
		//collidable
		entity.collidable = true;

		//didcollide
		entity.didCollide = this._didCollide;
	},

	rollback : function(entity1, entity2) {
		//rollback values
		entity1.collidable = entity2.collidable;
	},

	encode : function(entity, outgoingMessage) {
		outgoingMessage.addBoolean(entity.collidable);
	},

	decode : function(entity, incomingMessage) {
		entity.collidable = incomingMessage.nextBoolean();
	},

	//this refers to type
	_registerCollision : function(type, component) {
		//check loaded
		if(this._loaded) {
			return;
		}

		//create new
		if(!this._collisionMap[type]) {
			this._collisionMap[type] = new rollbackgameengine.datastructures.SinglyLinkedList();
		}

		//add
		this._collisionMap[type].add(component);
	},

	//this refers to entity
	_didCollide : function(entity) {
		//check if a component is registered
		if(!this.type._collisionMap[entity.type]) {
			return;
		}

		//declare variables
		var current = this.type._collisionMap[entity.type].head;

		//loop through components
		while (current) {
			//callback
			current.obj.didCollide(this, entity);

			//increment
			current = current.next;
		}

		//check type
		if(this.type.didCollide) {
			this.type.didCollide(this, entity);
		}
	}
}
