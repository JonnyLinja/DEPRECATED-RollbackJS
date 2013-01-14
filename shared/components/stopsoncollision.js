
//==================================================//
// components/stopsoncollision.js
//==================================================//

shooter.components.StopsOnCollision = function() {
}

shooter.components.StopsOnCollision.prototype.init = function() {
	//register collisions
	for(var i=0, j=arguments.length; i<j; i++) {
		this.entity.registerCollision(arguments[i], this);
	}
}

shooter.components.StopsOnCollision.prototype.didCollide = function(entity) {
	//todo - stop flush
	//this.entity.world.recycleEntity(this.entity);
}
