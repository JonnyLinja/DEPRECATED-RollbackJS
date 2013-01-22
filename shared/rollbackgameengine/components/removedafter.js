
//==================================================//
// rollbackgameengine/components/removedafter.js
//==================================================//

rollbackgameengine.components.removedAfter = {
	load : function(entity, frames) {
		//add default properties to parent
		entity.factory._maxttl = frames;
		entity._ttl = frames;

		//return
		return this;
	},

	addedToWorld : function(entity) {
		//reset ttl
		entity._ttl = entity.factory._maxttl;
	},

	update : function(entity) {
		//decrement
		entity._ttl--;

		//remove
		if(entity._ttl <= 0) {
			console.log("recycling");
			//entity.world.recycleEntity(entity);
		}
	},
	
	rollback : function(entity1, entity2) {
		//rollback values
		entity1._ttl = entity2._ttl;
	}
}
