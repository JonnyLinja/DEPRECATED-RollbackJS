
//==================================================//
// rollbackgameengine/entity.js
//==================================================//

//expects components to be passed in
rollbackgameengine.Entity = function(factory) {
	//set factory
	this.factory = factory;

	//reference to container world
	this.world = null;
}

rollbackgameengine.Entity.prototype.loadComponents = function() {
	//determine loaded
	if(this.factory._loaded) {
		//no loading needed
		return;
	}else {
		//set loaded
		this.factory._loaded = true;
	}

	//loop components
	for(var i=0, j=arguments.length; i<j; i++) {
		//addedToWorld
		if(arguments[i].addedToWorld) {
			//create list
			if(!this.factory._addedToWorldComponents) {
				this.factory._addedToWorldComponents = new rollbackgameengine.datastructures.SinglyLinkedList();
			}

			//add to list
			this.factory._addedToWorldComponents.add(arguments[i]);
		}

		//removedFromWorld
		if(arguments[i].removedFromWorld) {
			//create list
			if(!this.factory._removedFromWorldComponents) {
				this.factory._removedFromWorldComponents = new rollbackgameengine.datastructures.SinglyLinkedList();
			}

			//add to list
			this.factory._removedFromWorldComponents.add(arguments[i]);
		}

		//update
		if(arguments[i].update) {
			//create list
			if(!this.factory._updateComponents) {
				this.factory._updateComponents = new rollbackgameengine.datastructures.SinglyLinkedList();
			}

			//add to list
			this.factory._updateComponents.add(arguments[i]);
		}

		//render
		if(arguments[i].render) {
			//create list
			if(!this.factory._renderComponents) {
				this.factory._renderComponents = new rollbackgameengine.datastructures.SinglyLinkedList();
			}

			//add to list
			this.factory._renderComponents.add(arguments[i]);
		}

		//rollback
		if(arguments[i].rollback) {
			//create list
			if(!this.factory._rollbackComponents) {
				this.factory._rollbackComponents = new rollbackgameengine.datastructures.SinglyLinkedList();
			}

			//add to list
			this.factory._rollbackComponents.add(arguments[i]);
		}
	}
}

rollbackgameengine.Entity.prototype.addedToWorld = function() {
	//components
	if(this.factory._addedToWorldComponents) {
		//get top most element
		var current = this.factory._addedToWorldComponents.head;

		//loop through list
		while (current) {
			//update
			current.obj.addedToWorld(this);

			//increment
			current = current.next;
		}
	}

	//factory
	if(this.factory.addedToWorld) {
		this.factory.addedToWorld(this);
	}
}

rollbackgameengine.Entity.prototype.removedFromWorld = function() {
	//components
	if(this.factory._removedFromWorldComponents) {
		//get top most element
		var current = this.factory._removedFromWorldComponents.head;

		//loop through list
		while (current) {
			//update
			current.obj.removedFromWorld(this);

			//increment
			current = current.next;
		}
	}

	//factory
	if(this.factory.removedFromWorld) {
		this.factory.removedFromWorld(this);
	}
}

rollbackgameengine.Entity.prototype.update = function() {
	//components
	if(this.factory._updateComponents) {
		//get top most element
		var current = this.factory._updateComponents.head;

		//loop through list
		while (current) {
			//update
			current.obj.update(this);

			//increment
			current = current.next;
		}
	}

	//factory
	if(this.factory.update) {
		this.factory.update(this);
	}
}

rollbackgameengine.Entity.prototype.render = function(ctx) {
	//components
	if(this.factory._renderComponents) {
		//get top most element
		var current = this.factory._renderComponents.head;

		//loop through list
		while (current) {
			//render
			current.obj.render(this, ctx);

			//increment
			current = current.next;
		}
	}

	//factory
	if(this.factory.render) {
		this.factory.render(this, ctx);
	}
}

rollbackgameengine.Entity.prototype.rollback = function(e) {
	//components
	if(this.factory._rollbackComponents) {
		//declare variables
		var current = this.factory._rollbackComponents.head;

		//loop through list
		while (current) {
			//rollback
			current.obj.rollback(this, e);

			//increment
			current = current.next;
		}
	}

	//factory
	if(this.factory.rollback) {
		this.factory.rollback(this, e);
	}
}
