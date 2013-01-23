
//==================================================//
// rollbackgameengine/networking/message.js
//==================================================//

rollbackgameengine.networking.messageBitSize = 8;
rollbackgameengine.networking.calculateUnsignedIntegerBitSize = function(num) {
	//declare variables
	var compareValue = 1;
    var frameBitSize = 0;
    var frameValue = num;

    //loop
    while(frameValue >= compareValue) {
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
