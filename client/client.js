//
// GONNA BE SOME DIRTY CODE
// DON'T REALLY CARE - JUST WANT TO TEST PLAYCONTROLLER
// LATER CLEAN IT UP
// MAY WANT TO ADD SCENES/STAGES AND THE PRIMARY GAME LOOP AND STUFF TO CLIENT ENGINE ANYWAY
//

//game loop helper
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

//canvas
var canvas = null;

//controller
//var controller = new rollbackclientengine.controllers.PlayController('ws://127.0.0.1:8080', shooter.GameSimulation, shooter.Command); //local
var controller = new rollbackclientengine.controllers.PlayController('ws://shooter-5551.onmodulus.net', shooter.GameSimulation, shooter.Command); //live

//keydown
document.onkeydown = function(e) {
	//console.log("handle keydown");

	//cross browser issues exist
	if (!e) {
		var e = window.event;
	}

	//switch
	switch (e.keyCode) {
		//w
		case 87:
			controller.outgoingCommand.w = true;
			break;
		//a
		case 65:
			controller.outgoingCommand.a = true;
			break;
		//s
		case 83:
			controller.outgoingCommand.s = true;
			break;
		//d
		case 68:
			controller.outgoingCommand.d = true;
			break;
	}
}

//keyup
document.onkeyup = function(e) {
	//console.log("handle key up");

	//cross browser issues exist
	if (!e) {
		var e = window.event;
	}

	//switch
	switch (e.keyCode) {
		//w
		case 87:
			controller.outgoingCommand.w = false;
			break;
		//a
		case 65:
			controller.outgoingCommand.a = false;
			break;
		//s
		case 83:
			controller.outgoingCommand.s = false;
			break;
		//d
		case 68:
			controller.outgoingCommand.d = false;
			break;
	}
}

//update loop
function loop() {
	//request anim frame
    requestAnimationFrame(loop);

    //set canvas once able
	if(typeof canvas === 'undefined' || !canvas) {
		var temp = document.getElementById("testCanvas");
		if(temp) {
			canvas = temp;
		}
	}

	//update and render
	if(canvas) {
		controller.update();
		controller.render(canvas);
	}
}
loop();
