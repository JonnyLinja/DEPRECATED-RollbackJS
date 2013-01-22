
//==================================================//
// rollbackgameengine/components/spritemap.js
// todo - create internal id system to represent animations per entity
// dont want the internal code to use string identifiers but want networking to use it
//==================================================//

rollbackgameengine.components.spritemap = {
	load : function(entity, imagesrc) {
		//save url
		entity.imagesrc = imagesrc;

		//values
		entity.spritemapAnimationFrame = 0;
		entity.spritemapAnimation = null;
		entity.spritemapAnimationIsLooping = false;
		entity._spritemapAnimationPosition = 0;

		//animate function
		entity.animateSpritemap = this._animateSpritemap;

		//return
		return this;
	},

	update : function(entity) {
		//animate
		if(entity.spritemapAnimation && entity._spritemapAnimationPosition >= 0) {

			//increment array position
			entity._spritemapAnimationPosition++;

			//max check
			if(entity._spritemapAnimationPosition >= entity.spritemapAnimation.length) {
				if(entity.spritemapAnimationIsLooping) {
					//set to beginning
					entity._spritemapAnimationPosition = 0;
				}else {
					//end animation
					entity._spritemapAnimationPosition = -1;
				}
			}

			//get frame
			entity.spritemapAnimationFrame = entity.spritemapAnimation[entity._spritemapAnimationPosition];
		}
	},

	render : function(entity, ctx) {
		//create image
		if(!entity.image) {
			entity.image = new Image();
			entity.image.src = entity.imagesrc;
		}

		//hack determine loaded
		if(!entity.image.width) {
			return;
		}

		//calculate offsets
		var columns = Math.floor(entity.image.width / entity.width);
		var offsetX = entity.spritemapAnimationFrame;
		var offsetY = 0;
		while(offsetX >= columns) {
			offsetX -= columns;
			offsetY += entity.height;
		}
		offsetX *= entity.width;

		//draw
		ctx.drawImage(entity.image, offsetX, offsetY, entity.width, entity.height, Math.floor(entity.x), Math.floor(entity.y), entity.width, entity.height);
	},

	rollback : function(entity1, entity2) {
		//rollback values
		entity1.imagesrc = entity2.imagesrc;
		entity1.spritemapAnimationFrame = entity2.spritemapAnimationFrame;
		entity1.spritemapAnimation = entity2.spritemapAnimation;
		entity1.spritemapAnimationIsLooping = entity2.spritemapAnimationIsLooping;
		entity1._spritemapAnimationPosition = entity2._spritemapAnimationPosition;
	},

	//this refers to entity
	_animateSpritemap : function(array, loop) {
		//save properties
		this.spritemapAnimation = array;
		this.spritemapAnimationIsLooping = loop;
		this.spritemapAnimationFrame = array[0];
		this._spritemapAnimationPosition = 0;
	}
}
