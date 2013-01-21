
//==================================================//
// rollbackgameengine/id.js
//==================================================//

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
