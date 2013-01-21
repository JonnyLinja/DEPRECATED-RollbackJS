
//==================================================//
// rollbackgameengine/world.js
//==================================================//

//expects list of factories as arguments
rollbackgameengine.World = function() {
	//frame
	this.frame = 0;

	//declare list of entities
	this.entitiesList = new rollbackgameengine.datastructures.DoublyLinkedList("prevEntityList", "nextEntityList"); //used for traversal in update/render/rollback
	this.entitiesDictionary = {}; //used for quick lookup in add/recycle/remove

	//collisions
	this.collisions = new rollbackgameengine.datastructures.SinglyLinkedList(); //factories

	//helper linked lists
	this.toAdd = new rollbackgameengine.datastructures.SinglyLinkedList();
	this.toRecycle = new rollbackgameengine.datastructures.SinglyLinkedList();
	this.toRemove = new rollbackgameengine.datastructures.SinglyLinkedList();

	//factory tracking variables
	var factory = null;
	var list = null;

	//loop through arguments
	for(var i=0, j=arguments.length; i<j; i++) {
		//set factory
		factory = arguments[i];

		//give ID
		rollbackgameengine.giveID(factory);

		//create list
		list = new rollbackgameengine.datastructures.DoublyLinkedList("prevEntity", "nextEntity");
		list.factory = factory;

		//add to entities list
		this.entitiesList.add(list);

		//add to dictionary
		this.entitiesDictionary[factory] = list;
	}

	//add components and collisions variables
	var entity = null;
	var current = null;
	var currentCollision = null;
	var found = false;

	//loop through parameters
	for(var i=0, j=arguments.length; i<j; i++) {
		//set factory
		factory = arguments[i];

		//create dummy pooled entity - it creates the collision maps for the factories
		entity = this._createEntity(factory);
		rollbackgameengine.pool.add(factory, entity);

		//add collisions if able
		if(typeof factory._collisionMap !== 'undefined') {
			//loop through factories
			current = this.entitiesList.head;
			while(current) {
				//exists
				if(factory._collisionMap.hasOwnProperty(current.factory)) {
					//reset found
					found = false;

					//loop through collisions
					currentCollision = this.collisions.head;
					while(currentCollision) {
						//check found
						if(currentCollision.obj.factory1 === factory && currentCollision.obj.factory2 === current.factory || currentCollision.obj.factory1 === current.factory && currentCollision.obj.factory2 === factory) {
							found = true;
							break;
						}

						//increment
						currentCollision = currentCollision.next;
					}

					//add collisions
					if(!found) {
						this.collisions.add({factory1:factory, factory2:current.factory});
					}
				}

				//increment
				current = current.nextEntityList;
			}
		}
	}
}

//private
//pools automatically
rollbackgameengine.World.prototype._createEntity = function(factory) {
	//grab from pool
	var entity = rollbackgameengine.pool.acquire(factory);

	//make new entity if needed
	if(!entity) {
		//create entity
		entity = new rollbackgameengine.Entity(factory);

		//load
		factory.load(entity);
	}

	//return
	return entity;
}

//expects a factory with a components array
//pools automatically
rollbackgameengine.World.prototype.addEntity = function(factory) {
	//create entity
	var entity = this._createEntity(factory);

	//push toAdd
	this.toAdd.add(entity);

	//return
	return entity;
}

rollbackgameengine.World.prototype.recycleEntity = function(entity) {
	//push toRecycle
	this.toRecycle.add(entity);
}

rollbackgameengine.World.prototype.removeEntity = function(entity) {
	//push toRecycle
	this.toRemove.add(entity);
}

rollbackgameengine.World.prototype.updateLists = function() {
	//declare variables
	var entity = null;

	//add
	while(this.toAdd.head) {
		//pop
		entity = this.toAdd.pop();

		//set world
		entity.world = this;

		//add to list
		this.entitiesDictionary[entity.factory].add(entity);
	}

	//recycle
	while(this.toRecycle.head) {
		//pop
		entity = this.toRecycle.pop();

		//remove from entity list
		this.entitiesDictionary[entity.factory].remove(entity);

		//remove world
		entity.world = null;

		//add to pool
		rollbackgameengine.pool.add(entity.factory, entity);
	}

	//remove
	while(this.toRemove.head) {
		//pop
		entity = this.toRemove.pop();

		//remove from entity list
		this.entitiesDictionary[entity.factory].remove(entity);

		//remove world
		entity.world = null;
	}
}

//consider having a collideFirst function

rollbackgameengine.World.prototype.checkCollision = function(factory1, factory2, callback) {
	//declare variables
	var list1 = null;
	var list2 = null;
	var currentFactory1 = null;
	var currentFactory2 = null;

	//get lists
	list1 = this.entitiesDictionary[factory1];
	list2 = this.entitiesDictionary[factory2];

	//validate exists
	if(!list1 || !list2) {
		return;
	}

	//loop through factory 1
	currentFactory1 = list1.head;
	while (currentFactory1) {
		//loop through factory 2
		currentFactory2 = list2.head;
		while(currentFactory2) {
			//collide
			if(currentFactory1 !== currentFactory2 && currentFactory1.collidable && currentFactory2.collidable &&
				!(currentFactory1.x >= currentFactory2.right ||
					currentFactory1.y >= currentFactory2.bottom ||
					currentFactory1.right <= currentFactory2.x ||
					currentFactory1.bottom <= currentFactory2.y)) {
				callback(currentFactory1, currentFactory2);
			}

			//increment
			currentFactory2 = currentFactory2.nextEntity;
		}

		//increment
		currentFactory1 = currentFactory1.nextEntity;
	}
}

//private
//collision callback
rollbackgameengine.World.prototype._handleCollision = function(entity1, entity2) {
	entity1.didCollide(entity2);
	entity2.didCollide(entity1);
}

rollbackgameengine.World.prototype.updateCollisions = function() {
	//declare variables
	var currentCollision = this.collisions.head;

	//loop through collisions
	while(currentCollision) {
		//check collision
		this.checkCollision(currentCollision.obj.factory1, currentCollision.obj.factory2, this._handleCollision);

		//increment
		currentCollision = currentCollision.next;
	}
}

rollbackgameengine.World.prototype.updateEntities = function() {
	//declare variables
	var currentOuterList = this.entitiesList.head;
	var currentInnerList = null;

	//loop through factories
	while(currentOuterList) {
		//set head
		currentInnerList = currentOuterList.head;

		//loop through entities
		while(currentInnerList) {
			//update
			currentInnerList.update();

			//increment
			currentInnerList = currentInnerList.nextEntity;
		}

		//increment
		currentOuterList = currentOuterList.nextEntityList;
	}
}

rollbackgameengine.World.prototype.update = function() {
	//frame check
	if(this.frame >= 0) {
		//update collisions
		this.updateCollisions();

		//update lists
		this.updateLists();

		//update entities
		this.updateEntities();

		//update lists
		this.updateLists();
	}
	
	//update frame
	this.frame++;
}

rollbackgameengine.World.prototype.render = function(ctx) {
	//declare variables
	var currentOuterList = this.entitiesList.head;
	var currentInnerList = null;

	//loop through factories
	while(currentOuterList) {
		//set head
		currentInnerList = currentOuterList.head;

		//loop through entities
		while(currentInnerList) {
			//render
			currentInnerList.render(ctx);

			//increment
			currentInnerList = currentInnerList.nextEntity;
		}

		//increment
		currentOuterList = currentOuterList.nextEntityList;
	}
}

rollbackgameengine.World.prototype.rollback = function(world) {
	//declare list variables
	var myCurrentOuterList = this.entitiesList.head;
	var otherCurrentOuterList = world.entitiesList.head;
	var myCurrentInnerList = null;
	var otherCurrentInnerList = null;
	var temp = null;

	//loop through my factories
	while(myCurrentOuterList) {
		//get heads of each list
		myCurrentInnerList = myCurrentOuterList.head;
		otherCurrentInnerList = otherCurrentOuterList.head;

		//loop rollback
		while (myCurrentInnerList) {
			//check if anything to roll back to
			if(otherCurrentInnerList) {
				//rollback
				myCurrentInnerList.rollback(otherCurrentInnerList);

				//increment
				myCurrentInnerList = myCurrentInnerList.nextEntity;
				otherCurrentInnerList = otherCurrentInnerList.nextEntity;
			}else {
				//loop recycle remaining
				while(myCurrentInnerList) {
					//recycle
					this.recycleEntity(myCurrentInnerList);

					//increment
					myCurrentInnerList = myCurrentInnerList.nextEntity;
				}
			}
		}

		//loop add remaining
		while(otherCurrentInnerList) {
			//create new
			temp = this.addEntity(otherCurrentInnerList.factory);

			//rollback
			temp.rollback(otherCurrentInnerList);

			//increment
			otherCurrentInnerList = otherCurrentInnerList.nextEntity;
		}

		//increment outer loop
		myCurrentOuterList = myCurrentOuterList.nextEntityList;
		otherCurrentOuterList = otherCurrentOuterList.nextEntityList;
	}

	//update lists
	this.updateLists();

	//rollback frame
	this.frame = world.frame;
}
