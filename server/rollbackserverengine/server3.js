
//todo - make this export something that is passed in the simulation and the command object
//for testing purposes everything is hardcoded in atm

//imports
var rollbackgameengine = require ("./rollbackgameengine");
var game = require("./game.js"); //temporary, remove later
var WebSocketServer = require('ws').Server;

//server
var wss = new WebSocketServer({port: 8080});

//player
var p1 = null;
var p2 = null;

//player delay
var p1Delay = null;
var p2Delay = null;

//last player frames
var lastP1 = null;
var lastP2 = null;

//game variables
var started = false;
var sim = null;
var CommandObject = game.commands.Command; //hardcoded, should be passed in
var SimulationObject = game.GameSimulation; //hardcoded, should be passed in
var frameSkipBitSize = 4; //hardcoded, should be passed in

//sync variables
var syncFrameRate = 30; //hardcoded, should be passed in
var syncCalc = new rollbackgameengine.sync.SyncCalculator();
var syncCheckValueP1 = null;
var syncCheckValueP2 = null;
var isP1Syncing = false;
var isP2Syncing = false;

function updateSimulation() {
	//valid check
	if(Math.min(lastP1, lastP2) <= sim.frame) {
		return;
	}

	//update
	sim.update();

	//check rate
	if(sim.frame % syncFrameRate === 0) {
		sim.world.encode(syncCalc); //ugly, shouldn't have to access world
		var value = syncCalc.calculateSyncValue();
		console.log(sim.frame + ": " + value);
		return value;
	}
}

function handleCommand(player, incomingMessage) {
	//isP1
	var isP1 = (player === p1);

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

	//last
	if(isP1) {
		lastP1 += skipped+1;
	}else {
		lastP2 += skipped+1;
	}

	//command
	var c = new CommandObject();
	c.loadFromMessage(incomingMessage);

	//sync value
	if(incomingMessage.finalUnsignedInteger() > 0) {
		if(isP1) {
			isP1Syncing = false;
			console.log("received p1 sync value");
		}else {
			isP2Syncing = false;
			console.log("received p2 sync value");
		}
	}

	//execute
	if(isP1) {
		sim.execute(0, c);
	}else {
		sim.execute(1, c);
	}

	//update
	var syncValue = null;
	var temp = null;
	for(var i=0; i<=skipped; i++) {
		temp = updateSimulation();
		if(temp) {
			syncValue = temp;
		}
	}

	if(false) {
		//sync dump

		//create message
		var outgoingMessage = new rollbackgameengine.networking.VariableMessage();

		//message type
		outgoingMessage.addBoolean(true); //is a sync message

		//encode
		sim.encode(outgoingMessage);

		//send
		if(isP1) {
			p2.send(outgoingMessage.constructMessage().array, {binary:true, mask:false});
		}else {
			p1.send(outgoingMessage.constructMessage().array, {binary:true, mask:false});
		}
	}else {
		//bounce

		//calculate size
		var byteSize = Math.ceil((c.totalBitSize+1+1+rollbackgameengine.networking.calculateUnsignedIntegerBitSize(skipped))/8);

		//create message
		var outgoingMessage = new rollbackgameengine.networking.OutgoingMessage(byteSize);		

		//message type
		outgoingMessage.addBoolean(false); //not a sync message

		//request sync
		if(isP1) {
			//p2
			if(!isP2Syncing && (syncValue || syncCheckValueP2)) {
				//send sync
				outgoingMessage.addBoolean(true);
				syncCheckValueP2 = null;
				isP2Syncing = true;
			}else {
				//nothing
				outgoingMessage.addBoolean(false);
			}
		}else {
			//p1
			if(!isP1Syncing && (syncValue || syncCheckValueP1)) {
				//send sync
				outgoingMessage.addBoolean(true);
				syncCheckValueP1 = null;
				isP1Syncing = true;
			}else {
				//nothing
				outgoingMessage.addBoolean(false);
			}
		}

		//add skipped
		if(skippedPreset) {
			outgoingMessage.addBoolean(true);
			outgoingMessage.addUnsignedInteger(skipped, frameSkipBitSize);
		}else {
			if(frameSkipBitSize) {
				outgoingMessage.addBoolean(false);
			}
			outgoingMessage.addUnsignedInteger(skipped);
		}

		//add command
		c.addDataToMessage(outgoingMessage);

		//send
		if(isP1) {
			if(syncValue) {
				syncCheckValueP1 = syncValue;
			}
			p2.send(outgoingMessage.array, {binary:true, mask:false});
		}else {
			if(syncValue) {
				syncCheckValueP2 = syncValue;
			}
			p1.send(outgoingMessage.array, {binary:true, mask:false});
		}
	}
}

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
				//handle command
				handleCommand(ws, incomingMessage);
			}
		}else if(p2 && ws === p2) {
			if(!p2Delay) {
				//parse delay
				p2Delay = incomingMessage.nextUnsignedInteger(7);

				console.log("p2 ready with initial delay " + p2Delay);
			}else if(p1) {
				//handle command
				handleCommand(ws, incomingMessage);
			}
		}

		//start
		if(!started && p1Delay && p2Delay) {
			//set started
			started = true;

			//create new sim
			sim = new SimulationObject();

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
