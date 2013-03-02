
//==================================================//
// rollbackgameengine/world.js
//==================================================//

rollbackgameengine.World = function(options) {
	//frame
	this.frame = 0;

	//declare list of entities
	this.entitiesList = new rollbackgameengine.datastructures.DoublyLinkedList("prevEntityList", "nextEntityList"); //used for traversal in update/render/rollback
	this.entitiesDictionary = {}; //used for quick lookup in add/recycle/remove

	//collisions
	this.collisions = new rollbackgameengine.datastructures.SinglyLinkedList(); //types

	//helper linked lists
	this.toAdd = new rollbackgameengine.datastructures.SinglyLinkedList();
	this.toRecycle = new rollbackgameengine.datastructures.SinglyLinkedList();
	this.toRemove = new rollbackgameengine.datastructures.SinglyLinkedList();

	//processors
	this.processors = [];

	//type tracking variables
	var type = null;
	var list = null;

	//loop through types
	for(var i=0, j=options.types.length; i<j; i++) {
		//set type
		type = options.types[i];

		//give ID
		rollbackgameengine.giveID(type);

		//create list
		list = new rollbackgameengine.datastructures.DoublyLinkedList("prevEntity", "nextEntity");
		list.type = type;

		//add to entities list
		this.entitiesList.add(list);

		//add to dictionary
		this.entitiesDictionary[type] = list;
	}

	//add components and collisions variables
	var components = null;
	var component = null;
	var loadOptions = null;
	var current = null;
	var currentCollision = null;
	var found = false;

	//loop through types
	for(var i=0, j=options.types.length; i<j; i++) {
		//set type
		type = options.types[i];

		//load
		if(!type.loaded) {
			//get components
			components = type.components();

			//loop
			for(var k=0, l=components.length; k<l; k++) {
				//component and options
				component = components[k];
				loadOptions = components[++k];

				//loadType
				if(component.loadType) {
					//load
					component.loadType(type, loadOptions);
				}

				//load
				if(component.loadEntity) {
					//create list
					if(!type._loadComponents) {
						type._loadComponents = new rollbackgameengine.datastructures.SinglyLinkedList();
					}

					//add
					type._loadComponents.add(component);

					//create list
					if(!type._loadOptions) {
						type._loadOptions = new rollbackgameengine.datastructures.SinglyLinkedList();
					}

					//add
					type._loadOptions.add(loadOptions);
				}

				//addedToWorld
				if(component.addedToWorld) {
					//create list
					if(!type._addedToWorldComponents) {
						type._addedToWorldComponents = new rollbackgameengine.datastructures.SinglyLinkedList();
					}

					//add
					type._addedToWorldComponents.add(component);
				}

				//removedFromWorld
				if(component.removedFromWorld) {
					//create list
					if(!type._removedFromWorldComponents) {
						type._removedFromWorldComponents = new rollbackgameengine.datastructures.SinglyLinkedList();
					}

					//add
					type._removedFromWorldComponents.add(component);
				}

				//update
				if(component.update) {
					//create list
					if(!type._updateComponents) {
						type._updateComponents = new rollbackgameengine.datastructures.SinglyLinkedList();
					}

					//add
					type._updateComponents.add(component);
				}

				//render
				if(component.render) {
					//create list
					if(!type._renderComponents) {
						type._renderComponents = new rollbackgameengine.datastructures.SinglyLinkedList();
					}

					//add
					type._renderComponents.add(component);
				}

				//rollback
				if(component.rollback) {
					//create list
					if(!type._rollbackComponents) {
						type._rollbackComponents = new rollbackgameengine.datastructures.SinglyLinkedList();
					}

					//add
					type._rollbackComponents.add(component);
				}

				//sync
				if(type.sync && (type.sync === rollbackgameengine.sync.singleton || type.sync === rollbackgameengine.sync.sometimes || type.sync === rollbackgameengine.sync.often) && component.encode && component.decode) {
					//create list
					if(!type._syncComponents) {
						type._syncComponents = new rollbackgameengine.datastructures.SinglyLinkedList();
					}

					//add to list
					type._syncComponents.add(component);
				}
			}

			//set loaded
			type.loaded = true;
		}

		//add collisions if able
		if(typeof type._collisionMap !== 'undefined') {
			//loop through types
			current = this.entitiesList.head;
			while(current) {
				//exists
				if(type._collisionMap.hasOwnProperty(current.type)) {
					//reset found
					found = false;

					//loop through collisions
					currentCollision = this.collisions.head;
					while(currentCollision) {
						//check found
						if(currentCollision.obj.type1 === type && currentCollision.obj.type2 === current.type || currentCollision.obj.type1 === current.type && currentCollision.obj.type2 === type) {
							found = true;
							break;
						}

						//increment
						currentCollision = currentCollision.next;
					}

					//add collisions
					if(!found) {
						this.collisions.add({type1:type, type2:current.type});
					}
				}

				//increment
				current = current.nextEntityList;
			}
		}
	}
};

//EXECUTE

rollbackgameengine.World.prototype.execute = function(player, command) {
	this.processors[player].update(command);
};

//ENTITIES

//private
//pools automatically
rollbackgameengine.World.prototype._createEntity = function(type) {
	//grab from pool
	var entity = rollbackgameengine.pool.acquire(type);

	//make new entity if needed
	if(!entity) {
		//create entity
		entity = new rollbackgameengine.Entity(type);

		//load
		if(type._loadComponents) {
			//get top most element
			var component = type._loadComponents.head;
			var options = type._loadOptions.head;

			//loop through list
			while (component) {
				//load
				component.obj.loadEntity(entity, options.obj);

				//increment
				component = component.next;
				options = options.next;
			}
		}
	}

	//return
	return entity;
};

//expects a type with a components array
//pools automatically
rollbackgameengine.World.prototype.addEntity = function(type) {
	//create entity
	var entity = this._createEntity(type);

	//push toAdd
	this.toAdd.add(entity);

	//return
	return entity;
};

rollbackgameengine.World.prototype.recycleEntity = function(entity) {
	//push toRecycle
	this.toRecycle.add(entity);
};

rollbackgameengine.World.prototype.removeEntity = function(entity) {
	//push toRecycle
	this.toRemove.add(entity);
};

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
		this.entitiesDictionary[entity.type].add(entity);

		//addedToWorld
		entity.addedToWorld();
	}

	//recycle
	while(this.toRecycle.head) {
		//pop
		entity = this.toRecycle.pop();

		//remove from entity list
		this.entitiesDictionary[entity.type].remove(entity);

		//add to pool
		rollbackgameengine.pool.add(entity.type, entity);

		//removedFromWorld
		entity.removedFromWorld();

		//remove world
		entity.world = null;
	}

	//remove
	while(this.toRemove.head) {
		//pop
		entity = this.toRemove.pop();

		//remove from entity list
		this.entitiesDictionary[entity.type].remove(entity);

		//removedFromWorld
		entity.removedFromWorld();

		//remove world
		entity.world = null;
	}
};

//COLLISIONS - consider having a collide first function

rollbackgameengine.World.prototype.collides = function(entity1, entity2) {
	if(entity1 !== entity2 && entity1.collidable && entity2.collidable &&
		!(entity1.x >= entity2.right ||
			entity1.y >= entity2.bottom ||
			entity1.right <= entity2.x ||
			entity1.bottom <= entity2.y)) {
		//true
		return true;
	}

	//false
	return false;
};

rollbackgameengine.World.prototype.checkCollision = function(type1, type2, callback) {
	//declare variables
	var list1 = null;
	var list2 = null;
	var current1 = null;
	var current2 = null;

	//get lists
	list1 = this.entitiesDictionary[type1];
	list2 = this.entitiesDictionary[type2];

	//validate exists
	if(!list1 || !list2) {
		return;
	}

	//loop through type 1
	current1 = list1.head;
	while (current1) {
		//loop through type 2
		current2 = list2.head;
		while(current2) {
			//collide
			if(this.collides(current1, current2)) {
				callback(current1, current2);
			}

			//increment
			current2 = current2.nextEntity;
		}

		//increment
		current1 = current1.nextEntity;
	}
};

//private
//collision callback
rollbackgameengine.World.prototype._handleCollision = function(entity1, entity2) {
	entity1.didCollide(entity2);
	entity2.didCollide(entity1);
};

rollbackgameengine.World.prototype.updateCollisions = function() {
	//declare variables
	var currentCollision = this.collisions.head;

	//loop through collisions
	while(currentCollision) {
		//check collision
		this.checkCollision(currentCollision.obj.type1, currentCollision.obj.type2, this._handleCollision);

		//increment
		currentCollision = currentCollision.next;
	}
};

//UPDATE

rollbackgameengine.World.prototype._updateEntities = function() {
	//declare variables
	var currentOuterList = this.entitiesList.head;
	var currentInnerList = null;

	//loop through types
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
};

rollbackgameengine.World.prototype.update = function() {
	//frame check
	if(this.frame >= 0) {
		//update collisions
		this.updateCollisions();

		//update lists
		this.updateLists();

		//update entities
		this._updateEntities();

		//update lists
		this.updateLists();
	}
	
	//update frame
	this.frame++;
};

//RENDER

rollbackgameengine.World.prototype.render = function(ctx) {
	//declare variables
	var currentOuterList = this.entitiesList.head;
	var currentInnerList = null;

	//loop through tpes
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
};

//ROLLBACK

rollbackgameengine.World.prototype.rollback = function(world) {
	//rollback processors
	for(var i=0, j=this.processors.length; i<j; i++) {
		if(this.processors[i].rollback) {
			this.processors[i].rollback(world.processors[i]);
		}
	}

	//declare list variables
	var myCurrentOuterList = this.entitiesList.head;
	var otherCurrentOuterList = world.entitiesList.head;
	var myCurrentInnerList = null;
	var otherCurrentInnerList = null;
	var temp = null;

	//loop through my types
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
			temp = this.addEntity(otherCurrentInnerList.type);

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
};

//SYNC

rollbackgameengine.World.prototype.encode = function(outgoingMessage) {
	//encode processors
	for(var i=0, j=this.processors.length; i<j; i++) {
		if(this.processors[i].encode) {
			this.processors[i].encode(outgoingMessage);
		}
	}

	//declare variables
	var currentOuterList = this.entitiesList.head;
	var currentInnerList = null;

	//loop through types
	while(currentOuterList) {
		//check encode
		if(currentOuterList.type.sync) {
			//set head
			currentInnerList = currentOuterList.head;

			//encode type
			if(currentOuterList.type.sync === rollbackgameengine.sync.sometimes) {
				//sometimes
				if(currentInnerList) {
					//at least one

					//boolean
					outgoingMessage.addBoolean(true);

					//count
					outgoingMessage.addUnsignedInteger(currentOuterList.count);
				}else {
					//none

					//boolean
					outgoingMessage.addBoolean(false);
				}
			}else if(currentOuterList.type.sync === rollbackgameengine.sync.often) {
				//often

				//count
				outgoingMessage.addUnsignedInteger(currentOuterList.count);
			}

			//loop through entities
			while(currentInnerList) {
				//encode
				currentInnerList.encode(outgoingMessage);

				//increment
				currentInnerList = currentInnerList.nextEntity;
			}
		}

		//increment
		currentOuterList = currentOuterList.nextEntityList;
	}
};

//todo - create and recycle need to NOT activate addedToWorld and removedFromWorld
rollbackgameengine.World.prototype.decode = function(incomingMessage) {
	//decode processors
	for(var i=0, j=this.processors.length; i<j; i++) {
		if(this.processors[i].decode) {
			this.processors[i].decode(incomingMessage);
		}
	}

	//declare variables
	var currentOuterList = this.entitiesList.head;
	var currentInnerList = null;
	var count = 0;
	var temp = null;

	//loop through types
	while(currentOuterList) {
		//check encode
		if(currentOuterList.type.sync) {
			//set head
			currentInnerList = currentOuterList.head;

			//encode type
			if(currentOuterList.type.sync === rollbackgameengine.sync.singleton) {
				//singleton

				//loop through entities
				while(currentInnerList) {
					//decode
					currentInnerList.decode(incomingMessage);

					//increment
					currentInnerList = currentInnerList.nextEntity;
				}
			}else if(currentOuterList.type.sync === rollbackgameengine.sync.sometimes && !incomingMessage.nextBoolean()) {
				//sometimes with no elements

				//loop recycle remaining
				while(currentInnerList) {
					//recycle
					this.recycleEntity(currentInnerList);

					//increment
					currentInnerList = currentInnerList.nextEntity;
				}
			}else if(currentOuterList.type.sync === rollbackgameengine.sync.sometimes || currentOuterList.type.sync === rollbackgameengine.sync.often) {
				//sometimes or often

				//count
				count = incomingMessage.nextUnsignedInteger();

				//loop by count
				for(var i=0; i<count; i++) {
					if(currentInnerList) {
						//exists

						//decode
						currentInnerList.decode(incomingMessage);

						//increment
						currentInnerList = currentInnerList.nextEntity;
					}else {
						//new

						//create new - todo fix this as doing it this way can cause an unwanted addedToWorld call
						temp = this.addEntity(currentOuterList.type);
						this.updateLists(); //temp hack - not good enough since if addedToWorld creates another entity, this will cause it

						//decode
						temp.decode(incomingMessage);
					}
				}

				//loop recycle remaining
				while(currentInnerList) {
					//recycle
					this.recycleEntity(currentInnerList);

					//increment
					currentInnerList = currentInnerList.nextEntity;
				}
			}
		}

		//increment
		currentOuterList = currentOuterList.nextEntityList;
	}

	//update lists
	this.updateLists();

	//set frame?
};
