
//==================================================//
// rollbackgameengine/networking/outgoingmessage.js
//==================================================//

rollbackgameengine.networking.OutgoingMessage = function(byteSize) {
	this.byteSize = byteSize;
	this.arrayPosition = 0;
	this.bitPosition = rollbackgameengine.networking.messageBitSize;
	this.arrayBuffer = new ArrayBuffer(byteSize);
	this.array = new Uint8Array(this.arrayBuffer);
};

rollbackgameengine.networking.OutgoingMessage.prototype.reset = function() {
	this.arrayPosition = 0;
	this.bitPosition = rollbackgameengine.networking.messageBitSize;

	//reset everything to 0
	for(var i=0, j=this.array.length; i<j; i++) {
		this.array[i] = 0;
	}
};

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
};

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
};

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
};

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
		var index = numberString.indexOf('.');
		if(index === -1) {
			//no decimal
			this.addUnsignedInteger(0); //kind of a waste of bits, but no choice
		}else {
			//has decimal
			if(typeof precision !== 'undefined') {
				//use precision

				//add extra 0s
				while(numberString.length-1-index < precision) {
					numberString += "0";
				}

				//add number
				this.addUnsignedInteger(parseInt(numberString.replace(/[0-9]+\./g,'').substring(0, precision)));
			}else {
				//use full value - dangerous
				this.addUnsignedInteger(parseInt(numberString.replace(/[0-9]+\./g,'')));
			}
		}
	}
};

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
};

rollbackgameengine.networking.OutgoingMessage.prototype.addFinalUnsignedInteger = function(number) {
	var bitsRemaining = (this.byteSize * rollbackgameengine.networking.messageBitSize) - (this.arrayPosition * rollbackgameengine.networking.messageBitSize) - (rollbackgameengine.networking.messageBitSize - this.bitPosition);
	this.addUnsignedInteger(number, bitsRemaining);
};
