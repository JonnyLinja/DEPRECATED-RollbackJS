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
	var rollbackgameengine = require('./rollbackserverengine/gameengine.js');
}

//easy to read combine script
/*
type shared\shooter.js shared\components\HP.js shared\components\velocity.js shared\components\removeoffscreen.js shared\components\damagedoncollision.js
shared\components\explodesoncollision.js shared\entities\alien.js shared\entities\human.js shared\entities\bullet.js shared\entities\explosion.js
shared\entities\wall.js shared\gamesimulation.js shared\commands\command.js shraed\commands\commandprocessor.js > shootergame.js
*/

//combined script
//type shared\shooter.js shared\components\HP.js shared\components\velocity.js shared\components\removeoffscreen.js shared\components\damagedoncollision.js shared\components\explodesoncollision.js shared\entities\alien.js shared\entities\human.js shared\entities\bullet.js shared\entities\explosion.js shared\entities\wall.js shared\gamesimulation.js shared\commands\command.js shared\commands\commandprocessor.js > shootergame.js
