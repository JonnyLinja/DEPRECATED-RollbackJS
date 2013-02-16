
//==================================================//
// rollbackgameengine/sync.js
//==================================================//

rollbackgameengine.sync = {};
rollbackgameengine.sync.never = 0; //do not sync this entity
rollbackgameengine.sync.singleton = 1; //same number always exists
rollbackgameengine.sync.sometimes = 2; //bool for use, if true then followed by count and data
rollbackgameengine.sync.often = 3; //count followed by data

rollbackgameengine.sync.SyncCalculator = function() {
	this.list = new rollbackgameengine.datastructures.SinglyLinkedList();
}

rollbackgameengine.sync.SyncCalculator.prototype.calculateSyncValue = function() {
	//declare variables
	var value = 0;
	var current = null;

	//loop
	while(this.list.head) {
		//subtract
		current = this.list.pop();
		value -= current;

		//make positive
		if(value < 0) {
			value *= -1;
		}
	}

	//return
	return value;
}

rollbackgameengine.sync.SyncCalculator.prototype.addValue = function(num) {
	//make positive
	if(num < 0) {
		num *= -1;
	}

	//make integer
	num = ~~(num);

	//declare variables
	var current = this.list.head;
	var previous = null;

	//add head
	if(!current) {
		this.list.push(num);
		return;
	}

	//loop search
	while(current) {
		if(current.obj <= num) {
			//found
			if(!previous) {
				//is head
				this.list.push(num);
			}else {
				//not head

				//create node
				var node = this.list.createNode(num);

				//connect
				previous.next = node;
				node.next = current;
			}

			//exit
			return;
		}

		//increment
		previous = current;
		current = current.next;
	}

	//not found, insert at end
	this.list.add(num);
}

rollbackgameengine.sync.SyncCalculator.prototype.addBoolean = function(bool) {
	if(bool) {
		this.addValue(1);
	}
}

rollbackgameengine.sync.SyncCalculator.prototype.addUnsignedInteger = function(int) {
	this.addValue(int);
}

rollbackgameengine.sync.SyncCalculator.prototype.addSignedInteger = function(int) {
	this.addValue(int);
}

rollbackgameengine.sync.SyncCalculator.prototype.addUnsignedNumber = function(number) {
	this.addValue(number);
}

rollbackgameengine.sync.SyncCalculator.prototype.addSignedNumber = function(number) {
	this.addValue(number);
}

rollbackgameengine.sync.SyncCalculator.prototype.addFinalUnsignedInteger = function(int) {
	this.addValue(int);
}
