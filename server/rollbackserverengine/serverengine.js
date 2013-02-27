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
	this.ready = false; //enough people, but does NOT have each player's delay
	this.started = false; //game started

	//players
	this.players = new Array();

	//simulation
	this.simulation = new SimulationObject();

	//counter
	this.frameCounter = 0;
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

	//temp debug
	player.id = this.players.length;

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

Room.prototype.update = function() {
	//declare variables
	var value = null;

	//loop
	while(this.canUpdate()) {
		//execute commands
		for(var i=0, j=this.players.length; i<j; i++) {
			this.simulation.execute(i, this.players[i].commands.pop());
		}

		//update
		this.simulation.update();

		//increment counter
		this.frameCounter++;

		//sync
		if(this.frameCounter === syncFrameRate) {
			//reset counter
			this.frameCounter = 0;

			//calculate sync value
			this.simulation.world.encode(syncCalc); //ugly, shouldn't have to access world
		 	value = syncCalc.calculateSyncValue();

		 	//save value
		 	for(var i=0, j=this.players.length; i<j; i++) {
		 		this.players[i].syncValues.add(value);
			}
			console.log("calculated sync value for " + this.simulation.frame + " to be " + value);
		}
	}
};

Room.prototype.handleMessage = function(player, incomingMessage) {
	if(!player.delay) {
		//ready

		//save delay
		player.delay = incomingMessage.nextUnsignedInteger(7);
		console.log("received player delay " + player.delay);

		//default commands
		for(var i=0; i<player.delay; i++) {
			player.commands.add(new CommandObject());
		}

		//start
		if(this.ready && !this.started) {
			this.start();
		}
	}else {
		//game message

		//parse dump
		if(incomingMessage.nextBoolean()) {
			player.dumpRequested = true;
			console.log(player.id + " requested dump");
		}

		//parse command
		var cmd = new CommandObject();
		cmd.loadFromMessage(incomingMessage);

		//parse skipped
		var skipped = incomingMessage.finalUnsignedInteger();

		//add commands
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

		//update
		this.update();

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
			var skipBitSize = rollbackgameengine.networking.calculateUnsignedIntegerBitSize(skipped);
			var isVariableLengthSkip = (!frameSkipBitSize || skipBitSize > frameSkipBitSize);
			if(isVariableLengthSkip) {
				//variable length
				skipBitSize = rollbackgameengine.networking.calculateVariableLengthUnsignedIntegerBitSize(skipped);
			}else {
				//preset length
				skipBitSize = frameSkipBitSize;
			}
			var bitSize = 1 + skipBitSize + cmd.totalBitSize + 1;
			var byteSize = Math.ceil(bitSize/8);

			//declare variables
			var outgoingMessage = null;
			var p = null;
			var syncValue = null;

			//loop
			for(var i=0, j=this.players.length; i<j; i++) {
				//set player
				p = this.players[i];

				//valid check
				if(p === player) {
					continue;
				}

				//sync value
				syncValue = p.syncValues.pop();

				//create message
				if(syncValue) {
					//sync value
					outgoingMessage = new rollbackgameengine.networking.OutgoingMessage(Math.ceil((bitSize+rollbackgameengine.networking.calculateUnsignedIntegerBitSize(syncValue))/8));
				}else {
					//no sync value
					outgoingMessage = new rollbackgameengine.networking.OutgoingMessage(byteSize);
				}

				//append skipped
				if(!isVariableLengthSkip) {
					//preset length
					outgoingMessage.addBoolean(true);
					outgoingMessage.addUnsignedInteger(skipped, frameSkipBitSize);
				}else {
					//variable length
					if(frameSkipBitSize) {
						outgoingMessage.addBoolean(false);
					}
					outgoingMessage.addUnsignedInteger(skipped);
				}

				//append command
				cmd.addDataToMessage(outgoingMessage);

				//append has dump
				outgoingMessage.addBoolean(false);

				//todo - dump here

				//append sync value
				if(syncValue) {
					outgoingMessage.addFinalUnsignedInteger(syncValue);
				}

				//send
				p.send(outgoingMessage.array, {binary:true, mask:false});
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
		player.commands = new rollbackgameengine.datastructures.SinglyLinkedList();
		player.room = null;
		player.syncValues = new rollbackgameengine.datastructures.SinglyLinkedList();
		player.dumpRequested = false;

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
