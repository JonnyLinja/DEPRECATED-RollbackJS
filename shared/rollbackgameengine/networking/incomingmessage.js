
//==================================================//
// rollbackgameengine/networking/incomingmessage.js
//==================================================//

//THERE MAY BE A PROBLEM IN THAT INCOMING ARRAYBUFFER IS SUPPOSEDLY READONLY, BUT IM MODIFYING IT

rollbackgameengine.networking.IncomingMessage = function(arrayBuffer) {
	if(arrayBuffer) {
		this.setArrayBuffer(arrayBuffer);
	}
};

//for client use
rollbackgameengine.networking.IncomingMessage.prototype.setArrayBuffer = function(arrayBuffer) {
	this.arrayPosition = 0;
	this.bitPosition = rollbackgameengine.networking.messageBitSize;
	this.arrayBuffer = arrayBuffer;
	this.array = new Uint8Array(this.arrayBuffer);
};

//for server use
rollbackgameengine.networking.IncomingMessage.prototype.setArray = function(array) {
	this.arrayPosition = 0;
	this.bitPosition = rollbackgameengine.networking.messageBitSize;
	this.array = array;
};

//to be implemented later for data dump purposes
rollbackgameengine.networking.IncomingMessage.prototype.hasNext = function() {
	return true;
};

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
};

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
};

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
};

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
		var int = this.nextUnsignedInteger();
		var decimal = this.nextUnsignedInteger();

		//decimal check
		if(precision > 1 && decimal > 0) {
			var decimalString = decimal + "";
			var check = Math.pow(10, precision-1);
			while(decimal < check) {
				decimal *= 10;
				decimalString = "0" + decimalString;
			}
			return parseFloat(int + "." + decimalString);
		}

		//return
		return parseFloat(int + "." + decimal);
	}
};

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
};

rollbackgameengine.networking.IncomingMessage.prototype.finalUnsignedInteger = function() {
	var bitsRemaining = (this.array.length * rollbackgameengine.networking.messageBitSize) - (this.arrayPosition * rollbackgameengine.networking.messageBitSize) - (rollbackgameengine.networking.messageBitSize - this.bitPosition);
	return this.nextUnsignedInteger(bitsRemaining);
};
