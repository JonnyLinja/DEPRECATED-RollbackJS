//==================================================//
// shooter.js
//==================================================//

//declare namespaces
var shooter = {};
shooter.commands = {};
shooter.entities = {};
shooter.components = {};

//nodejs
if(typeof window === 'undefined') {
	module.exports = shooter;

	//this needs to be tested later, note that rollbackengine needs to be bundled together as well
	//in theory abuses function only scope to create rollbackengine
	var rollbackgameengine = require('./rollbackgameengine.js');
}
