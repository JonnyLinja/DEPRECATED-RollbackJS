
//==================================================//
// command.js
// controllers will set this.frame
// however command itself does not manage it
//==================================================//

shooter.Command = function(incomingmessage) {
	if(typeof incomingmessage !== 'undefined') {
		//construct from message

		//booleans
		this.w = incomingmessage.nextBoolean();
		this.a = incomingmessage.nextBoolean();
		this.s = incomingmessage.nextBoolean();
		this.d = incomingmessage.nextBoolean();
	}else {
		//default

		//booleans
		this.w = false;
		this.a = false;
		this.s = false;
		this.d = false;
	}
}

shooter.Command.prototype.totalBitSize = 4; //calculate based on data

shooter.Command.prototype.addDataToMessage = function(outgoingmessage) {
	//booleans
	outgoingmessage.addBoolean(this.w);
	outgoingmessage.addBoolean(this.a);
	outgoingmessage.addBoolean(this.s);
	outgoingmessage.addBoolean(this.d);
}

shooter.Command.prototype.clone = function() {
	//create new command
	var c = new shooter.Command();

	//set data
	c.w = this.w;
	c.a = this.a;
	c.s = this.s;
	c.d = this.d;

	//return
	return c;
}

shooter.Command.prototype.toString = function() {
	return this.frame + "> " + this.w + ", " + this.a + ", " + this.s + ", " + this.d;
}
