
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

rollbackgameengine.networking.IncomingMessage.prototype.finalUnsignedInteger = function() {
	var bitsRemaining = (this.array.length * rollbackgameengine.networking.messageBitSize) - (this.arrayPosition * rollbackgameengine.networking.messageBitSize) - (rollbackgameengine.networking.messageBitSize - this.bitPosition);
	return this.nextUnsignedInteger(bitsRemaining);
}
