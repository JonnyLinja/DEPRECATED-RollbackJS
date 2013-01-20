
//==================================================//
// rollbackgameengine/components/spritemap.js
// for now, not going to code for server
// get just it working to get an understanding of how everything works
// later on need to be able to store spritemap data separately from easel spritemap
//==================================================//

rollbackgameengine.components.spritemap = {
	load : function(entity, imagesrc) {
		//save url
		entity.imagesrc = imagesrc;

		//return
		return this;
	},

	update : function(entity) {

	},

	render : function(entity, ctx) {
		//create image
		if(!entity.image) {
			entity.image = new Image();
			entity.image.src = entity.imagesrc;
		}

		//draw
		ctx.drawImage(entity.image, 0, 0, entity.width, entity.height, entity.x, entity.y, entity.width, entity.height);
	},

	rollback : function(entity1, entity2) {

	}
}
