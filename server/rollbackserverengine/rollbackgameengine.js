
//==================================================//
// rollbackgameengine/engine.js
//==================================================//

//declare namespaces
var rollbackgameengine = {};
rollbackgameengine.datastructures = {};
rollbackgameengine.networking = {};
rollbackgameengine.components = {};

//networking helper
rollbackgameengine.networking.messageBitSize = 8;

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

//nodejs
if(typeof window === 'undefined') {
	console.log("nodejs detected, exporting");
	module.exports = rollbackgameengine;
}



//==================================================//
// rollbackgameengine/networking/outgoingmessage.js
//==================================================//

rollbackgameengine.networking.OutgoingMessage = function(byteSize) {
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
	this.addUnsignedInteger(int, size-1);
}

rollbackgameengine.networking.OutgoingMessage.prototype.addUnsignedNumber = function(number, size, precision) {
	this.addUnsignedInteger(number * Math.pow(10, precision), size);
}

rollbackgameengine.networking.OutgoingMessage.prototype.addSignedNumber = function(number, size, precision) {
	this.addSignedInteger(number * Math.pow(10, precision), size);
}




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

rollbackgameengine.networking.IncomingMessage.prototype.nextSignedInteger = function(size) {
	if(this.nextBoolean()) {
		//negative
		return -1 * this.nextUnsignedInteger(size-1);
	}else {
		//positive
		return this.nextUnsignedInteger(size-1);
	}
}

rollbackgameengine.networking.IncomingMessage.prototype.nextUnsignedNumber = function(size, precision) {
	return this.nextUnsignedInteger(size) / Math.pow(10, precision);
}

rollbackgameengine.networking.IncomingMessage.prototype.nextSignedNumber = function(size, precision) {
	return this.nextSignedInteger(size) / Math.pow(10, precision);
}
