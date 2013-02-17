
//==================================================//
// commands/command.js
// controllers will set this.frame
// however command itself does not manage it
//==================================================//

shooter.commands.Command = function() {
	this.reset();
};

//reset

shooter.commands.Command.prototype.reset = function() {
	//booleans
	this.w = false;				//1
	this.a = false;				//1
	this.s = false;				//1
	this.d = false;				//1
	this.mouseDown = false;		//1
	this.mouseX = 0;			//10
	this.mouseY = 0;			//10
};

//loading

shooter.commands.Command.prototype.loadFromMessage = function(incomingmessage) {
	//booleans
	this.w = incomingmessage.nextBoolean();
	this.a = incomingmessage.nextBoolean();
	this.s = incomingmessage.nextBoolean();
	this.d = incomingmessage.nextBoolean();
	this.mouseDown = incomingmessage.nextBoolean();
	this.mouseX = incomingmessage.nextUnsignedInteger(10);
	this.mouseY = incomingmessage.nextUnsignedInteger(10);
};

shooter.commands.Command.prototype.loadFromCommand = function(command) {
	//booleans
	this.w = command.w;
	this.a = command.a;
	this.s = command.s;
	this.d = command.d;
	this.mouseDown = command.mouseDown;
	this.mouseX = command.mouseX;
	this.mouseY = command.mouseY;
};

//sending

shooter.commands.Command.prototype.totalBitSize = 25; //calculate based on data

shooter.commands.Command.prototype.addDataToMessage = function(outgoingmessage) {
	//booleans
	outgoingmessage.addBoolean(this.w);
	outgoingmessage.addBoolean(this.a);
	outgoingmessage.addBoolean(this.s);
	outgoingmessage.addBoolean(this.d);
	outgoingmessage.addBoolean(this.mouseDown);
	outgoingmessage.addUnsignedInteger(this.mouseX, 10);
	outgoingmessage.addUnsignedInteger(this.mouseY, 10);
};

//helper

shooter.commands.Command.prototype.toString = function() {
	return "<" + this.w + ", " + this.a + ", " + this.s + ", " + this.d + ">";
};
