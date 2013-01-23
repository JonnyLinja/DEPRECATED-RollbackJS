
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
		entity._spritemapAnimationFrame = 0;
		entity.spritemapAnimation = null;
		entity.spritemapAnimationIsLooping = false;
		entity.spritemapAnimationRate = 1;
		entity._spritemapAnimationPosition = 0;

		//getters and setters
		entity.__defineGetter__("spritemapAnimationFrame",  this._getSpritemapAnimationFrame);
		entity.__defineSetter__("spritemapAnimationFrame",  this._setSpritemapAnimationFrame);

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

			//rate check
			if(entity._spritemapAnimationPosition % entity.spritemapAnimationRate !== 0) {
				return;
			}

			//get normalized position
			var position = Math.floor(entity._spritemapAnimationPosition / entity.spritemapAnimationRate);

			//max check
			if(position >= entity.spritemapAnimation.length) {
				if(entity.spritemapAnimationIsLooping) {
					//set to beginning
					entity._spritemapAnimationPosition = 0;
					position = 0;
				}else {
					//end animation
					entity._spritemapAnimationPosition = -1;
					position = 0;
				}
			}

			//get frame
			entity._spritemapAnimationFrame = entity.spritemapAnimation[position];
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
		var offsetX = entity._spritemapAnimationFrame;
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
		entity1._spritemapAnimationFrame = entity2._spritemapAnimationFrame;
		entity1.spritemapAnimation = entity2.spritemapAnimation;
		entity1.spritemapAnimationIsLooping = entity2.spritemapAnimationIsLooping;
		entity1._spritemapAnimationPosition = entity2._spritemapAnimationPosition;
		entity1.spritemapAnimationRate = entity2.spritemapAnimationRate;
	},

	removedFromWorld : function(entity) {
		//reset
		entity._spritemapAnimationFrame = 0;
		entity.spritemapAnimation = null;
		entity.spritemapAnimationIsLooping = false;
		entity.spritemapAnimationRate = 1;
		entity._spritemapAnimationPosition = 0;
	},

	//this refers to entity
	_getSpritemapAnimationFrame : function() {
		return this._spritemapAnimationFrame;
	},

	//this refers to entity
	_setSpritemapAnimationFrame : function(f) {
		//save frame
		this._spritemapAnimationFrame = f;

		//stop animations
		this._spritemapAnimationPosition = -1;
	},

	//this refers to entity
	_animateSpritemap : function(array, loop, rate) {
		//default loop
		if(typeof loop === 'undefined') {
			loop = false;
		}

		//default rate
		if(typeof rate === 'undefined' || rate < 1) {
			rate = 1;
		}

		//save loop
		this.spritemapAnimationIsLooping = loop;

		//save rate
		this.spritemapAnimationRate = rate;

		//detect already animating
		if(this.spritemapAnimation === array) {
			//start a stopped animation
			if(this._spritemapAnimationPosition < 0) {
				this._spritemapAnimationPosition = 0;
				this._spritemapAnimationFrame = array[0];
			}

			//return
			return;
		}

		//save properties
		this.spritemapAnimation = array;
		this._spritemapAnimationFrame = array[0];
		this._spritemapAnimationPosition = 0;
	}
}
