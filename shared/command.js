
//==================================================//
// command.js
// controllers will set this.frame
// however command itself does not manage it
//==================================================//

shooter.Command = function() {
	//booleans
	this.w = false;
	this.a = false;
	this.s = false;
	this.d = false;
}

//loading

shooter.Command.prototype.loadFromMessage = function(incomingmessage) {
	//booleans
	this.w = incomingmessage.nextBoolean();
	this.a = incomingmessage.nextBoolean();
	this.s = incomingmessage.nextBoolean();
	this.d = incomingmessage.nextBoolean();
}

shooter.Command.prototype.loadFromCommand = function(command) {
	//booleans
	this.w = command.w;
	this.a = command.a;
	this.s = command.s;
	this.d = command.d;
}

//sending

shooter.Command.prototype.totalBitSize = 4; //calculate based on data

shooter.Command.prototype.addDataToMessage = function(outgoingmessage) {
	//booleans
	outgoingmessage.addBoolean(this.w);
	outgoingmessage.addBoolean(this.a);
	outgoingmessage.addBoolean(this.s);
	outgoingmessage.addBoolean(this.d);
}

//helper

shooter.Command.prototype.toString = function() {
	return this.frame + "> " + this.w + ", " + this.a + ", " + this.s + ", " + this.d;
}
