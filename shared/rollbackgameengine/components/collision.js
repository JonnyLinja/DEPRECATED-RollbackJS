
//==================================================//
// rollbackgameengine/components/collision.js
//==================================================//

rollbackgameengine.components.Collision = function() {
}

rollbackgameengine.components.Collision.prototype.init = function() {
	//collidable
	this.entity.collidable = true;

	//collision map
	this.entity.collisionMap = {};

	//functions
	this.entity.registerCollision = this.registerCollision;
	this.entity.didCollide = this.didCollide;
}

//this refers to this.entity
rollbackgameengine.components.Collision.prototype.registerCollision = function(factory, component) {
	//create new
	if(!this.collisionMap[factory]) {
		this.collisionMap[factory] = new rollbackgameengine.datastructures.SinglyLinkedList();
	}

	//add
	this.collisionMap[factory].add(component);
}

//this refers to this.entity
rollbackgameengine.components.Collision.prototype.didCollide = function(entity) {
	//check if a component is registered
	if(!this.collisionMap[entity.factory]) {
		return;
	}

	//declare variables
	var current = this.collisionMap[entity.factory].head;

	//loop through components
	while (current) {
		//callback
		current.obj.didCollide(entity);

		//increment
		current = current.next;
	}
}

rollbackgameengine.components.Collision.prototype.rollback = function(component) {
	//rollback values
	this.entity.collidable = component.entity.collidable;
}
