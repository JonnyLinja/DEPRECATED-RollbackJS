//
// GONNA BE SOME DIRTY CODE
// DON'T REALLY CARE - JUST WANT TO TEST PLAYCONTROLLER
// LATER CLEAN IT UP
// MAY WANT TO ADD SCENES/STAGES AND THE PRIMARY GAME LOOP AND STUFF TO CLIENT ENGINE ANYWAY
//

//game loop helper

if (!window.requestAnimationFrame ) {
	window.requestAnimationFrame = (function() {
		return window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
				window.setTimeout( callback, 1000 / 60 );
			};
	})();
}

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

function onmousemove(e) {
	//get relative x y
	var x = e.pageX-canvas.offsetLeft;
	var y = e.pageY-canvas.offsetTop;

	//normalize
	if(x < 0) {
		x = 0;
	}
	if(x > canvas.width) {
		x = canvas.width;
	}
	if(y < 0) {
		y = 0;
	}
	if(y > canvas.height) {
		y = canvas.height;
	}

	//set command
	controller.outgoingCommand.mouseX = x;
	controller.outgoingCommand.mouseY = y;
}

function onmousedown(e) {
	controller.outgoingCommand.mouseDown = true;
}

function onmouseup(e) {
	controller.outgoingCommand.mouseDown = false;
}

//update loop
function loop() {
	//request anim frame
    requestAnimationFrame(loop);
    //window.requestAnimFrame(loop);

    //set canvas once able
	if(typeof canvas === 'undefined' || !canvas) {
		var temp = document.getElementById("testCanvas");
		if(temp) {
			//load
			canvas = temp;
			canvas.onmousemove = onmousemove;
			canvas.onmousedown = onmousedown;
			canvas.onmouseup = onmouseup;
		}
	}

	//update and render
	if(canvas) {
		controller.update();
		controller.render(canvas);
	}
}
loop();
