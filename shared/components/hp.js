
//==================================================//
// components/hp.js
//==================================================//

shooter.components.hp = {
	load : function(entity, maxHP) {
		//set hp
		entity.hp = maxHP;

		//return
		return this;
	},

	rollback : function(entity1, entity2) {
		entity1.hp = entity2.hp;
	}
}
