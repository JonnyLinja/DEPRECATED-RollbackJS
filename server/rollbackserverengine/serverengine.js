//imports
var rollbackgameengine = require("./gameengine.js");
var WebSocketServer = require('ws').Server;

//namespace
var rollbackserverengine = {};
module.exports = rollbackserverengine;

//options
var SimulationObject = null;
var CommandObject = null;
var playerCount = null;
var syncFrameRate = null;
var frameSkipBitSize = null;
var minimumUpdateFrame = null;
var shouldSendFrame = null; //
var shouldSendPlayer = null; //

//variables
var wss = null;
var lobbyRoom = null;
var rooms = new rollbackgameengine.datastructures.DoublyLinkedList("prevRoom", "nextRoom");
var syncCalc = new rollbackgameengine.sync.SyncCalculator();

//room
var Room = function() {
	//booleans
	this.ready = false;
	this.started = false;

	//players
	this.players = new Array();

	//simulation
	this.simulation = new SimulationObject();

	//sync - todo, consider multiple ones for observers
	this.syncCheckValue = null;
};

//lobby
Room.makeRoom = function() {
	console.log("make room");
	var r = new Room();
	rooms.add(r);
	return r;
};

Room.prototype.addPlayer = function(player) {
	//valid check
	if(this.ready) {
		return;
	}

	//add player
	this.players[this.players.length] = player;

	//set room
	player.room = this;

	//check ready
	if(this.players.length === playerCount) {
		this.ready = true;
		console.log("READY");
	}
};

Room.prototype.removePlayer = function(player) {
	//todo
};

Room.prototype.start = function() {
	//valid check
	if(!this.ready || this.started) {
		return;
	}

	//valid check
	for(var i=0, j=this.players.length; i<j; i++) {
		//check
		if(!this.players[i].delay) {
			return;
		}
	}

	console.log("start game");

	//set started
	this.started = true;

	//size calculation
	var size = rollbackgameengine.networking.calculateUnsignedIntegerBitSize(playerCount-1);

	//create message
	var outgoingMessage = new rollbackgameengine.networking.OutgoingMessage(size);

	//loop
	for(var i=0, l=this.players.length; i<l; i++) {
		//reset message
		outgoingMessage.reset();

		//send id
		outgoingMessage.addUnsignedInteger(i, size);

		//add delay
		for(var j=0; j<l; j++) {
			if(this.players[i] !== this.players[j]) {
				outgoingMessage.addUnsignedInteger(this.players[j].delay, 7);
			}
		}

		//send
		this.players[i].send(outgoingMessage.array, {binary:true, mask:false});
	}
};

Room.prototype.canUpdate = function() {
	//loop
	for(var i=0, j=this.players.length; i<j; i++) {
		//at least one command check
		if(!this.players[i].commands.head) {
			return false;
		}
	}

	//return
	return true;
};

Room.prototype.isSyncing = function() {
	//loop
	for(var i=0, j=this.players.length; i<j; i++) {
		if(!this.players[i].syncReceived) {
			return true;
		}
	}

	//return
	return false;
}

Room.prototype.update = function() {
	//declare variables
	var value = null;

	//loop
	var count = 0;
	while(this.canUpdate()) {
		count++;
		//execute commands
		for(var i=0, j=this.players.length; i<j; i++) {
			this.simulation.execute(i, this.players[i].commands.pop());
		}

		//update
		this.simulation.update();

		//sync
		if(this.simulation.frame % syncFrameRate === 0) {
			this.simulation.world.encode(syncCalc); //ugly, shouldn't have to access world
		 	value = syncCalc.calculateSyncValue();
			console.log("calculated sync value for " + this.simulation.frame + " to be " + value);
		}
	}

	//return
	return value;
};

Room.prototype.handleMessage = function(player, incomingMessage) {
	if(!player.delay) {
		//ready

		//save delay
		player.delay = incomingMessage.nextUnsignedInteger(7);
		console.log("received player delay " + player.delay);

		//start
		if(this.ready && !this.started) {
			this.start();
		}
	}else {
		//game message

		//parse skipped
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

		//parse command
		var cmd = new CommandObject();
		cmd.loadFromMessage(incomingMessage);
		if(!this.shouldSendFrame) {
			//duplicate commands
			for(var i=0, c=null; i<skipped+1; i++) {
				c = new CommandObject();
				c.loadFromCommand(cmd);
				player.commands.add(c);
			}
		}else {
			//todo
		}

		//parse sync value
		var receivedSyncValue = incomingMessage.finalUnsignedInteger();
		if(receivedSyncValue > 0) {
			//received
			player.syncReceived = true;

			console.log("sync value received " + receivedSyncValue);
			if(!this.isSyncing()) {
				console.log("all sync values received, reset");
				this.syncCheckValue = null;
				for(var i=0, j=this.players.length; i<j; i++) {
					this.players[i].syncSent = false;
					this.players[i].syncReceived = false;
				}
			}
		}

		//update
		var syncValue = this.update();
		if(!this.syncCheckValue) {
			this.syncCheckValue = syncValue;
		}

		//send message
		if(false) {
			//sync dump
			//todo - make this not send to other players, sync is for yourself

			//create message
			var outgoingMessage = new rollbackgameengine.networking.VariableMessage();

			//message type
			outgoingMessage.addBoolean(true); //is a sync message

			//encode
			this.simulation.encode(outgoingMessage);

			//send
			player.send(outgoingMessage.constructMessage().array, {binary:true, mask:false});
		}else {
			//bounce

			//calculate size
			var byteSize = Math.ceil((c.totalBitSize+1+1+rollbackgameengine.networking.calculateUnsignedIntegerBitSize(skipped))/8);

			//create message
			var outgoingMessage = new rollbackgameengine.networking.OutgoingMessage(byteSize);		

			//loop
			for(var i=0, j=this.players.length; i<j; i++) {
				//valid check
				if(this.players[i] === player) {
					continue;
				}

				//reset
				outgoingMessage.reset();

				//message type
				outgoingMessage.addBoolean(false); //not a sync message

				//request sync
				if(this.syncCheckValue && !this.players[i].syncSent) {
					//sync
					outgoingMessage.addBoolean(true);
					this.players[i].syncSent = true;
					console.log("sync request sent");
				}else {
					//don't sync
					outgoingMessage.addBoolean(false);
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
				cmd.addDataToMessage(outgoingMessage);

				//send
				this.players[i].send(outgoingMessage.array, {binary:true, mask:false});
			}
		}
	}
};

Room.prototype.close = function() {
	console.log("closing room");

	//close and remove player references
	for(var i=0, j=this.players.length; i<j; i++) {
		this.players[i].room = null;
		this.players[i].close();
	}

	//remove room
	rooms.remove(this);
};

//start
rollbackserverengine.start = function(options) {
	//save variables - todo, add default values
	SimulationObject = options.Simulation;
	CommandObject = options.Command;
	playerCount = options.playerCount;
	syncFrameRate = options.syncFrameRate;
	frameSkipBitSize = options.frameSkipBitSize;
	minimumUpdateFrame = options.minimumUpdateFrame; //todo - do something with this
	shouldSendFrame = false; //todo - shouldSendFrame

	//lobby
	lobbyRoom = Room.makeRoom();

	//start server
	wss = new WebSocketServer({port: 8080});

	//callbacks
	wss.on('connection', function(player) {
		console.log("player connected");

		//load player
		player.delay = null;
		player.syncSent = false;
		player.syncReceived = false;
		player.commands = new rollbackgameengine.datastructures.SinglyLinkedList();
		player.room = null;

		//set lobby
		if(lobbyRoom.ready) {
			lobbyRoom = Room.makeRoom();
		}

		//join room
		lobbyRoom.addPlayer(player);

		//message
		player.on('message', function(data, flags) {
			//get message
			var incomingMessage = new rollbackgameengine.networking.IncomingMessage();
			incomingMessage.setArray(data);

			//pass message
			player.room.handleMessage(player, incomingMessage);
		});

		//close
		player.on('close', function() {
			console.log("player disconnected");

			//close room
			if(player.room) {
				player.room.close();
			}

			//lobby check
			if(player.room === lobbyRoom) {
				lobbyRoom = Room.makeRoom();
			}
		});
	});
};
