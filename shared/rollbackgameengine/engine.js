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

//easy to read combine script
/*
type shared\rollbackgameengine\engine.js shared\rollbackgameengine\id.js shared\rollbackgameengine\sync.js shared\rollbackgameengine\networking\message.js
shared\rollbackgameengine\networking\incomingmessage.js shared\rollbackgameengine\networking\outgoingmessage.js
shared\rollbackgameengine\networking\variablemessage.js shared\rollbackgameengine\datastructures\singlylinkedlist.js
shared\rollbackgameengine\datastructures\doublylinkedlist.js shared\rollbackgameengine\components\frame.js
shared\rollbackgameengine\components\collision.js shared\rollbackgameengine\components\spritemap.js
shared\rollbackgameengine\components\preventoverlap.js shared\rollbackgameengine\components\removedafter.js
shared\rollbackgameengine\pool.js shared\rollbackgameengine\entity.js shared\rollbackgameengine\world.js > rollbackgameengine.js
*/

//combined script
//type shared\rollbackgameengine\engine.js shared\rollbackgameengine\id.js shared\rollbackgameengine\sync.js shared\rollbackgameengine\networking\message.js shared\rollbackgameengine\networking\incomingmessage.js shared\rollbackgameengine\networking\outgoingmessage.js shared\rollbackgameengine\networking\variablemessage.js shared\rollbackgameengine\datastructures\singlylinkedlist.js shared\rollbackgameengine\datastructures\doublylinkedlist.js shared\rollbackgameengine\components\frame.js shared\rollbackgameengine\components\collision.js shared\rollbackgameengine\components\spritemap.js shared\rollbackgameengine\components\preventoverlap.js shared\rollbackgameengine\components\removedafter.js shared\rollbackgameengine\pool.js shared\rollbackgameengine\entity.js shared\rollbackgameengine\world.js > rollbackgameengine.js
