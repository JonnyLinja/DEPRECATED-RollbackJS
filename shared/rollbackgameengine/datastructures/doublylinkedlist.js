
//==================================================//
// rollbackgameengine/datastructures/doublylinkedlist.js
//==================================================//

//modifies actual object to have next and prev instead of creating a node
//done so remove will work without a search (too slow) or a link back (modifies actual object + object needs to know to implement it)
//object must not use prev or next essentially

rollbackgameengine.datastructures.DoublyLinkedList = function(prev, next) {
	//store strings for next and previous
	this.prev = prev;
	this.next = next;

	//declare head and tail
	this.head = null;
	this.tail = null;
}

//inserts at the head
rollbackgameengine.datastructures.DoublyLinkedList.prototype.push = function(o) {
	//create node
	o[this.prev] = null;

	if(!this.head) {
		//empty
		this.head = o;
		this.tail = o;
		o[this.next] = null;
	}else {
		//at least one
		o[this.next] = this.head;
		this.head.prev = o;
		this.head = o;
	}
}

//removes head
rollbackgameengine.datastructures.DoublyLinkedList.prototype.pop = function() {
	//at least one
	if(this.head) {
		//get node
		var o = this.head;

		//increment head
		this.head = this.head[this.next];

		if(!this.head) {
			//if list is now empty, reset tail
			this.tail = null;
		}else {
			//remove new head's previous
			this.head[this.prev] = null;
		}

		//remove node
		o[this.prev] = null;
		o[this.next] = null;

		//return
		return o;
	}

	//empty
	return null;
}

//adds to the tail
rollbackgameengine.datastructures.DoublyLinkedList.prototype.add = function(o) {
	//create node
	o[this.next] = null;

	if(!this.tail) {
		//empty
		this.head = o;
		this.tail = o;
		o[this.prev] = null;
	}else {
		//at least one
		this.tail[this.next] = o;
		o[this.prev] = this.tail;
		this.tail = o;
	}
}

//inserts before
rollbackgameengine.datastructures.DoublyLinkedList.prototype.insertBefore = function(o, rightNode) {
	//connect new node
	o[this.next] = rightNode;
	o[this.prev] = rightNode[this.prev];

	//connect node to new node
	rightNode[this.prev] = o;

	//connect right node
	if(rightNode === this.head) {
		//set head
		this.head = o;
	}else {
		//connect left node
		o[this.prev][this.next] = o;
	}
}

//inserts after
rollbackgameengine.datastructures.DoublyLinkedList.prototype.insertAfter = function(o, leftNode) {
	//connect new node
	o[this.next] = leftNode[this.next];
	o[this.prev] = leftNode;

	//connect node to new node
	leftNode[this.next] = o;

	//connect right node
	if(leftNode === this.tail) {
		//set tail
		this.tail = o;
	}else {
		//connect right node
		o[this.next][this.prev] = o;
	}
}

//remove from list
rollbackgameengine.datastructures.DoublyLinkedList.prototype.remove = function(o) {
	if(o === this.head) {
		//remove head is pop
		this.pop();
	}else {
		//not the head

		//first link
		o[this.prev][this.next] = o[this.next];

		if(o === this.tail) {
			//tail
			this.tail = o[this.prev];
		}else {
			//second link
			o[this.next][this.prev] = o[this.prev];
		}

		//remove node
		o[this.prev] = null;
		o[this.next] = null;
		o = null;
	}
}

//swaps two nodes
//assumes o1 and o2 are part of the list
rollbackgameengine.datastructures.DoublyLinkedList.prototype.swap = function(o1, o2) {
	//save o1 links
	var tempPrev = o1[this.prev];
	var tempNext = o1[this.next];

	//set o1 to o2
	o1[this.prev] = o2[this.prev];
	o1[this.next] = o2[this.next];

	//set o1 left
	if(o1[this.prev]) {
		o1[this.prev][this.next] = o1;
	}else {
		this.head = o1;
	}

	//set o1 right
	if(o1[this.next]) {
		o1[this.next][this.prev] = o1;
	}else {
		this.tail = o1;
	}

	//set o2 to o1
	o2[this.prev] = tempPrev;
	o2[this.next] = tempNext;

	//set o2 left
	if(o2[this.prev]) {
		o2[this.prev][this.next] = o2;
	}else {
		this.head = o2;
	}

	//set o2 right
	if(o2[this.next]) {
		o2[this.next][this.prev] = o2;
	}else {
		this.tail = o2;
	}
}
