
//==================================================//
// rollbackgameengine/networking/variablemessage.js
// intended for use by the server
// so less focus on garbage collection
//==================================================//

rollbackgameengine.networking.VariableMessage = function(byteSize) {
	this.bitSize = 0;
	this.inputs = new rollbackgameengine.datastructures.SinglyLinkedList();
};

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
};

rollbackgameengine.networking.VariableMessage.prototype.addBoolean = function(bool) {
	//increment bit size
	this.bitSize++;

	//push
	this.inputs.add(bool);
};

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
};

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
};

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
};

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
};

rollbackgameengine.networking.VariableMessage.prototype.addFinalUnsignedInteger = function(int) {
	//todo
};
