//==================================================//
// rollbackgameengine/engine.js
//==================================================//

//declare namespaces
var rollbackgameengine = {};
rollbackgameengine.datastructures = {};
rollbackgameengine.networking = {};
rollbackgameengine.components = {};

//nodejs
if(typeof window === 'undefined') {
	console.log("nodejs detected, exporting");
	module.exports = rollbackgameengine;
}

//easy to read combine script
/*
type shared\rollbackgameengine\engine.js shared\rollbackgameengine\id.js shared\rollbackgameengine\sync.js shared\rollbackgameengine\networking\message.js
shared\rollbackgameengine\networking\incomingmessage.js shared\rollbackgameengine\networking\outgoingmessage.js
shared\rollbackgameengine\networking\variablemessage.js shared\rollbackgameengine\datastructures\singlylinkedlist.js
shared\rollbackgameengine\datastructures\doublylinkedlist.js shared\rollbackgameengine\components\frame.js
shared\rollbackgameengine\components\collision.js shared\rollbackgameengine\components\spritemap.js
shared\rollbackgameengine\components\preventoverlap.js shared\rollbackgameengine\components\removedafter.js
shared\rollbackgameengine\pool.js shared\rollbackgameengine\entity.js shared\rollbackgameengine\world.js > rollbackgameengine.js
*/

//combined script
//type shared\rollbackgameengine\engine.js shared\rollbackgameengine\id.js shared\rollbackgameengine\sync.js shared\rollbackgameengine\networking\message.js shared\rollbackgameengine\networking\incomingmessage.js shared\rollbackgameengine\networking\outgoingmessage.js shared\rollbackgameengine\networking\variablemessage.js shared\rollbackgameengine\datastructures\singlylinkedlist.js shared\rollbackgameengine\datastructures\doublylinkedlist.js shared\rollbackgameengine\components\frame.js shared\rollbackgameengine\components\collision.js shared\rollbackgameengine\components\spritemap.js shared\rollbackgameengine\components\preventoverlap.js shared\rollbackgameengine\components\removedafter.js shared\rollbackgameengine\pool.js shared\rollbackgameengine\entity.js shared\rollbackgameengine\world.js > rollbackgameengine.js

//==================================================//
// rollbackgameengine/id.js
//==================================================//

//identifiers
rollbackgameengine.identifiers = 1;
rollbackgameengine.giveID = function(o) {
	if(!o.hasOwnProperty("toString")) {
		var newIdentifier = rollbackgameengine.identifiers++ + "";
		o.toString = function() {
			return newIdentifier;
		};
	}
};

//==================================================//
// rollbackgameengine/sync.js
//==================================================//

rollbackgameengine.sync = {};
rollbackgameengine.sync.never = 0; //do not sync this entity
rollbackgameengine.sync.singleton = 1; //same number always exists
rollbackgameengine.sync.sometimes = 2; //bool for use, if true then followed by count and data
rollbackgameengine.sync.often = 3; //count followed by data

//==================================================//
// rollbackgameengine/networking/message.js
//==================================================//

rollbackgameengine.networking.messageBitSize = 8;
rollbackgameengine.networking.variableLengthEncodeBitSize = 7;
rollbackgameengine.networking.calculateUnsignedIntegerBitSize = function(num) {
	//declare variables
	var compareValue = 1;
	var frameBitSize = 0;

	//integer cast
	num = ~~(num);

	//normalize int
	if(num < 0) {
		num *= -1;
	}

	//loop
	while(num >= compareValue) {
		//increase compare value
		compareValue *= 2;

		//increment bit size
		frameBitSize++;
	}

	//0 check
	if(frameBitSize == 0) {
		frameBitSize++;
	}

	//return
	return frameBitSize;
};
rollbackgameengine.networking.calculateVariableLengthUnsignedIntegerBitSize = function(num) {
	//initial bit size
	var bitSize = rollbackgameengine.networking.calculateUnsignedIntegerBitSize(num);
	
	//return calculated
	return Math.ceil(bitSize/rollbackgameengine.networking.variableLengthEncodeBitSize) * (rollbackgameengine.networking.variableLengthEncodeBitSize+1);
};

//==================================================//
// rollbackgameengine/networking/incomingmessage.js
//==================================================//

//THERE MAY BE A PROBLEM IN THAT INCOMING ARRAYBUFFER IS SUPPOSEDLY READONLY, BUT IM MODIFYING IT

rollbackgameengine.networking.IncomingMessage = function(arrayBuffer) {
	if(arrayBuffer) {
		this.setArrayBuffer(arrayBuffer);
	}
}

//for client use
rollbackgameengine.networking.IncomingMessage.prototype.setArrayBuffer = function(arrayBuffer) {
	this.arrayPosition = 0;
	this.bitPosition = rollbackgameengine.networking.messageBitSize;
	this.arrayBuffer = arrayBuffer;
	this.array = new Uint8Array(this.arrayBuffer);
}

//for server use
rollbackgameengine.networking.IncomingMessage.prototype.setArray = function(array) {
	this.arrayPosition = 0;
	this.bitPosition = rollbackgameengine.networking.messageBitSize;
	this.array = array;
}

//to be implemented later for data dump purposes
rollbackgameengine.networking.IncomingMessage.prototype.hasNext = function() {
	return true;
}

rollbackgameengine.networking.IncomingMessage.prototype.nextBoolean = function() {
	//update bit position
	this.bitPosition--;

	//get shifted boolean
	var bool = this.array[this.arrayPosition] >> this.bitPosition;

	//remove from array
	this.array[this.arrayPosition] -= bool << this.bitPosition;

	//bit position check
	if(this.bitPosition <= 0) {
		this.bitPosition = rollbackgameengine.networking.messageBitSize;
		this.arrayPosition++;
	}

	//return
	return (bool == 1);
}

rollbackgameengine.networking.IncomingMessage.prototype.nextUnsignedInteger = function(size) {
	if(typeof size === 'undefined') {
		//variable length

		//declare variables
		var returnValue = 0;

		//loop
		while(true) {
			//shift existing
			returnValue = returnValue << rollbackgameengine.networking.variableLengthEncodeBitSize;

			//get next piece
			returnValue += this.nextUnsignedInteger(rollbackgameengine.networking.variableLengthEncodeBitSize);

			//determine end
			if(!this.nextBoolean()) {
				break;
			}
		}

		//return
		return returnValue;
	}else {
		//fixed length

		//declare variables
		var shiftAmount = this.bitPosition - size;
		var returnValue = 0;
		var shiftedValue = null;
		
		//loop partial get
		while(shiftAmount < 0) {
			//get shifted value
			shiftedValue = this.array[this.arrayPosition] << -1*shiftAmount;
			
			//add it to return value
			returnValue += shiftedValue;
			
			//remove value from array
			this.array[this.arrayPosition] = 0;
			
			//increment size
			size -= this.bitPosition;
			
			//go to next array and bit position
			this.bitPosition = rollbackgameengine.networking.messageBitSize;
			this.arrayPosition++;
			
			//recalculate shift amount
			shiftAmount = this.bitPosition - size;
		}
		
		//finish add remaining
		
		//get shifted value
		shiftedValue = this.array[this.arrayPosition] >> shiftAmount;
			
		//add it to return value
		returnValue += shiftedValue;
			
		//remove unshifted version from array position
		this.array[this.arrayPosition] -= shiftedValue << shiftAmount;
			
		//increment bit position
		this.bitPosition -= size;

		//bit position check
		if(this.bitPosition <= 0) {
			this.bitPosition = rollbackgameengine.networking.messageBitSize;
			this.arrayPosition++;
		}
		
		//return
		return returnValue;
	}
}

rollbackgameengine.networking.IncomingMessage.prototype.nextSignedInteger = function(size) {
	if(this.nextBoolean()) {
		//negative
		if(typeof size !== 'undefined') {
			//fixed length
			return -1 * this.nextUnsignedInteger(size-1);
		}else {
			//variable length
			return -1 * this.nextUnsignedInteger();
		}
	}else {
		//positive
		if(typeof size !== 'undefined') {
			//fixed length
			return this.nextUnsignedInteger(size-1);
		}else {
			//variable length
			return this.nextUnsignedInteger();
		}
	}
}

//uses strings to move decimal place around
//creates garbage but is necessary to preserve data accuracy
//multiplication/division can change the value due to floating point
rollbackgameengine.networking.IncomingMessage.prototype.nextUnsignedNumber = function(precision, size) {
	if(typeof size !== 'undefined') {
		//fixed length
		var numberString = this.nextUnsignedInteger(size) + "";
		var intString = numberString.substring(0, numberString.length-precision);
		var decimalString = numberString.substring(numberString.length-precision, numberString.length);
		return parseFloat(intString + '.' + decimalString);
	}else {
		//variable length
		return parseFloat(this.nextUnsignedInteger() + "." + this.nextUnsignedInteger());
	}
}

rollbackgameengine.networking.IncomingMessage.prototype.nextSignedNumber = function(precision, size) {
	if(this.nextBoolean()) {
		//negative
		if(typeof size !== 'undefined') {
			//fixed length
			return -1 * this.nextUnsignedNumber(precision, size-1);
		}else {
			//variable length
			return -1 * this.nextUnsignedNumber(precision);
		}
	}else {
		//positive
		if(typeof size !== 'undefined') {
			//fixed length
			return this.nextUnsignedNumber(precision, size-1);
		}else {
			//variable length
			return this.nextUnsignedNumber(precision);
		}
	}
}

rollbackgameengine.networking.IncomingMessage.prototype.finalUnsignedInteger = function() {
	var bitsRemaining = (this.array.length * rollbackgameengine.networking.messageBitSize) - (this.arrayPosition * rollbackgameengine.networking.messageBitSize) - (rollbackgameengine.networking.messageBitSize - this.bitPosition);
	return this.nextUnsignedInteger(bitsRemaining);
}

//==================================================//
// rollbackgameengine/networking/outgoingmessage.js
//==================================================//

rollbackgameengine.networking.OutgoingMessage = function(byteSize) {
	this.byteSize = byteSize;
	this.arrayPosition = 0;
	this.bitPosition = rollbackgameengine.networking.messageBitSize;
	this.arrayBuffer = new ArrayBuffer(byteSize);
	this.array = new Uint8Array(this.arrayBuffer);
}

rollbackgameengine.networking.OutgoingMessage.prototype.reset = function() {
	this.arrayPosition = 0;
	this.bitPosition = rollbackgameengine.networking.messageBitSize;

	//reset everything to 0
	for(var i=0, j=this.array.length; i<j; i++) {
		this.array[i] = 0;
	}
}

rollbackgameengine.networking.OutgoingMessage.prototype.addBoolean = function(bool) {
	//update bit position
	this.bitPosition--;

	//convert and add to value
	if(bool) {
		this.array[this.arrayPosition] += 1 << this.bitPosition;
	}

	//bit position check
	if(this.bitPosition <= 0) {
		this.bitPosition = rollbackgameengine.networking.messageBitSize;
		this.arrayPosition++;
	}
}

rollbackgameengine.networking.OutgoingMessage.prototype.addUnsignedInteger = function(int, size) {
	//integer check
	int = ~~(int);

	if(typeof size === 'undefined') {
		//variable length

		//declare variables
		var bitSize = rollbackgameengine.networking.calculateUnsignedIntegerBitSize(int);
		var shiftAmount = 0;
		var shiftedValue = null;

		//shift amount
		shiftedValue = bitSize;
		while(shiftedValue > rollbackgameengine.networking.variableLengthEncodeBitSize) {
			//shift amount
			shiftAmount += rollbackgameengine.networking.variableLengthEncodeBitSize;

			//decrement
			shiftedValue -= rollbackgameengine.networking.variableLengthEncodeBitSize;
		}

		//loop partial add
		while(bitSize > 0) {
			//decrement
			bitSize -= rollbackgameengine.networking.variableLengthEncodeBitSize;

			//shift
			shiftedValue = int >> shiftAmount;

			//add integer
			this.addUnsignedInteger(shiftedValue, rollbackgameengine.networking.variableLengthEncodeBitSize);

			//add boolean
			this.addBoolean((bitSize > 0));

			//shift value back
			shiftedValue = shiftedValue << shiftAmount;

			//subtract from initial int
			int -= shiftedValue;

			//decrease shift amount
			shiftAmount -= rollbackgameengine.networking.variableLengthEncodeBitSize;
		}
	}else {
		//fixed length

		//declare variables
		var shiftAmount = this.bitPosition - size;
		var shiftedValue = null;
			
		//loop partial add if needed
		while(shiftAmount < 0) {
			//partial value
			shiftedValue = int >> -1*shiftAmount;
			
			//add value to array[arrayPosition]
			this.array[this.arrayPosition] += shiftedValue;
				
			//remove from number (unshifted value)
			int -= shiftedValue << size - this.bitPosition;
			
			//increment size
			size -= this.bitPosition;
			
			//go to next array and bit position
			this.bitPosition = rollbackgameengine.networking.messageBitSize;
			this.arrayPosition++;
				
			//recalculate shift amount
			shiftAmount = this.bitPosition - size;
		}
			
		//finish add remaining
		
		//get value and return
		this.array[this.arrayPosition] += int << shiftAmount;

		//increment bit position
		this.bitPosition -= size;

		//bit position check
		if(this.bitPosition <= 0) {
			this.bitPosition = rollbackgameengine.networking.messageBitSize;
			this.arrayPosition++;
		}
	}
}

rollbackgameengine.networking.OutgoingMessage.prototype.addSignedInteger = function(int, size) {
	//add sign
	if(int < 0) {
		//negative
		int *= -1;
		this.addBoolean(true);
	}else {
		//position
		this.addBoolean(false);
	}

	//add integer
	if(typeof size !== 'undefined') {
		//fixed length
		this.addUnsignedInteger(int, size-1);
	}else {
		//variable length
		this.addUnsignedInteger(int);
	}
}

//uses strings to move decimal place around
//creates garbage but is necessary to preserve data accuracy
//multiplication/division can change the value due to floating point
rollbackgameengine.networking.OutgoingMessage.prototype.addUnsignedNumber = function(number, precision, size) {
	//declare variables
	var numberString = number+"";

	if(typeof size !== 'undefined') {
		//fixed length

		//get decimal position
		var position = numberString.indexOf('.');

		if(position === -1) {
			//no decimal

			//add 0s
			for(var i=0; i<precision; i++) {
				numberString += "0";
			}

			//add integer
			this.addUnsignedInteger(parseInt(numberString));
		}else {
			//has decimal

			//trim uneeded precision
			var numberString = numberString.substring(0, position+1+precision);

			//add 0s
			for(var i=numberString.length, j=position+1+precision; i<j; i++) {
				numberString += "0";
			}

			//add integer
			this.addUnsignedInteger(parseInt(numberString.replace('.', '')), size);
		}
	}else {
		//variable length

		//add integer part
		this.addUnsignedInteger(number);

		//add decimal part - uses strings to guarantee accuracy
		if(numberString.indexOf('.') === -1) {
			//no decimal
			this.addUnsignedInteger(0); //kind of a waste of bits, but no choice
		}else {
			//has decimal
			if(typeof precision !== 'undefined') {
				//use precision
				this.addUnsignedInteger(parseInt(numberString.replace(/[0-9]+\./g,'').substring(0, precision)));
			}else {
				//use full value - dangerous
				this.addUnsignedInteger(parseInt(numberString.replace(/[0-9]+\./g,'')));
			}
		}
	}
}

rollbackgameengine.networking.OutgoingMessage.prototype.addSignedNumber = function(number, precision, size) {
	//add sign
	if(number < 0) {
		//negative
		number *= -1;
		this.addBoolean(true);
	}else {
		//position
		this.addBoolean(false);
	}

	//add number
	if(typeof size !== 'undefined') {
		//fixed length
		this.addUnsignedNumber(number, precision, size-1);
	}else {
		//variable length
		this.addUnsignedNumber(number, precision);
	}
}

rollbackgameengine.networking.OutgoingMessage.prototype.addFinalUnsignedInteger = function(number) {
	var bitsRemaining = (this.byteSize * rollbackgameengine.networking.messageBitSize) - (this.arrayPosition * rollbackgameengine.networking.messageBitSize) - (rollbackgameengine.networking.messageBitSize - this.bitPosition);
	this.addUnsignedInteger(number, bitsRemaining);
}

//==================================================//
// rollbackgameengine/networking/variablemessage.js
// intended for use by the server
// so less focus on garbage collection
//==================================================//

rollbackgameengine.networking.VariableMessage = function(byteSize) {
	this.bitSize = 0;
	this.inputs = new rollbackgameengine.datastructures.SinglyLinkedList();
}

rollbackgameengine.networking.VariableMessage.prototype.constructMessage = function() {
	//create message
	var message = new rollbackgameengine.networking.OutgoingMessage(Math.ceil(this.bitSize/8));

	//loop add commands
	var current = this.inputs.pop();
	while(current !== null) {
		//determine type
		if(typeof current === 'boolean') {
			//boolean
			message.addBoolean(current);
		}else if(current.isInteger) {
			//integer
			if(current.isSigned) {
				//signed
				message.addSignedInteger(current.value, current.size);
			}else {
				//unsigned
				message.addUnsignedInteger(current.value, current.size);
			}
		}else {
			//number
			if(current.isSigned) {
				//signed
				message.addSignedNumber(current.value, current.precision, current.size);
			}else {
				//unsigned
				message.addUnsignedNumber(current.value, current.precision, current.size);
			}
		}

		//increment
		current = this.inputs.pop();
	}

	//return
	return message;
}

rollbackgameengine.networking.VariableMessage.prototype.addBoolean = function(bool) {
	//increment bit size
	this.bitSize++;

	//push
	this.inputs.add(bool);
}

rollbackgameengine.networking.VariableMessage.prototype.addUnsignedInteger = function(int, size) {
	//increment bit size
	if(typeof size !== 'undefined') {
		//fixed length
		this.bitSize += size;
	}else {
		//variable length
		this.bitSize += rollbackgameengine.networking.calculateVariableLengthUnsignedIntegerBitSize(int);
	}

	//push
	this.inputs.add({
		isInteger:true,
		isSigned:false,
		value:int,
		size:size
	});
}

rollbackgameengine.networking.VariableMessage.prototype.addSignedInteger = function(int, size) {
	//increment bit size
	if(typeof size !== 'undefined') {
		//fixed length
		this.bitSize += size;
	}else {
		//variable length
		this.bitSize += rollbackgameengine.networking.calculateVariableLengthUnsignedIntegerBitSize(int) + 1;
	}

	//push
	this.inputs.add({
		isInteger:true,
		isSigned:true,
		value:int,
		size:size
	});
}

rollbackgameengine.networking.VariableMessage.prototype.addUnsignedNumber = function(number, precision, size) {
	//increment bit size
	if(typeof size !== 'undefined') {
		//fixed length
		this.bitSize += size;
	}else {
		//variable length

		//number string
		var numberString = number + "";

		//integer
		this.bitSize += rollbackgameengine.networking.calculateVariableLengthUnsignedIntegerBitSize(number);

		//decimal
		if(numberString.indexOf('.') === -1) {
			//no decimal found
			this.bitSize += rollbackgameengine.networking.calculateVariableLengthUnsignedIntegerBitSize(0);
		}else {
			//has decimal
			if(typeof precision !== 'undefined') {
				//use precision
				this.bitSize += rollbackgameengine.networking.calculateVariableLengthUnsignedIntegerBitSize(parseInt(numberString.replace(/[0-9]+\./g,'').substring(0, precision)));
			}else {
				//use full value - dangerous
				this.bitSize += rollbackgameengine.networking.calculateVariableLengthUnsignedIntegerBitSize(parseInt(numberString.replace(/[0-9]+\./g,'')));
			}
		}
	}

	//push
	this.inputs.add({
		isInteger:false,
		isSigned:false,
		value:number, 
		precision:precision,
		size:size
	});
}

rollbackgameengine.networking.VariableMessage.prototype.addSignedNumber = function(number, precision, size) {
	//increment bit size
	if(typeof size !== 'undefined') {
		//fixed length
		this.bitSize += size;
	}else {
		//variable length

		//number string
		var numberString;
		if(number < 0) {
			numberString = (-1*number) + "";
		}else {
			numberString = number + "";
		}

		//integer and boolean
		this.bitSize += rollbackgameengine.networking.calculateVariableLengthUnsignedIntegerBitSize(number) + 1;

		//decimal
		if(numberString.indexOf('.') === -1) {
			//no decimal found
			this.bitSize += rollbackgameengine.networking.calculateVariableLengthUnsignedIntegerBitSize(0);
		}else {
			//has decimal
			if(typeof precision !== 'undefined') {
				//use precision
				this.bitSize += rollbackgameengine.networking.calculateVariableLengthUnsignedIntegerBitSize(parseInt(numberString.replace(/[0-9]+\./g,'').substring(0, precision)));
			}else {
				//use full value - dangerous
				this.bitSize += rollbackgameengine.networking.calculateVariableLengthUnsignedIntegerBitSize(parseInt(numberString.replace(/[0-9]+\./g,'')));
			}
		}
	}

	//push
	this.inputs.add({
		isInteger:false,
		isSigned:true,
		value:number,
		precision:precision,
		size:size
	});
}

rollbackgameengine.networking.VariableMessage.prototype.addFinalUnsignedInteger = function(int) {
	//todo
}

//==================================================//
// rollbackgameengine/datastructures/singlylinkedlist.js
//==================================================//

rollbackgameengine.datastructures.SinglyLinkedListNode = function(o) {
	this.obj = o;
	this.next = null;
}

rollbackgameengine.datastructures.SinglyLinkedList = function() {
	this.head = null;
	this.tail = null;
}

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
}

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
}

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
}

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
}

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

	//count
	this.count = 0;
}

//inserts at the head
rollbackgameengine.datastructures.DoublyLinkedList.prototype.push = function(o) {
	//create node
	o[this.prev] = null;

	//connect
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

	//count
	this.count++;
}

//removes head
rollbackgameengine.datastructures.DoublyLinkedList.prototype.pop = function() {
	//at least one
	if(this.head) {
		//get node
		var o = this.head;

		//increment head
		this.head = this.head[this.next];

		//remove connections
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

		//count
		this.count--;

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

	//connect
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

	//count
	this.count++;
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

	//count
	this.count++;
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

	//count
	this.count++;
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

		//remove connections
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

		//count
		this.count--;
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

//==================================================//
// rollbackgameengine/components/frame.js
//==================================================//

rollbackgameengine.components.frame = {
	load : function(entity, x, y, width, height) {
		//add default properties to parent
		entity.x = x;
		entity.y = y;
		entity.width = width;
		entity.height = height;
		entity.moveX = 0;
		entity.moveY = 0;

		//add get functions
		entity.__defineGetter__("right",  this._right);
		entity.__defineGetter__("bottom",  this._bottom);
		entity.__defineGetter__("centerX",  this._centerX);
		entity.__defineGetter__("centerY",  this._centerY);

		//add center function
		entity.center = this._center;

		//return
		return this;
	},

	update : function(entity) {
		//move
		entity.x += entity.moveX;
		entity.y += entity.moveY;
		entity.moveX = 0;
		entity.moveY = 0;
	},
	
	rollback : function(entity1, entity2) {
		//rollback values
		entity1.x = entity2.x;
		entity1.y = entity2.y;
		entity1.width = entity2.width;
		entity1.height = entity2.height;
		entity1.moveX = entity2.moveX;
		entity1.moveY = entity2.moveY;
	},

	encode : function(entity, outgoingMessage) {
		outgoingMessage.addSignedNumber(entity.x, 2);
		outgoingMessage.addSignedNumber(entity.y, 2);
	},

	decode : function(entity, incomingMessage) {
		entity.x = incomingMessage.nextSignedNumber(2);
		entity.y = incomingMessage.nextSignedNumber(2);
	},

	//this refers to entity
	_right : function() {
		return this.x + this.width;
	},

	//this refers to entity
	_bottom : function() {
		return this.y + this.height;
	},

	//this refers to entity
	_centerX : function() {
		return (this.width * 0.5) + this.x;
	},

	//this refers to entity
	_centerY : function() {
		return (this.height * 0.5) + this.y;
	},

	//this refers to entity
	_center : function(x, y) {
		this.x = x - Math.floor(this.width * 0.5);
		this.y = y - Math.floor(this.height * 0.5);
	}
}

//==================================================//
// rollbackgameengine/components/collision.js
//==================================================//

rollbackgameengine.components.collision = {
	load : function(entity) {
		//collidable
		entity.collidable = true;

		//collision map
		if(!entity.factory._collisionMap) {
			entity.factory._collisionMap = {};
		}

		//functions
		entity.registerCollision = this._registerCollision;
		entity.didCollide = this._didCollide;

		//return
		return this;
	},

	rollback : function(entity1, entity2) {
		//rollback values
		entity1.collidable = entity2.collidable;
	},

	//this refers to entity
	_registerCollision : function(factory, component) {
		//check loaded
		if(this.factory._loaded) {
			return;
		}

		//create new
		if(!this.factory._collisionMap[factory]) {
			this.factory._collisionMap[factory] = new rollbackgameengine.datastructures.SinglyLinkedList();
		}

		//add
		this.factory._collisionMap[factory].add(component);
	},

	//this refers to entity
	_didCollide : function(entity) {
		//check if a component is registered
		if(!this.factory._collisionMap[entity.factory]) {
			return;
		}

		//declare variables
		var current = this.factory._collisionMap[entity.factory].head;

		//loop through components
		while (current) {
			//callback
			current.obj.didCollide(this, entity);

			//increment
			current = current.next;
		}

		//check factory
		if(this.factory.didCollide) {
			this.factory.didCollide(this, entity);
		}
	}
}

//==================================================//
// rollbackgameengine/components/spritemap.js
// todo - create internal id system to represent animations per entity
// dont want the internal code to use string identifiers but want networking to use it
//==================================================//

rollbackgameengine.components.spritemap = {
	load : function(entity, imagesrc) {
		//save url
		entity.imagesrc = imagesrc;

		//values
		entity._spritemapAnimationFrame = 0;
		entity.spritemapAnimation = null;
		entity.spritemapAnimationIsLooping = false;
		entity.spritemapAnimationRate = 1;
		entity._spritemapAnimationPosition = 0;

		//getters and setters
		entity.__defineGetter__("spritemapAnimationFrame",  this._getSpritemapAnimationFrame);
		entity.__defineSetter__("spritemapAnimationFrame",  this._setSpritemapAnimationFrame);

		//animate function
		entity.animateSpritemap = this._animateSpritemap;

		//return
		return this;
	},

	update : function(entity) {
		//animate
		if(entity.spritemapAnimation && entity._spritemapAnimationPosition >= 0) {
			//increment array position
			entity._spritemapAnimationPosition++;

			//rate check
			if(entity._spritemapAnimationPosition % entity.spritemapAnimationRate !== 0) {
				return;
			}

			//get normalized position
			var position = Math.floor(entity._spritemapAnimationPosition / entity.spritemapAnimationRate);

			//max check
			if(position >= entity.spritemapAnimation.length) {
				if(entity.spritemapAnimationIsLooping) {
					//set to beginning
					entity._spritemapAnimationPosition = 0;
					position = 0;
				}else {
					//end animation
					entity._spritemapAnimationPosition = -1;
					return;
				}
			}

			//get frame
			entity._spritemapAnimationFrame = entity.spritemapAnimation[position];
		}
	},

	render : function(entity, ctx) {
		//create image
		if(!entity.image) {
			entity.image = new Image();
			entity.image.src = entity.imagesrc;
		}

		//hack determine loaded
		if(!entity.image.width) {
			return;
		}

		//calculate offsets
		var columns = Math.floor(entity.image.width / entity.width);
		var offsetX = entity._spritemapAnimationFrame;
		var offsetY = 0;
		while(offsetX >= columns) {
			offsetX -= columns;
			offsetY += entity.height;
		}
		offsetX *= entity.width;

		//draw
		ctx.drawImage(entity.image, offsetX, offsetY, entity.width, entity.height, Math.floor(entity.x), Math.floor(entity.y), entity.width, entity.height);
	},

	rollback : function(entity1, entity2) {
		//rollback values
		entity1.imagesrc = entity2.imagesrc;
		entity1._spritemapAnimationFrame = entity2._spritemapAnimationFrame;
		entity1.spritemapAnimation = entity2.spritemapAnimation;
		entity1.spritemapAnimationIsLooping = entity2.spritemapAnimationIsLooping;
		entity1._spritemapAnimationPosition = entity2._spritemapAnimationPosition;
		entity1.spritemapAnimationRate = entity2.spritemapAnimationRate;
	},

	removedFromWorld : function(entity) {
		//reset
		entity._spritemapAnimationFrame = 0;
		entity.spritemapAnimation = null;
		entity.spritemapAnimationIsLooping = false;
		entity.spritemapAnimationRate = 1;
		entity._spritemapAnimationPosition = 0;
	},

	//this refers to entity
	_getSpritemapAnimationFrame : function() {
		return this._spritemapAnimationFrame;
	},

	//this refers to entity
	_setSpritemapAnimationFrame : function(f) {
		//save frame
		this._spritemapAnimationFrame = f;

		//stop animations
		this._spritemapAnimationPosition = -1;
	},

	//this refers to entity
	_animateSpritemap : function(array, loop, rate) {
		//default loop
		if(typeof loop === 'undefined') {
			loop = false;
		}

		//default rate
		if(typeof rate === 'undefined' || rate < 1) {
			rate = 1;
		}

		//save loop
		this.spritemapAnimationIsLooping = loop;

		//save rate
		this.spritemapAnimationRate = rate;

		//detect already animating
		if(this.spritemapAnimation === array) {
			//start a stopped animation
			if(this._spritemapAnimationPosition < 0) {
				this._spritemapAnimationPosition = 0;
				this._spritemapAnimationFrame = array[0];
			}

			//return
			return;
		}

		//save properties
		this.spritemapAnimation = array;
		this._spritemapAnimationFrame = array[0];
		this._spritemapAnimationPosition = 0;
	}
}

//==================================================//
// rollbackgameengine/components/preventoverlap.js
//==================================================//

rollbackgameengine.components.preventOverlap = {
	load : function(entity) {
		//declare variables
		var shouldAddToFactory = false;

		//check add to factory
		if(!entity.factory._preventOverlapMap) {
			//set boolean
			shouldAddToFactory = true;

			//create hash
			entity.factory._preventOverlapMap = {};
		}

		//loop through factories
		for(var i=1, j=arguments.length; i<j; i++) {
			//register collision
			entity.registerCollision(arguments[i], this);

			//add to factory
			if(shouldAddToFactory) {
				entity.factory._preventOverlapMap[arguments[i]] = null; //doing it this way for lookup speed
			}
		}

		//return
		return this;
	},

	didCollide : function(entity1, entity2) {
		//declare variables
		var halfPreventOverlap = (entity2.factory._preventOverlapMap && typeof entity2.factory._preventOverlapMap[entity1.factory] !== 'undefined');
		var right1 = entity1.right;
		var right2 = entity2.right;
		var bottom1 = entity1.bottom;
		var bottom2 = entity2.bottom;
		var centerX1 = entity1.centerX;
		var centerX2 = entity2.centerX;
		var centerY1 = entity1.centerY;
		var centerY2 = entity2.centerY;
		var diffX = 0;
		var diffY = 0;
		var isLeft = (centerX1 < centerX2);
		var isRight = (centerX1 > centerX2);
		var isTop = (centerY1 < centerY2);
		var isBottom = (centerY1 > centerY2);

		//get x diffs
		if(isLeft) {
			diffX = right1 - entity2.x;
		}else if(isRight) {
			diffX = right2 - entity1.x;
		}

		//get y diffs
		if(isTop) {
			diffY = bottom1 - entity2.y;
		}else if(isBottom) {
			diffY = bottom2 - entity1.y;
		}

		//valid check
		if(!isLeft && !isRight && !isTop && !isBottom) {
			return;
		}

		//resolve
		if((!isTop && !isBottom) || (diffX <= diffY)) {
			//x
			if(isLeft) {
				//left
				if(halfPreventOverlap) {
					//half
					entity1.moveX -= Math.ceil(diffX * 0.5);
				}else {
					//full
					entity1.moveX -= diffX;
				}
			}else if(isRight) {
				//right
				if(halfPreventOverlap) {
					//half
					entity1.moveX += Math.ceil(diffX * 0.5);
				}else {
					//full
					entity1.moveX += diffX;
				}
			}
		}else if((!isLeft && !isRight) || (diffX > diffY)) {
			//y
			if(isTop) {
				//top
				if(halfPreventOverlap) {
					//half
					entity1.moveY -= Math.ceil(diffY * 0.5);

				}else {
					//full
					entity1.moveY -= diffY;
				}
			}else if(isBottom) {
				//bottom
				if(halfPreventOverlap) {
					//half
					entity1.moveY += Math.ceil(diffY * 0.5);
				}else {
					//full
					entity1.moveY += diffY;
				}
			}
		}
	}
}

//==================================================//
// rollbackgameengine/components/removedafter.js
//==================================================//

rollbackgameengine.components.removedAfter = {
	load : function(entity, frames) {
		//add default properties to parent
		entity.factory._maxttl = frames;
		entity._ttl = frames;

		//return
		return this;
	},

	addedToWorld : function(entity) {
		//reset ttl
		entity._ttl = entity.factory._maxttl;
	},

	update : function(entity) {
		//decrement
		entity._ttl--;

		//remove
		if(entity._ttl <= 0) {
			entity.world.recycleEntity(entity);
		}
	},
	
	rollback : function(entity1, entity2) {
		//rollback values
		entity1._ttl = entity2._ttl;
	},

	encode : function(entity, outgoingMessage) {
		outgoingMessage.addUnsignedInteger(entity._ttl, rollbackgameengine.networking.calculateUnsignedIntegerBitSize(entity.factory._maxttl));
	},

	decode : function(entity, incomingMessage) {
		entity._ttl = incomingMessage.nextUnsignedInteger(rollbackgameengine.networking.calculateUnsignedIntegerBitSize(entity.factory._maxttl));
	}
}

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

		//sync
		if(this.factory.sync && (this.factory.sync === rollbackgameengine.sync.singleton || this.factory.sync === rollbackgameengine.sync.sometimes || this.factory.sync === rollbackgameengine.sync.often)
			&& arguments[i].encode && arguments[i].decode) {
			//create list
			if(!this.factory._syncComponents) {
				this.factory._syncComponents = new rollbackgameengine.datastructures.SinglyLinkedList();
			}

			//add to list
			this.factory._syncComponents.add(arguments[i]);
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

rollbackgameengine.Entity.prototype.encode = function(outgoingMessage) {
	//components
	if(this.factory._syncComponents) {
		//declare variables
		var current = this.factory._syncComponents.head;

		//loop through list
		while (current) {
			//sync
			current.obj.encode(this, outgoingMessage);

			//increment
			current = current.next;
		}
	}

	//factory
	if(this.factory.encode) {
		this.factory.encode(this, outgoingMessage);
	}
}

rollbackgameengine.Entity.prototype.decode = function(incomingMessage) {
	//components
	if(this.factory._syncComponents) {
		//declare variables
		var current = this.factory._syncComponents.head;

		//loop through list
		while (current) {
			//sync
			current.obj.decode(this, incomingMessage);

			//increment
			current = current.next;
		}
	}

	//factory
	if(this.factory.decode) {
		this.factory.decode(this, incomingMessage);
	}
}

//==================================================//
// rollbackgameengine/world.js
//==================================================//

//expects list of factories as arguments
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

	//factory tracking variables
	var factory = null;
	var list = null;

	//loop through arguments
	for(var i=0, j=arguments.length; i<j; i++) {
		//set factory
		factory = arguments[i];

		//give ID
		rollbackgameengine.giveID(factory);

		//create list
		list = new rollbackgameengine.datastructures.DoublyLinkedList("prevEntity", "nextEntity");
		list.factory = factory;

		//add to entities list
		this.entitiesList.add(list);

		//add to dictionary
		this.entitiesDictionary[factory] = list;
	}

	//add components and collisions variables
	var entity = null;
	var current = null;
	var currentCollision = null;
	var found = false;

	//loop through parameters
	for(var i=0, j=arguments.length; i<j; i++) {
		//set factory
		factory = arguments[i];

		//create dummy pooled entity - it creates the collision maps for the factories
		entity = this._createEntity(factory);
		rollbackgameengine.pool.add(factory, entity);

		//add collisions if able
		if(typeof factory._collisionMap !== 'undefined') {
			//loop through factories
			current = this.entitiesList.head;
			while(current) {
				//exists
				if(factory._collisionMap.hasOwnProperty(current.factory)) {
					//reset found
					found = false;

					//loop through collisions
					currentCollision = this.collisions.head;
					while(currentCollision) {
						//check found
						if(currentCollision.obj.factory1 === factory && currentCollision.obj.factory2 === current.factory || currentCollision.obj.factory1 === current.factory && currentCollision.obj.factory2 === factory) {
							found = true;
							break;
						}

						//increment
						currentCollision = currentCollision.next;
					}

					//add collisions
					if(!found) {
						this.collisions.add({factory1:factory, factory2:current.factory});
					}
				}

				//increment
				current = current.nextEntityList;
			}
		}
	}
}

//private
//pools automatically
rollbackgameengine.World.prototype._createEntity = function(factory) {
	//grab from pool
	var entity = rollbackgameengine.pool.acquire(factory);

	//make new entity if needed
	if(!entity) {
		//create entity
		entity = new rollbackgameengine.Entity(factory);

		//load
		factory.load(entity);
	}

	//return
	return entity;
}

//expects a factory with a components array
//pools automatically
rollbackgameengine.World.prototype.addEntity = function(factory) {
	//create entity
	var entity = this._createEntity(factory);

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

		//addedToWorld
		entity.addedToWorld();
	}

	//recycle
	while(this.toRecycle.head) {
		//pop
		entity = this.toRecycle.pop();

		//remove from entity list
		this.entitiesDictionary[entity.factory].remove(entity);

		//add to pool
		rollbackgameengine.pool.add(entity.factory, entity);

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
		this.entitiesDictionary[entity.factory].remove(entity);

		//removedFromWorld
		entity.removedFromWorld();

		//remove world
		entity.world = null;
	}
}

//consider having a collideFirst function

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
}

rollbackgameengine.World.prototype.checkCollision = function(factory1, factory2, callback) {
	//declare variables
	var list1 = null;
	var list2 = null;
	var currentFactory1 = null;
	var currentFactory2 = null;

	//get lists
	list1 = this.entitiesDictionary[factory1];
	list2 = this.entitiesDictionary[factory2];

	//validate exists
	if(!list1 || !list2) {
		return;
	}

	//loop through factory 1
	currentFactory1 = list1.head;
	while (currentFactory1) {
		//loop through factory 2
		currentFactory2 = list2.head;
		while(currentFactory2) {
			//collide
			if(this.collides(currentFactory1, currentFactory2)) {
				callback(currentFactory1, currentFactory2);
			}

			//increment
			currentFactory2 = currentFactory2.nextEntity;
		}

		//increment
		currentFactory1 = currentFactory1.nextEntity;
	}
}

//private
//collision callback
rollbackgameengine.World.prototype._handleCollision = function(entity1, entity2) {
	entity1.didCollide(entity2);
	entity2.didCollide(entity1);
}

rollbackgameengine.World.prototype.updateCollisions = function() {
	//declare variables
	var currentCollision = this.collisions.head;

	//loop through collisions
	while(currentCollision) {
		//check collision
		this.checkCollision(currentCollision.obj.factory1, currentCollision.obj.factory2, this._handleCollision);

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
	var temp = null;

	//loop through my factories
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

	//update lists
	this.updateLists();

	//rollback frame
	this.frame = world.frame;
}

rollbackgameengine.World.prototype.encode = function(outgoingMessage) {
	//declare variables
	var currentOuterList = this.entitiesList.head;
	var currentInnerList = null;

	//loop through factories
	while(currentOuterList) {
		//check encode
		if(currentOuterList.factory.sync) {
			//set head
			currentInnerList = currentOuterList.head;

			//encode type
			if(currentOuterList.factory.sync === rollbackgameengine.sync.sometimes) {
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
			}else if(currentOuterList.factory.sync === rollbackgameengine.sync.often) {
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
}

//todo - have this actually create/remove stuff
rollbackgameengine.World.prototype.decode = function(incomingMessage) {
	//declare variables
	var currentOuterList = this.entitiesList.head;
	var currentInnerList = null;
	var count = 0;
	var temp = null;

	//loop through factories
	while(currentOuterList) {
		//check encode
		if(currentOuterList.factory.sync) {
			//set head
			currentInnerList = currentOuterList.head;

			//encode type
			if(currentOuterList.factory.sync === rollbackgameengine.sync.singleton) {
				//singleton

				//loop through entities
				while(currentInnerList) {
					//decode
					currentInnerList.decode(incomingMessage);

					//increment
					currentInnerList = currentInnerList.nextEntity;
				}
			}else if(currentOuterList.factory.sync === rollbackgameengine.sync.sometimes && !incomingMessage.nextBoolean()) {
				//sometimes with no elements

				//loop recycle remaining
				while(currentInnerList) {
					//recycle
					this.recycleEntity(currentInnerList);

					//increment
					currentInnerList = currentInnerList.nextEntity;
				}
			}else if(currentOuterList.factory.sync === rollbackgameengine.sync.sometimes || currentOuterList.factory.sync === rollbackgameengine.sync.often) {
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

						//create new
						temp = this.addEntity(currentOuterList.factory);

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
}
