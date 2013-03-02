
//==================================================//
// rollbackgameengine/components/spritemap.js
// todo - create internal id system to represent animations per entity
// dont want the internal code to use string identifiers but want networking to use it
//==================================================//

rollbackgameengine.components.spritemap = {
	loadType : function(type, options) {
		//save url
		type._imagesrc = options.source;

		//create animation object
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

		//store id bitsize
		type._spritemapAnimationBitSize = rollbackgameengine.networking.calculateUnsignedIntegerBitSize(options.animations.length);
	},

	loadEntity : function(entity, options) {
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

			//rate
			var rate = entity._spritemapAnimation.rate;
			if(!rate) {
				rate = 1;
			}

			//get normalized position
			var position = ~~(entity._spritemapAnimationPosition / rate);

			//max check
			if(position >= entity._spritemapAnimation.frames.length) {
				//maxed
				if(entity._spritemapAnimation.loop) {
					//set to beginning
					entity._spritemapAnimationPosition = 0;
				}else {
					//end animation
					entity._spritemapAnimationPosition = -1;
				}
			}
		}
	},

	render : function(entity, ctx) {
		//create image
		if(!entity.image) {
			entity.image = new Image();
			entity.image.src = entity.type._imagesrc;
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

		//get normalized position
		var position = ~~(entity._spritemapAnimationPosition / rate);
		if(position < 0) {
			position = entity._spritemapAnimation.frames.length-1;
		}

		//calculate offsets
		var columns = Math.floor(entity.image.width / entity.width);
		var offsetX = entity._spritemapAnimation.frames[position];
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
		entity1._spritemapAnimation = entity2._spritemapAnimation;
		entity1._spritemapAnimationPosition = entity2._spritemapAnimationPosition;
	},

	removedFromWorld : function(entity) {
		//reset
		entity._spritemapAnimation = null;
		entity._spritemapAnimationPosition = 0;
	},

	encode : function(entity, outgoingMessage) {
		//id
		var id = 0;
		if(entity._spritemapAnimation) {
			id = entity._spritemapAnimation.id+1;
		}
		outgoingMessage.addUnsignedInteger(id, entity.type._spritemapAnimationBitSize);

		//position
		if(id > 0) {
			//rate
			var rate = 1;
			if(entity._spritemapAnimation.rate) {
				rate = entity._spritemapAnimation.rate;
			}

			//bitsize
			var bitSize = rollbackgameengine.networking.calculateUnsignedIntegerBitSize(entity._spritemapAnimation.frames.length * rate);

			//add
			outgoingMessage.addUnsignedInteger(entity._spritemapAnimationPosition+1, bitSize);
		}
	},

	decode : function(entity, incomingMessage) {
		//get id
		var id = incomingMessage.nextUnsignedInteger(entity.type._spritemapAnimationBitSize)-1;

		//set spritemap animation
		if(id < 0) {
			//no animation
			entity._spritemapAnimation = null;
			entity._spritemapAnimationPosition = 0;
		}else {
			//animation

			//set animation
			for(var anim in entity.type._spritemapAnimations) {
				if(entity.type._spritemapAnimations[anim].id === id) {
					entity._spritemapAnimation = entity.type._spritemapAnimations[anim];
					break;
				}
			}

			//rate
			var rate = 1;
			if(entity._spritemapAnimation.rate) {
				rate = entity._spritemapAnimation.rate;
			}

			//bitsize
			var bitSize = rollbackgameengine.networking.calculateUnsignedIntegerBitSize(entity._spritemapAnimation.frames.length * rate);

			//set position
			entity._spritemapAnimationPosition = incomingMessage.nextUnsignedInteger(bitSize)-1;
		}
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
