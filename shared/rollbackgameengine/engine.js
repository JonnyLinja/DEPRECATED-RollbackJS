
//==================================================//
// rollbackgameengine/engine.js
//==================================================//

//declare namespaces
var rollbackgameengine = {};
rollbackgameengine.datastructures = {};
rollbackgameengine.networking = {};
rollbackgameengine.components = {};

//nodejs
if(typeof window === 'undefined') {
	console.log("nodejs detected, exporting");
	module.exports = rollbackgameengine;
}
