
//==================================================//
// rollbackgameengine/engine.js
//==================================================//

//declare namespaces
var rollbackgameengine = {};
rollbackgameengine.datastructures = {};
rollbackgameengine.networking = {};
rollbackgameengine.components = {};

//networking helper
rollbackgameengine.networking.messageBitSize = 8;

//identifiers
rollbackgameengine.identifiers = 1;
rollbackgameengine.giveID = function(o) {
	if(!o.hasOwnProperty("toString")) {
		var newIdentifier = rollbackgameengine.identifiers++ + "";
		o.toString = function() {
			return newIdentifier;
		};
	}
};

//nodejs
if(typeof window === 'undefined') {
	console.log("nodejs detected, exporting");
	module.exports = rollbackgameengine;
}
