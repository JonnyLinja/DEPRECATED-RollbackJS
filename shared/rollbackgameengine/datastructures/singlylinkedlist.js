
//==================================================//
// rollbackgameengine/datastructures/singlylinkedlist.js
//==================================================//

rollbackgameengine.datastructures.SinglyLinkedListNode = function(o) {
	this.obj = o;
	this.next = null;
};

rollbackgameengine.datastructures.SinglyLinkedList = function() {
	this.head = null;
	this.tail = null;
};

rollbackgameengine.datastructures.SinglyLinkedListPool = null;

rollbackgameengine.datastructures.SinglyLinkedList.prototype.createNode = function(o) {
	//create node
	var node = null;
	if(rollbackgameengine.datastructures.SinglyLinkedListPool) {
		//pooled
		node = rollbackgameengine.datastructures.SinglyLinkedListPool;
		node.obj = o;
		rollbackgameengine.datastructures.SinglyLinkedListPool = rollbackgameengine.datastructures.SinglyLinkedListPool.next;
	}else {
		//new
		node = new rollbackgameengine.datastructures.SinglyLinkedListNode(o);
	}

	//return
	return node;
};

rollbackgameengine.datastructures.SinglyLinkedList.prototype.add = function(o) {
	//node
	var node = this.createNode(o);
	node.next = null;

	//connect
	if(!this.head) {
		//first node
		this.head = node;
	}else {
		//add to list
		this.tail.next = node;
	}

	//set tail
	this.tail = node;
};

rollbackgameengine.datastructures.SinglyLinkedList.prototype.push = function(o) {
	//node
	var node = this.createNode(o);

	//set tail
	if(!this.tail) {
		this.tail = node;
	}

	//add to list
	node.next = this.head;
	this.head = node;
};

rollbackgameengine.datastructures.SinglyLinkedList.prototype.pop = function() {
	//grab head
	var node = this.head;

	if(this.head) {
		//at least one

		//increment head
		this.head = this.head.next;

		//reset tail on last node
		if(!this.head) {
			this.tail = null;
		}

		//add to pool
		if(rollbackgameengine.datastructures.SinglyLinkedListPool) {
			node.next = rollbackgameengine.datastructures.SinglyLinkedListPool;
		}else {
			node.next = null;
		}
		rollbackgameengine.datastructures.SinglyLinkedListPool = node;

		//remove obj
		var obj = node.obj;
		node.obj = null;

		//return
		return obj;
	}else {
		//none
		return null;
	}
};
