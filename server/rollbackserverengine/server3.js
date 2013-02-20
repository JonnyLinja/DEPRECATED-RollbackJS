
//todo - make this export something that is passed in the simulation and the command object
//for testing purposes everything is hardcoded in atm

var rollbackgameengine = require ("./rollbackgameengine");
var game = require("./game.js");
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: 8080});
var p1 = null;
var p2 = null;
var p1Delay = null;
var p2Delay = null;
var started = false;
var sim = null;
var lastP1 = null;
var lastP2 = null;
var frameSkipBitSize = 4;

wss.on('connection', function(ws) {
	if(!p1) {
		//save p1
		p1 = ws;

		console.log("p1 connected");
	}else if(!p2) {
		//save p2
		p2 = ws;

		console.log("p2 connected");
	}else {
		//close connection, only 2 players at a time!
		ws.close();

		console.log("connection ignored");
	}

	ws.on('message', function(data, flags) {
		//get message
		var incomingMessage = new rollbackgameengine.networking.IncomingMessage();
		incomingMessage.setArray(data);

		if(p1 && ws === p1) {
			if(!p1Delay) {
				//parse delay
				p1Delay = incomingMessage.nextUnsignedInteger(7);

				console.log("p1 ready with initial delay " + p1Delay);
			}else if(p2) {
				//skipped
				var skipped = null;
				var skippedPreset = null;
				if(!frameSkipBitSize) {
					//variable length
					skipped = incomingMessage.nextUnsignedInteger();
					skippedPreset = false;
				}else if(incomingMessage.nextBoolean()) {
					//preset length
					skipped = incomingMessage.nextUnsignedInteger(frameSkipBitSize);
					skippedPreset = true;
				}else {
					//variable length
					skipped = incomingMessage.nextUnsignedInteger();
					skippedPreset = false;
				}
				lastP1 += skipped+1;

				//command
				var c = new game.commands.Command();
				c.loadFromMessage(incomingMessage);

				//update
				sim.execute(0, c);
				if(Math.min(lastP1, lastP2) > sim.frame) {
					sim.update();
				}
				for(var i=0; i<skipped; i++) {
					if(Math.min(lastP1, lastP2) > sim.frame) {
						sim.update();
					}
				}

				//sync
				//var outgoingMessage = new rollbackgameengine.networking.VariableMessage();
				//outgoingMessage.addBoolean(true); //is a sync message
				//sim.encode(outgoingMessage);
				//p2.send(outgoingMessage.constructMessage().array, {binary:true, mask:false});

				//bounce
				var byteSize = Math.ceil((c.totalBitSize+1+rollbackgameengine.networking.calculateUnsignedIntegerBitSize(skipped))/8);
				var outgoingMessage = new rollbackgameengine.networking.OutgoingMessage(byteSize);
				outgoingMessage.addBoolean(false); //not a sync message
				if(skippedPreset) {
					outgoingMessage.addBoolean(true);
					outgoingMessage.addUnsignedInteger(skipped, frameSkipBitSize);
				}else {
					if(frameSkipBitSize) {
						outgoingMessage.addBoolean(false);
					}
					outgoingMessage.addUnsignedInteger(skipped);
				}
				c.addDataToMessage(outgoingMessage);
				p2.send(outgoingMessage.array, {binary:true, mask:false});
			}
		}else if(p2 && ws === p2) {
			if(!p2Delay) {
				//parse delay
				p2Delay = incomingMessage.nextUnsignedInteger(7);

				console.log("p2 ready with initial delay " + p2Delay);
			}else if(p1) {
				//skipped
				var skipped = null;
				var skippedPreset = null;
				if(!frameSkipBitSize) {
					//variable length
					skipped = incomingMessage.nextUnsignedInteger();
					skippedPreset = false;
				}else if(incomingMessage.nextBoolean()) {
					//preset length
					skipped = incomingMessage.nextUnsignedInteger(frameSkipBitSize);
					skippedPreset = true;
				}else {
					//variable length
					skipped = incomingMessage.nextUnsignedInteger();
					skippedPreset = false;
				}
				lastP2 += skipped+1;

				//command
				var c = new game.commands.Command();
				c.loadFromMessage(incomingMessage);

				//update
				sim.execute(1, c);
				if(Math.min(lastP1, lastP2) > sim.frame) {
					sim.update();
				}
				for(var i=0; i<skipped; i++) {
					if(Math.min(lastP1, lastP2) > sim.frame) {
						sim.update();
					}
				}

				//sync
				//var outgoingMessage = new rollbackgameengine.networking.VariableMessage();
				//outgoingMessage.addBoolean(true); //is a sync message
				//sim.encode(outgoingMessage);
				//p1.send(outgoingMessage.constructMessage().array, {binary:true, mask:false});

				//bounce
				var byteSize = Math.ceil((c.totalBitSize+1+rollbackgameengine.networking.calculateUnsignedIntegerBitSize(skipped))/8);
				var outgoingMessage = new rollbackgameengine.networking.OutgoingMessage(byteSize);
				outgoingMessage.addBoolean(false); //not a sync message
				if(skippedPreset) {
					outgoingMessage.addBoolean(true);
					outgoingMessage.addUnsignedInteger(skipped, frameSkipBitSize);
				}else {
					if(frameSkipBitSize) {
						outgoingMessage.addBoolean(false);
					}
					outgoingMessage.addUnsignedInteger(skipped);
				}
				c.addDataToMessage(outgoingMessage);
				p1.send(outgoingMessage.array, {binary:true, mask:false});
			}
		}

		//start
		if(!started && p1Delay && p2Delay) {
			//set started
			started = true;

			//create new sim
			sim = new game.GameSimulation();

			//set last
			lastP1 = 0;
			lastP2 = 0;

			//create message
			var outgoingMessage = new rollbackgameengine.networking.OutgoingMessage(1);

			//send p1 start
			outgoingMessage.addUnsignedInteger(0, 1); //players
			outgoingMessage.addUnsignedInteger(p2Delay, 7); //delay
			p1.send(outgoingMessage.array, {binary:true, mask:false});

			console.log("sent start command to p1");

			//reset
			outgoingMessage.reset();

			//send p2 start
			outgoingMessage.addUnsignedInteger(1, 1); //player
			outgoingMessage.addUnsignedInteger(p1Delay, 7); //delay
			p2.send(outgoingMessage.array, {binary:true, mask:false});

			console.log("send start command to p2");
		}
	});

	ws.on('close', function() {
		//close
		if(ws === p1) {
			//close p2
			if(p2) {
				p2.close();
			}

			console.log("p1 closed, closing p2");
		}else if(ws === p2) {
			//close p1
			if(p1) {
				p1.close();
			}

			console.log("p2 closed, closing p1");
		}else {
			//ignored
			console.log("ignore closing");
			return;
		}

		//set null
		p1 = null;
		p2 = null;
		p1Delay = null;
		p2Delay = null;
		sim = null;
		lastP1 = null;
		lastP2 = null;

		//start
		started = false;

		console.log("player disconnected, kick them out");
	});
});
