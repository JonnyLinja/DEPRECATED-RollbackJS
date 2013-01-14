
//==================================================//
// components/diesoncollision.js
//==================================================//

shooter.components.DiesOnCollision = function() {
}

shooter.components.DiesOnCollision.prototype.init = function() {
	//register collisions
	for(var i=0, j=arguments.length; i<j; i++) {
		this.entity.registerCollision(arguments[i], this);
	}
}

shooter.components.DiesOnCollision.prototype.didCollide = function(entity) {
	//recycle
	this.entity.world.recycleEntity(this.entity);
}
