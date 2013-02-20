
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
rollbackgameengine.networking.calculateVariableLengthUnsignedIntegerBitSize = function(num, encodeSize) {
	//initial bit size
	var bitSize = rollbackgameengine.networking.calculateUnsignedIntegerBitSize(num);

	//encodeSize
	if(typeof encodeSize === 'undefined') {
		encodeSize = rollbackgameengine.networking.variableLengthEncodeBitSize;
	}
	
	//return calculated
	return Math.ceil(bitSize/encodeSize) * (encodeSize+1);
};
