
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

rollbackgameengine.networking.OutgoingMessage.prototype.addFinalUnsignedInteger = function(number) {
	var bitsRemaining = (this.byteSize * 8) - (this.arrayPosition * 8) - this.bitPosition;
	//console.log("BITS REMAINING " + bitsRemaining);
	this.addUnsignedInteger(number, bitsRemaining);
}
