
//==================================================//
// rollbackgameengine/components/frame.js
//==================================================//

rollbackgameengine.components.frame = {
	load : function(entity, x, y, width, height) {
		//add default properties to parent
		entity.x = x;
		entity.y = y;
		entity.width = width;
		entity.height = height;

		//return
		return this;
	},
	
	rollback : function(entity1, entity2) {
		//rollback values
		entity1.x = entity2.x;
		entity1.y = entity2.y;
	}
}
