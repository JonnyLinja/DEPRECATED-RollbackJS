
//==================================================//
// rollbackgameengine/entity.js
//==================================================//

//expects components to be passed in
rollbackgameengine.Entity = function(type) {
	//set type
	this.type = type;

	//reference to container world
	this.world = null;
};

rollbackgameengine.Entity.prototype.addedToWorld = function() {
	//components
	if(this.type._addedToWorldComponents) {
		//get top most element
		var current = this.type._addedToWorldComponents.head;

		//loop through list
		while (current) {
			//update
			current.obj.addedToWorld(this);

			//increment
			current = current.next;
		}
	}

	//type
	if(this.type.addedToWorld) {
		this.type.addedToWorld(this);
	}
};

rollbackgameengine.Entity.prototype.removedFromWorld = function() {
	//components
	if(this.type._removedFromWorldComponents) {
		//get top most element
		var current = this.type._removedFromWorldComponents.head;

		//loop through list
		while (current) {
			//update
			current.obj.removedFromWorld(this);

			//increment
			current = current.next;
		}
	}

	//type
	if(this.type.removedFromWorld) {
		this.type.removedFromWorld(this);
	}
};

rollbackgameengine.Entity.prototype.update = function() {
	//components
	if(this.type._updateComponents) {
		//get top most element
		var current = this.type._updateComponents.head;

		//loop through list
		while (current) {
			//update
			current.obj.update(this);

			//increment
			current = current.next;
		}
	}

	//type
	if(this.type.update) {
		this.type.update(this);
	}
};

rollbackgameengine.Entity.prototype.applyPrecision = function() {
	//components
	if(this.type._precisionComponents) {
		//get top most element
		var current = this.type._precisionComponents.head;

		//loop through list
		while (current) {
			//precision
			current.obj.applyPrecision(this);

			//increment
			current = current.next;
		}
	}

	//type
	if(this.type.applyPrecision) {
		this.type.applyPrecision(this);
	}
};

rollbackgameengine.Entity.prototype.render = function(ctx) {
	//components
	if(this.type._renderComponents) {
		//get top most element
		var current = this.type._renderComponents.head;

		//loop through list
		while (current) {
			//render
			current.obj.render(this, ctx);

			//increment
			current = current.next;
		}
	}

	//type
	if(this.type.render) {
		this.type.render(this, ctx);
	}
};

rollbackgameengine.Entity.prototype.rollback = function(e) {
	//components
	if(this.type._rollbackComponents) {
		//declare variables
		var current = this.type._rollbackComponents.head;

		//loop through list
		while (current) {
			//rollback
			current.obj.rollback(this, e);

			//increment
			current = current.next;
		}
	}

	//type
	if(this.type.rollback) {
		this.type.rollback(this, e);
	}
};

rollbackgameengine.Entity.prototype.encode = function(outgoingMessage) {
	//components
	if(this.type._syncComponents) {
		//declare variables
		var current = this.type._syncComponents.head;

		//loop through list
		while (current) {
			//sync
			current.obj.encode(this, outgoingMessage);

			//increment
			current = current.next;
		}
	}

	//type
	if(this.type.encode) {
		this.type.encode(this, outgoingMessage);
	}
};

rollbackgameengine.Entity.prototype.decode = function(incomingMessage) {
	//components
	if(this.type._syncComponents) {
		//declare variables
		var current = this.type._syncComponents.head;

		//loop through list
		while (current) {
			//sync
			current.obj.decode(this, incomingMessage);

			//increment
			current = current.next;
		}
	}

	//type
	if(this.type.decode) {
		this.type.decode(this, incomingMessage);
	}
};
