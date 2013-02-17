
//==================================================//
// components/hp.js
//==================================================//

shooter.components.hp = {
	loadEntity : function(entity, options) {
		//set hp
		entity.hp = options.hp;
	},

	rollback : function(entity1, entity2) {
		entity1.hp = entity2.hp;
	}
}
