
//==================================================//
// rollbackgameengine/components/spritemap.js
// todo - create internal id system to represent animations per entity
// dont want the internal code to use string identifiers but want networking to use it
//==================================================//

rollbackgameengine.components.spritemap = {
	loadType : function(type, options) {
		//create animation
		type._spritemapAnimations = {};

		//add to animations
		var a = null;
		for(var i=0, j=options.animations.length; i<j; i++) {
			//get animation
			a = options.animations[i];

			//store it
			type._spritemapAnimations[a.id] = a;

			//rewrite id
			a.id = i;
		}
	},

	loadEntity : function(entity, options) {
		//save url
		entity.imagesrc = options.source;

		//set up variables
		entity._spritemapAnimation = null;
		entity._spritemapAnimationPosition = 0;

		//animate function
		entity.animateSpritemap = this._animateSpritemap;
	},

	update : function(entity) {
		//animate
		if(entity._spritemapAnimation && entity._spritemapAnimationPosition >= 0) {
			//increment array position
			entity._spritemapAnimationPosition++;
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

		//determine there is an animation
		if(!entity._spritemapAnimation) {
			return;
		}

		//rate
		var rate = entity._spritemapAnimation.rate;
		if(!rate) {
			rate = 1;
		}

		//define frame
		var frame = null;

		//get normalized position
		var position = Math.floor(entity._spritemapAnimationPosition / rate);

		//max check
		if(position >= entity._spritemapAnimation.frames.length) {
			//maxed
			if(entity._spritemapAnimation.loop) {
				//set to beginning
				entity._spritemapAnimationPosition = 0;
				frame = entity._spritemapAnimation.frames[0];
			}else {
				//end animation
				entity._spritemapAnimationPosition = -1;
				frame = entity._spritemapAnimation.frames[0];
			}
		}else {
			//not maxed
			frame = entity._spritemapAnimation.frames[position];
		}

		//calculate offsets
		var columns = Math.floor(entity.image.width / entity.width);
		var offsetX = frame;
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
		entity1._spritemapAnimation = entity2._spritemapAnimation;
		entity1._spritemapAnimationPosition = entity2._spritemapAnimationPosition;
	},

	removedFromWorld : function(entity) {
		//reset
		entity._spritemapAnimation = null;
		entity._spritemapAnimationPosition = 0;
	},

	//this refers to entity
	_animateSpritemap : function(animationID) {
		if(this._spritemapAnimation && this._spritemapAnimation === this.type._spritemapAnimations[animationID]) {
			//already animating it
			if(this._spritemapAnimationPosition < 0) {
				//start a stopped animation
				this._spritemapAnimationPosition = 0;
			}
		}else {
			//new animation
			this._spritemapAnimation = this.type._spritemapAnimations[animationID];
			this._spritemapAnimationPosition = 0;
		}
	}
}
