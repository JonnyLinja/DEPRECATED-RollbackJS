
//==================================================//
// components/removeoffscreen.js
//==================================================//

shooter.components.removeOffscreen = {
	load : function(entity) {
		//return
		return this;
	},

	update : function(entity) {
		//hardcoded width and height until can figure out where to store width/height
		if(entity.right < 0 || entity.x > 800 || entity.bottom < 0 || entity.y > 640) {
			entity.world.recycleEntity(entity);
		}
	}
}
