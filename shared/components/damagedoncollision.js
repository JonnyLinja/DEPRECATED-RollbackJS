
//==================================================//
// components/damagedoncollision.js
//==================================================//

shooter.components.DamagedOnCollision = function() {
}

shooter.components.DamagedOnCollision.prototype.init = function() {
	//register collisions
	for(var i=0, j=arguments.length; i<j; i++) {
		this.entity.registerCollision(arguments[i], this);
	}
}

shooter.components.DamagedOnCollision.prototype.didCollide = function(entity) {
	//damage
	this.entity.HP--;
}
