
//==================================================//
// rollbackgameengine/pool.js
//==================================================//

rollbackgameengine.pool = {
	//declare list of singly linked lists
	list : {},

	//acquire
	acquire : function(type) {
		//pop and return
		if(this.list[type]) {
			return this.list[type].pop();
		}

		//return null
		return null;
	},

	//add
	add : function(type, entity) {
		//create singly linked list
		if(!this.list[type]) {
			this.list[type] = new rollbackgameengine.datastructures.SinglyLinkedList();
		}

		//push
		this.list[type].push(entity);
	}
};
