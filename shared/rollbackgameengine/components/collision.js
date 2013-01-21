
//==================================================//
// rollbackgameengine/components/collision.js
//==================================================//

rollbackgameengine.components.collision = {
	load : function(entity) {
		//collidable
		entity.collidable = true;

		//collision map
		if(!entity.factory._collisionMap) {
			entity.factory._collisionMap = {};
		}

		//functions
		entity.registerCollision = this._registerCollision;
		entity.didCollide = this._didCollide;

		//return
		return this;
	},

	rollback : function(entity1, entity2) {
		//rollback values
		entity1.collidable = entity2.collidable;
	},

	//this refers to entity
	_registerCollision : function(factory, component) {
		//check loaded
		if(factory._loaded) {
			return;
		}

		//create new
		if(!this.factory._collisionMap[factory]) {
			this.factory._collisionMap[factory] = new rollbackgameengine.datastructures.SinglyLinkedList();
		}

		//add
		this.factory._collisionMap[factory].add(component);
	},

	//this refers to entity
	_didCollide : function(entity) {
		//check if a component is registered
		if(!this.factory._collisionMap[entity.factory]) {
			return;
		}

		//declare variables
		var current = this.factory._collisionMap[entity.factory].head;

		//loop through components
		while (current) {
			//callback
			current.obj.didCollide(this, entity);

			//increment
			current = current.next;
		}

		//check factory
		if(this.factory.didCollide) {
			this.factory.didCollide(this, entity);
		}
	}
}
