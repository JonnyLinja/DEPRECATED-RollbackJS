
//==================================================//
// rollbackgameengine/world.js
//==================================================//

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
}

//expected to be set at the beginning
//is not rolled back
rollbackgameengine.World.prototype.addCollision = function(factory1, factory2) {
	//give IDs
	rollbackgameengine.giveID(factory1);
	rollbackgameengine.giveID(factory2);

	//add to list
	this.collisions.add({factory1:factory1, factory2:factory2});
}

//expects a factory with a create method and a zposition number
//pools automatically
rollbackgameengine.World.prototype.addEntity = function(factory) {
	//give ID
	rollbackgameengine.giveID(factory);

	//grab from pool
	var entity = rollbackgameengine.pool.acquire(factory);

	//make new entity if needed
	if(!entity) {
		entity = factory.create();
	}

	//set factory
	entity.factory = factory;

	//create list if needed
	if(!this.entitiesDictionary[entity.factory]) {
		//create linked list
		var list = new rollbackgameengine.datastructures.DoublyLinkedList("prevEntity", "nextEntity");
		list.factory = factory;

		//add to list
		if(!this.entitiesList.head) {
			//empty, just add to end
			this.entitiesList.add(list);
		}else {
			//search and insert

			//set to head
			var current = this.entitiesList.head;

			//set found
			var found = false;

			//loop
			while(current) {
				//found
				if(list.factory.zPosition <= current.factory.zPosition) {
					//insert
					this.entitiesList.insertBefore(list, current);
					found = true;
					break;
				}

				//increment
				current = current.nextEntityList;
			}

			//nothing found, add to end
			if(!found) {
				this.entitiesList.add(list);
			}
		}

		//add to dictionary
		this.entitiesDictionary[entity.factory] = list;
	}

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

rollbackgameengine.World.prototype.updateCollisions = function() {
	//declare variables
	var currentCollision = this.collisions.head;
	var list1 = null;
	var list2 = null;
	var currentFactory1 = null;
	var currentFactory2 = null;

	//loop through collisions
	while(currentCollision) {
		//get lists
		list1 = this.entitiesDictionary[currentCollision.obj.factory1];
		list2 = this.entitiesDictionary[currentCollision.obj.factory2];

		//check against map
		if(list1 && list2) {
			//exists

			//loop through factory 1
			currentFactory1 = list1.head;
			while (currentFactory1) {
				//loop through factory 2
				currentFactory2 = list2.head;
				while(currentFactory2) {
					//collide
					if(currentFactory1 !== currentFactory2 && currentFactory1.collidable && currentFactory2.collidable &&
						!(currentFactory1.x > currentFactory2.x+currentFactory2.width ||
							currentFactory1.y > currentFactory2.y+currentFactory2.height ||
							currentFactory1.x+currentFactory1.width < currentFactory2.x ||
							currentFactory1.y+currentFactory1.height < currentFactory2.y)) {
						//callbacks
						currentFactory1.didCollide(currentFactory2);
						currentFactory2.didCollide(currentFactory1);
					}

					//increment
					currentFactory2 = currentFactory2.nextEntity;
				}

				//increment
				currentFactory1 = currentFactory1.nextEntity;
			}
		}

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

	//declare helper variales
	var temp = null;
	var shouldSkip = false;
	var shouldInsertNew = false;

	//loop through my factories
	while(myCurrentOuterList) {
		//reset booleans
		shouldSkip = false;
		shouldInsertNew = false;

		if(!otherCurrentOuterList || myCurrentOuterList.factory.zPosition < otherCurrentOuterList.factory.zPosition) {
			//skip
			shouldSkip = true;
		}else if(myCurrentOuterList.factory.zPosition > otherCurrentOuterList.factory.zPosition) {
			//insert new
			shouldInsertNew = true;
		}else if(myCurrentOuterList.factory !== otherCurrentOuterList.factory) {
			//check if factory contained by other
			temp = world.entitiesDictionary[myCurrentOuterList.factory];
			if(!temp) {
				//skip
				shouldSkip = true;
			}else {
				//check if out of order
				temp = this.entitiesDictionary[otherCurrentOuterList.factory];
				if(temp) {
					//out of order - swap
					this.entitiesList.swap(myCurrentOuterList, temp);
					myCurrentOuterList = temp;
				}else {
					//does not exist, create new
					shouldInsertNew = true;
				}
			}
		}

		//actions
		if(shouldSkip) {
			//skip

			//loop recycle all elements
			myCurrentInnerList = myCurrentOuterList.head;
			while(myCurrentInnerList) {
				//recycle
				this.recycleEntity(myCurrentInnerList);

				//increment
				myCurrentInnerList = myCurrentInnerList.nextEntity;
			}

			//increment and continue
			myCurrentOuterList = myCurrentOuterList.nextEntityList;
			continue;
		}else if(shouldInsertNew) {
			//insert new

			//create
			temp = new rollbackgameengine.datastructures.DoublyLinkedList("prevEntity", "nextEntity");
			temp.zPosition = otherCurrentOuterList.zPosition;
			temp.factory = otherCurrentOuterList.factory;

			//insert
			this.entitiesList.insertBefore(temp, myCurrentOuterList);

			//set reference
			myCurrentOuterList = temp;
		}

		//inner loop

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

	//loop add remaining
	while(otherCurrentOuterList) {
		//create and add list
		temp = new rollbackgameengine.datastructures.DoublyLinkedList("prevEntity", "nextEntity");
		temp.zPosition = otherCurrentOuterList.zPosition;
		temp.factory = otherCurrentOuterList.factory;
		this.entitiesList.add(temp);

		//populate list
		otherCurrentInnerList = otherCurrentOuterList.head;
		while(otherCurrentInnerList) {
			//create new
			temp = this.addEntity(otherCurrentInnerList.factory);

			//rollback
			temp.rollback(otherCurrentInnerList);

			//increment
			otherCurrentInnerList = otherCurrentInnerList.nextEntity;
		}

		//increment
		otherCurrentOuterList = otherCurrentOuterList.nextEntityList;
	}

	//update lists
	this.updateLists();

	//rollback frame
	this.frame = world.frame;
}
