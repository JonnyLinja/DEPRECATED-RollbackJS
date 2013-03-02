var game = require("./shootergame.js");

require('./rollbackserverengine/serverengine.js').start({
	Simulation: game.GameSimulation,
	Command: game.commands.Command,
	playerCount: 2,
	syncFrameRate: 10, //30
	frameSkipBitSize: 4
});