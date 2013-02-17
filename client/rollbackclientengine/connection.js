
//==================================================//
// rollbackclientengine/networking/connection.js
//==================================================//

rollbackclientengine.Connection = function() {
	//socket
	this.socket = null;

	//message
	this.message = new rollbackgameengine.networking.IncomingMessage();

	//message handlers
	this.onConnect = null;
	this.onReceivedText = null;
	this.onReceivedData = null;
	this.onDisconnect = null;
};

rollbackclientengine.Connection.prototype.connect = function(url) {
	//validity check - only one open
	if(this.socket) {
		return;
	}

	//create socket
	this.socket = new WebSocket(url);
	this.socket.binaryType = 'arraybuffer';
	this.socket.connection = this;

	//set handlers
	this.socket.onopen = this._onOpen;
	this.socket.onmessage = this._onMessage;
	this.socket.onclose = this._onClose;
};

//expects string or outgoingmessage
rollbackclientengine.Connection.prototype.send = function(outgoing) {
	if(typeof outgoing === "string") {
		//string
		this.socket.send(outgoing);
	}else {
		//outgoingmessage
		this.socket.send(outgoing.arrayBuffer);
	}
};

//private - don't touch
//this refers to the socket, not to connection
//access connection via this.connection

rollbackclientengine.Connection.prototype._onOpen = function() {
	if(this.connection.onConnect) {
		this.connection.onConnect();
	}
};

rollbackclientengine.Connection.prototype._onMessage = function(e) {
	if(e.data instanceof ArrayBuffer) {
		if(this.connection.onReceivedData) {
			//received binary
			this.connection.message.setArrayBuffer(e.data);
			this.connection.onReceivedData(this.connection.message);
		}
	}else if(this.connection.onReceivedText) {
		//received string
		this.connection.onReceivedText(e.data);
	}
};

rollbackclientengine.Connection.prototype._onClose = function() {
	if(this.connection.onDisconnect) {
		this.connection.onDisconnect();
	}
};
