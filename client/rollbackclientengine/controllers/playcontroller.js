
//==================================================//
// controllers/playcontroller.js
//
// CORE PROBLEM RIGHT NOW
// With game delay, there has to be a # of commands ignored
// Means need to store said value for BOTH players
// Then do a "countdown" of said values that are to be ignored
// This only applies when minimum update frame is 1, aka send every frame
// Otherwise can just do checks against the frame #
//
// I am successfully sending the delay now but how to do counter?
// One way is to use the counter itself, but would have to refresh it every time somehow - more difficult logic but "cheaper"
// The alternative is to default that number of commands in for the missing frames - easier logic wise but expensive?
// Fuck go the latter, it isn't that much more expensive and the code is easier to read
//
// ERRR PROBLEM NOW IS THAT EVEN WITH EXTRA COMMANDS THAT TRUE SIM SOMEHOW UPDATES WITHOUT ANY COMMANDS TO EXECUTE
// ONLY APPEARS TO HAPPEN WHEN GAME IS RUNNING FAST
// WTF
// Theorized problem was due to the minimumn last received frame not being correct
// Not sure
//
// controlling start time - how should this be handled?
// should it be handled by a separate object before playcontroller and then the connection passed in?
// or should the playcontroller do it?
//
// for now just don't have tha system, just use the immediate start
// figure it out later
//
//==================================================//

//eventually pass canvas in here - needed to obtain width and height to determine max sync value
//frame delay must be between 0 and 127 inclusive
rollbackclientengine.controllers.PlayController = function(url, Simulation, Command, frameRate, frameDelay, playerCount, minimumUpdateFrame) {
    //debug logging
    this.logsDisabled = true; //false
    this.commandID = new Array();
    this.framesSkipped = 0;

    //frame rate default
    if(typeof frameRate === 'undefined') {
        frameRate = 33; //33
    }

    //frame delay default
    if(typeof frameDelay === 'undefined') {
        frameDelay = 2; //2
    }

    //player count default
    if(typeof playerCount === 'undefined') {
        playerCount = 2;
    }

    //minimum update frame default
    if(typeof minimumUpdateFrame === 'undefined') {
        minimumUpdateFrame = 1;
    }

    //commands
    this.CommandObject = Command;
    rollbackgameengine.giveID(this.CommandObject); //id for pooling usage on the object itself
    this.outgoingCommand = this._getNewCommand(); //modified by player inputs
    this.commands = new Array();
    this.trueCommands = new Array();
    this.perceivedCommands = new Array();
    for(var i=1; i<=playerCount; i++) {
        this.commands[i] = new rollbackgameengine.datastructures.SinglyLinkedList();
        this.trueCommands[i] = null;
        this.perceivedCommands[i] = null;
    }

    //simulations
    this.trueSimulation = new Simulation();
    this.perceivedSimulation = new Simulation();

    //frame delay
    this.frameDelay = frameDelay + 1;
    //this.gameDelay = true;
    //this.perceivedSimulation.frame -= this.frameDelay; //causes it to start late - doesn't do anything as true world rollback just ignores it

    //todo - consider isTrueSimulation boolean

    //frame rate
    this.frameRate = frameRate;

    //connection
    this.connection = new rollbackclientengine.Connection();
    this.connection.connect(url);
    this.connection.delegate = this;
    this.connection.onConnect = function() { this.delegate.onConnect.call(this.delegate) };
    this.connection.onReceivedText = function(t) { this.delegate.onReceivedText.call(this.delegate, t) };
    this.connection.onReceivedData = function(m) { this.delegate.onReceivedData.call(this.delegate, m) };
    this.connection.onDisconnect = function(m) { this.delegate.onDisconnect.call(this.delegate) };

    //player
    this.player = 0; //will be set by server

    //player count - if use default 2, doesn't store player
    this.shouldSendPlayer = playerCount > 2;
    this.playerCount = playerCount;
    if(this.shouldSendPlayer) {
        //todo - calculate bit size
        this.sendPlayerBitSize = null;
    }

    //minimum update frame - if use default 1, doesn't store frame #
    if(minimumUpdateFrame === 1) {
        this.shouldSendFrame = false;
    }else {
        //store values
        this.shouldSendFrame = true;
        this.minimumUpdateFrame = minimumUpdateFrame;
    }

    //last received frame
    if(this.shouldSendPlayer) {
        //1 per player
        this.lastReceivedFrame = new Array();
    }else {
        //just 1 for the other player
        //*todo - figure out if starting frame is -1 or 0 or 1, going with 0 for now
        this.lastReceivedFrame = 0;
    }

    //byte size - used to acquire outgoing message from pool or create it
    this.outgoingByteSize = this.outgoingCommand.totalBitSize;
    this.outgoingByteSize /= 8;
    this.outgoingByteSize = Math.ceil(this.outgoingByteSize);

    //timing
    //this.date = new Date();
    this.currentTime = null;
    this.nextFrameTime = null;

    //started
    this.started = false;

    //rollback
    this.shouldRollback = false;

    //render
    this.shouldRender = false;

    //frame difference - how many frames since last perceived update
    this.frameDifference = 0;
}

//updates

rollbackclientengine.controllers.PlayController.prototype.updateTrueSimulation = function() {
    //todo - command lookahead check

    /*
    //determine game delay is over
    if(this.gameDelay) {
        return;
    }
    */

    //determine frame to loop to
    if(this.shouldSendPlayer) {
        //todo get the least of all the player frames and set to least frame
    }else {
        var leastFrame = Math.min(this.lastReceivedFrame, this.perceivedSimulation.frame-1);
    }

    //determine should update true
    if(this.trueSimulation.frame > leastFrame) {
        return;
    }

    //debug log
    if(!this.logsDisabled) {
        console.log(">FUNCTION UPDATE TRUE SIM");
    }

    //console.log("OMG TRUE EXECUTE - LEAST FRAME " + leastFrame + " VS TRUE FRAME " + this.trueSimulation.frame);

    //loop update true
    do {
        //loop through player commands
        for(var i=1, c=null; i<=this.playerCount; i++) {
            //get command node
            c = this.trueCommands[i];
            if(!c) {
                //set command to head
                c = this.commands[i].head;
                //console.log("set true command " + i + " to head");
            }else {
                //increment command
                c = c.next;
                //console.log("incremented true command " + i);
            }

            //check command exists
            if(this.shouldSendFrame) {
                //todo - check against frame and handle if command does not exist

                continue;
            }else if(!c) {
                //todo - remove this temporary check that shouldn't be needed
                alert("p" + this.player + " lf" + leastFrame + " tf" + this.trueSimulation.frame + " > wtf no true command for " + i + " in 2 player mode?");

                //debug logging
                this.logsDisabled = true;
                continue;
            }

            //debug log
            if(!this.logsDisabled) {
                console.log("p" + i + " true command " + c.obj.id);
            }

            //execute command
            this.trueSimulation.execute(i, c.obj);

            //increment true command
            this.trueCommands[i] = c;

            //pool unused commands
            while(this.commands[i].head !== c) { //why is this if statement failing?
                //debug log
                if(!this.logsDisabled) {
                    console.log("REMOVING COMMAND " + this.commands[i].head.obj.id + " FOR P" + i);
                }
                //pop and pool
                rollbackgameengine.pool.add(this.CommandObject, this.commands[i].pop());
            }
        }

        //debug log
        if(!this.logsDisabled) {
            console.log("UPDATING TRUE " + this.trueSimulation.frame);
        }

        //update true simulation
        this.trueSimulation.update();
    }while(this.trueSimulation.frame <= leastFrame);

    //determine needed
    if(!this.shouldRollback) {
        //exit
        return;
    }else {
        //reset
        this.shouldRollback = false;
    }

    //save frame
    var currentFrame = this.perceivedSimulation.frame;

    //debug log
    if(!this.logsDisabled) {
        console.log("rolling back from " + this.perceivedSimulation.frame + " to " + this.trueSimulation.frame);
    }

    //rollback simulations
    this.perceivedSimulation.rollback(this.trueSimulation);

    //rollback command positions
    for(var i=1; i<=this.playerCount; i++) {
        this.perceivedCommands[i] = this.trueCommands[i];
    }

    //loop update perceived back to current
    while(this.perceivedSimulation.frame < currentFrame) {
        //loop through player commands
        for(var i=1, c=null; i<=this.playerCount; i++) {
            //get command node
            c = this.perceivedCommands[i];
            if(!c) {
                //set command to head
                c = this.commands[i].head;
            }else {
                //increment command
                c = c.next;
            }

            //check command exists
            if(this.shouldSendFrame) {
                //todo - check against frame and handle if command does not exist

                //skip
                continue;
            }else if(!c) {
                //skip
                continue;
            }

            //debug log
            if(!this.logsDisabled) {
                console.log("p" + i + " perceived command " + c.obj.id);
            }

            //execute command
            this.perceivedSimulation.execute(i, c.obj);

            //increment perceived command
            this.perceivedCommands[i] = c;
        }

        //debug log
        if(!this.logsDisabled) {
            console.log("UPDATING PERCEIVED " + this.perceivedSimulation.frame);
        }

        //update perceived simulation
        this.perceivedSimulation.update();
    }
}

rollbackclientengine.controllers.PlayController.prototype.updatePerceivedSimulation = function() {
    //todo - command look ahead check

    //valid check
    if(this.currentTime < this.nextFrameTime) {
        return;
    }

    //debug log
    if(!this.logsDisabled) {
        console.log(">FUNCTION UPDATE PERCEIVED SIM");
    }

    //set boolean
    this.shouldRender = true;

    //loop update perceived
    do {
        //loop through player commands
        for(var i=1, c=null; i<=this.playerCount; i++) {
            //get command node
            c = this.perceivedCommands[i];
            if(!c) {
                //set command to head
                c = this.commands[i].head;
                //console.log("set player " + i + " command to head");
            }else {
                //increment command
                c = c.next;
            }

            //check command exists
            if(this.shouldSendFrame) {
                //todo - check against frame and handle if command does not exist

                //skip
                continue;
            }else if(!c) {
                //set boolean
                this.shouldRollback = true;

                //skip
                continue;
            }

            //execute command
            this.perceivedSimulation.execute(i, c.obj);

            //debug log
            if(!this.logsDisabled) {
                console.log("p" + i + " perceived command " + c.obj.id);
            }

            //increment perceived command
            this.perceivedCommands[i] = c;
        }

        //debug log
        if(!this.logsDisabled) {
            console.log("UPDATING PERCEIVED " + this.perceivedSimulation.frame + " WITH FRAME DIFF " + this.frameDifference);
        }

        //update perceived simulation
        this.perceivedSimulation.update();

        //console.log("perceived updated to " + this.perceivedSimulation.frame);

        //increment next frame time
        this.nextFrameTime += this.frameRate;

        //increment frame difference
        this.frameDifference++;
    }while(this.currentTime >= this.nextFrameTime);
}

rollbackclientengine.controllers.PlayController.prototype.sendInputs = function() {
    //valid check
    if(!this.shouldRender) {
        return;
    }

    //debug log
    if(!this.logsDisabled) {
        console.log(">FUNCTION SEND INPUTS");
    }

    //declare variables
    var message = null;

    //get message
    if(this.frameDifference > 1) {
        //send with frame

        //declare variables
        var frameBitSize = 1;
        var frameValue = this.frameDifference - 1; //0 based
        var byteSize = null;

        //loop
        while(frameValue > 1) {
            //divide by 2
            frameValue /= 2;

            //increment bit size
            frameBitSize++;
        }

        //calculate bit size
        byteSize = this.outgoingCommand.totalBitSize + frameBitSize;
        byteSize /= 8;
        byteSize = Math.ceil(byteSize);

        //debug logging
        if(!this.logsDisabled) {
            console.log("SKIPPED WITH FRAME DIFF " + this.frameDifference + " AND FRAME BIT SIZE " + frameBitSize + " AND TOTAL BYTE SIZE " + byteSize);
        }

        //get message
        message = rollbackgameengine.pool.acquire("msg"+byteSize);
        if(!message) {
            message = new rollbackgameengine.networking.OutgoingMessage(byteSize);
        }
    }else {
        //do not send frame

        //get message
        message = rollbackgameengine.pool.acquire("msg"+this.outgoingByteSize);
        if(!message) {
            message = new rollbackgameengine.networking.OutgoingMessage(this.outgoingByteSize);
        }
    }

    //reset
    message.reset();

    //create command
    var c = this._getNewCommand();

    //load command
    c.loadFromCommand(this.outgoingCommand);

    //set frame
    if(this.shouldSendFrame) {
        //todo - take frame difference and calculate actual frame
    }

    //debug logging
    if(!this.logsDisabled) {
        c.id = this.commandID[this.player]++;
        c.frame = this.perceivedSimulation.frame;
    }

    //store command
    this.commands[this.player].add(c);
    //console.log("storing my perceived command " + c);

    //duplicate command
    if(!this.shouldSendFrame) {
        //loop
        for(var i=1; i<this.frameDifference; i++) {
            //create command
            c = this._getNewCommand();

            //load command
            c.loadFromCommand(this.outgoingCommand);

            //debug logging
            if(!this.logsDisabled) {
                c.id = this.commandID[this.player]++;
                c.frame = this.perceivedSimulation.frame;
                console.log("ADD CLONED COMMAND");
            }

            //store command
            this.commands[this.player].add(c);
        }
    }

    //debug logging
    if(!this.logsDisabled) {
        console.log("Storing Own Command");
        this.displayCommands();
    }

    //append command data to message
    c.addDataToMessage(message);

    //add frame to message
    if(this.frameDifference > 1) {
        //debug log
        if(!this.logsDisabled) {
            console.log("Adding final unsigned integer");
        }
        message.addFinalUnsignedInteger(this.frameDifference-1);
    }

    //send message
    this.connection.send(message);

    //pool message
    rollbackgameengine.pool.add("msg"+message.byteSize, message);
}

rollbackclientengine.controllers.PlayController.prototype.update = function() {
    //valid check
    if(!this.started) {
        return;
    }

    /*
    //determine game delay is over
    if(this.gameDelay) {
        if(this.perceivedSimulation.frame >= 0 && this.trueSimulation.frame <= this.perceivedSimulation.frame) {
            this.gameDelay = false;
        }
    }
    */

    //debug logging
    if(this.perceivedSimulation.frame > 100) {
        this.logsDisabled = true;
    }

    //reset frame difference
    this.frameDifference = 0;

    //current time
    this.currentTime = new Date().getTime();//this.date.getTime();

    //updates
    this.updateTrueSimulation();
    this.updatePerceivedSimulation();
    this.sendInputs();
}

//render

rollbackclientengine.controllers.PlayController.prototype.render = function(canvas) {
    //valid
    if(!this.started) {
        return;
    }

    //should this function do the clearing?
    //if so, how do I get the height and width?
    //what if I pass in canvas here?
    //is getting the ctx every time too slow?
    //for now just let someone else clear it
    //handle the clearing later

    //get context
    var ctx = canvas.getContext("2d");

    //render check
    if(this.shouldRender) {
        //clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //render
        //this.trueSimulation.render(ctx); //debug
        this.perceivedSimulation.render(ctx);

        if(!this.logsDisabled) {
            console.log(">RENDERING WITH TRUE " + this.trueSimulation.frame + " PERCEIVED " + this.perceivedSimulation.frame);
        }

        //debug logging
        if(this.frameDifference > 1) {
            this.framesSkipped += this.frameDifference-1;
        }
        ctx.font = "normal 36px Verdana";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(this.framesSkipped + " frames skipped", 50, 50);
    }
    this.shouldRender = false;
}

//connection

rollbackclientengine.controllers.PlayController.prototype.onConnect = function() {
    //send ready message
    var readyMessage = new rollbackgameengine.networking.OutgoingMessage(1);
    readyMessage.addUnsignedInteger(this.frameDelay, 7);
    this.connection.send(readyMessage);

    //add to pool
    rollbackgameengine.pool.add("msg1", readyMessage);
}

rollbackclientengine.controllers.PlayController.prototype.onReceivedText = function(text) {
    //todo - chat
}

rollbackclientengine.controllers.PlayController.prototype.onReceivedData = function(incomingMessage) {
    //todo sync start time

    //debug logging
    var c = null;

    if(!this.started) {
        //start command

        //set player
        this.player = incomingMessage.nextUnsignedInteger(1)+1;

        //deal with frame delay
        if(!this.shouldSendFrame) {
            if(this.shouldSendPlayer) {
                //todo - delay for multiple players
            }else {
                //debug log
                this.commandID[1] = 0;
                this.commandID[2] = 0;

                //your default commands
                for(var i=0; i<this.frameDelay; i++) {
                    //console.log("p" + this.player + " dummy " + i + " command");

                    //create command
                    c = this._getNewCommand();

                    //debug logging
                    c.id = this.commandID[this.player]++;

                    //add command
                    this.commands[this.player].add(c);

                    //debug logging
                    if(!this.logsDisabled) {
                        console.log("Storing Default Own Command");
                        this.displayCommands();
                    }
                }

                //delay
                var enemyDelay = incomingMessage.nextUnsignedInteger(7)

                //last received frame
                this.lastReceivedFrame = enemyDelay-1;

                //determine enemy player
                if(this.player === 1) {
                    var enemyPlayer = 2;
                }else {
                    var enemyPlayer = 1;
                }

                //default enemy commands
                for(var i=0, j=enemyDelay; i<j; i++) {
                    //create command
                    c = this._getNewCommand();

                    //debug logging
                    c.id = this.commandID[enemyPlayer]++;

                    //add
                    this.commands[enemyPlayer].add(c);

                    //debug logging
                    if(!this.logsDisabled) {
                        console.log("Storing Default Enemy Command");
                        this.displayCommands();
                    }
                }
            }
        }

        //set next frame time
        this.nextFrameTime = new Date().getTime() + this.frameRate;//this.date.getTime() + this.frameRate;

        //console.log("next frame time set to " + this.nextFrameTime);

        //set started
        this.started = true;
    }else {
        //game command

        //todo - message type - differentiate command and dump

        var player = null;

        //player
        if(this.shouldSendPlayer) {
            //todo - store and use it
            incomingMessage.nextUnsignedInteger(this.sendPlayerBitSize);
        }

        //get command
        var c = this._getNewCommand();

        //load command
        c.loadFromMessage(incomingMessage);

        //set player
        if(this.shouldSendPlayer) {
            //todo - use popped player variable
        }else {
            //only 2 players
            if(this.player === 1) {
                //set to p2
                player = 2;
            }else {
                //set to p1
                player = 1;
            }
        }

        //get frame
        var receivedFrameDifference = incomingMessage.finalUnsignedInteger()+1;

        //add frame to command
        if(this.shouldSendFrame) {
            //todo - code this
        }

        //debug logging
        c.id = this.commandID[player]++;

        //store command
        this.commands[player].add(c);

        //duplicate
        if(!this.shouldSendFrame) {
            //loop
            for(var i=1, duplicate=null; i<receivedFrameDifference; i++) {
                //create command
                duplicate = this._getNewCommand();

                //load command
                duplicate.loadFromCommand(c);

                //debug logging
                if(!this.logsDisabled) {
                    duplicate.id = this.commandID[player]++;
                    console.log("ADD CLONED COMMAND");
                }

                //store command
                this.commands[player].add(duplicate);
            }
        }

        //last received frame
        if(this.shouldSendPlayer) {
            //todo - add frame difference to it
            //this.lastReceivedFrame[player] += ;
        }else {
            //increment
            this.lastReceivedFrame += receivedFrameDifference;
        }

        //debug logging
        if(!this.logsDisabled) {
            console.log("Received Enemy Command");
            this.displayCommands();
        }
    }
}

rollbackclientengine.controllers.PlayController.prototype.onDisconnect = function() {
    this.started = false;
}

//command helper - private

rollbackclientengine.controllers.PlayController.prototype._getNewCommand = function() {
    //create
    var c = rollbackgameengine.pool.acquire(this.CommandObject);
    if(!c) {
        //debug logging
        if(!this.logsDisabled) {
            console.log("CREATING NEW COMMAND");
        }
        c = new this.CommandObject();
    }else {
        //debug logging
        if(!this.logsDisabled) {
            console.log("USING POOLED COMMAND");
        }
    }

    //return
    return c;
}

//debug logging

rollbackclientengine.controllers.PlayController.prototype.displayCommands = function() {
    //return;

    //declare variables
    var c = null;

    //loop
    for(var i=1; i<=this.playerCount; i++) {
        c = this.commands[i].head;
        while(c) {
            if(c === this.trueCommands[i]) {
                console.log("p" + i + " cmd " + c.obj.id + " " + c.obj + " (t)");
            }else if(c === this.perceivedCommands[i]) {
                console.log("p" + i + " cmd " + c.obj.id + " " + c.obj + " (p)");
            }else {
                console.log("p" + i + " cmd " + c.obj.id + " " + c.obj);
            }

            //increment
            c = c.next;
        }
    }
}