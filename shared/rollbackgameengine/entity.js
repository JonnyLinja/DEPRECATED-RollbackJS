
//==================================================//
// rollbackgameengine/entity.js
//==================================================//

//expects components to be passed in
rollbackgameengine.Entity = function() {
	//declare linked lists
	this.updateComponents = new rollbackgameengine.datastructures.SinglyLinkedList();
	this.renderComponents = new rollbackgameengine.datastructures.SinglyLinkedList();
	this.rollbackComponents = new rollbackgameengine.datastructures.SinglyLinkedList();

	//class identifier - NOT for collisions, do not change manually
	this.factory = null;

	//reference to container world
	this.world = null;

	//add components
	var component = null;
	var hasArguments = false;
	for (var i=0, j=arguments.length; i<j; i++) {
		//has arguments
		hasArguments = (i+1 < j) && (arguments[i+1] instanceof Array);

		//create
		component = new arguments[i];

		//set entity
		component.entity = this;

		//init
		if(component.init) {
			if(!hasArguments) {
				//no arguments
				component.init();
			}else {
				//arguments
				component.init.apply(component, arguments[i+1]);
			}
		}

		//add update
		if(component.update) {
			this.updateComponents.add(component);
		}

		//add render
		if(component.render) {
			this.renderComponents.add(component);
		}

		//add rollback
		if(component.rollback) {
			this.rollbackComponents.add(component);
		}

		//skip
		if(hasArguments) {
			i++;
		}
	}
}

rollbackgameengine.Entity.prototype.update = function() {
	//get top most element
	var current = this.updateComponents.head;

	//loop through list
	while (current) {
		//update
		current.obj.update();

		//increment
		current = current.next;
	}
}

rollbackgameengine.Entity.prototype.render = function(ctx) {
	//get top most element
	var current = this.renderComponents.head;

	//loop through list
	while (current) {
		//render
		current.obj.render(ctx);

		//increment
		current = current.next;
	}
}

rollbackgameengine.Entity.prototype.rollback = function(e) {
	//declare variables
	var myCurrent = this.rollbackComponents.head;
	var theirCurrent = e.rollbackComponents.head;

	//loop through list
	while (myCurrent) {
		//rollback
		myCurrent.obj.rollback(theirCurrent.obj);

		//increment
		myCurrent = myCurrent.next;
		theirCurrent = theirCurrent.next;
	}
}
