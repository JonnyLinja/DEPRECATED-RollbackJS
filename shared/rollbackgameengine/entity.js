
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

	//update components
	if(!this.factory._updateComponents) {
		//create list
		this.factory._updateComponents = new rollbackgameengine.datastructures.SinglyLinkedList();
	}

	//render components
	if(!this.factory._renderComponents) {
		//create list
		this.factory._renderComponents = new rollbackgameengine.datastructures.SinglyLinkedList();
	}

	//rollback components
	if(!this.factory._rollbackComponents) {
		//create list
		this.factory._rollbackComponents = new rollbackgameengine.datastructures.SinglyLinkedList();
	}

	//loop components
	for(var i=0, j=arguments.length; i<j; i++) {
		//update
		if(arguments[i].update) {
			this.factory._updateComponents.add(arguments[i]);
		}

		//render
		if(arguments[i].render) {
			this.factory._renderComponents.add(arguments[i]);
		}

		//rollback
		if(arguments[i].rollback) {
			this.factory._rollbackComponents.add(arguments[i]);
		}
	}
}

rollbackgameengine.Entity.prototype.update = function() {
	//get top most element
	var current = this.factory._updateComponents.head;

	//loop through list
	while (current) {
		//update
		current.obj.update(this);

		//increment
		current = current.next;
	}

	//check factory
	if(this.factory.update) {
		this.factory.update(this);
	}
}

rollbackgameengine.Entity.prototype.render = function(ctx) {
	//get top most element
	var current = this.factory._renderComponents.head;

	//loop through list
	while (current) {
		//render
		current.obj.render(this, ctx);

		//increment
		current = current.next;
	}

	//check factory
	if(this.factory.render) {
		this.factory.render(this, ctx);
	}
}

rollbackgameengine.Entity.prototype.rollback = function(e) {
	//declare variables
	var current = this.factory._rollbackComponents.head;

	//loop through list
	while (current) {
		//rollback
		current.obj.rollback(this, e);

		//increment
		current = current.next;
	}

	//check factory
	if(this.factory.rollback) {
		this.factory.rollback(this, e);
	}
}
