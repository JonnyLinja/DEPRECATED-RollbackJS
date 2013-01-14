
//==================================================//
// components/hp.js
//==================================================//

shooter.components.HP = function() {
}

shooter.components.HP.prototype.init = function(maxHP) {
	//set hp
	this.entity.hp = maxHP;
}

shooter.components.HP.prototype.rollback = function(component) {
	this.entity.hp = component.entity.hp;
}
