
//==================================================//
// rollbackgameengine/components/spritemap.js
// for now, not going to code for server
// get just it working to get an understanding of how everything works
// later on need to be able to store spritemap data separately from easel spritemap
//==================================================//

rollbackgameengine.components.Spritemap = function() {
}

rollbackgameengine.components.Spritemap.prototype.init = function(imagesrc) {
	//image
	this.image = new Image();
	this.image.src = imagesrc;
	/*
	//spritesheet
	this.spriteSheet = new createjs.SpriteSheet({
    	// image to use
    	images: [this.image], 
    	// width, height & registration point of each sprite
    	frames: {width:this.entity.width, height:this.entity.height, regX:0, regY:0}, //is regxy position?
    	animations: {
    	    walkdown: [3, 4, "walkdown", 4]
	    }
	});

	//bitmap animation
	this.bmpAnimation = new createjs.BitmapAnimation(this.spriteSheet);

	//walkdown
	this.bmpAnimation.gotoAndPlay("walkdown");

	//start frame
	this.bmpAnimation.currentFrame = 0;
	*/
}

rollbackgameengine.components.Spritemap.prototype.update = function() {
	//this.bmpAnimation._tick();
}

rollbackgameengine.components.Spritemap.prototype.render = function(ctx) {
	/*
	ctx.save();
	this.bmpAnimation.updateContext(ctx);
	this.bmpAnimation.x = this.entity.x;
	this.bmpAnimation.y = this.entity.y;
	this.bmpAnimation.draw(ctx, true);
	ctx.restore();
	*/
	ctx.drawImage(this.image, 0, 0, this.entity.width, this.entity.height, this.entity.x, this.entity.y, this.entity.width, this.entity.height);
}

rollbackgameengine.components.Spritemap.prototype.rollback = function(component) {

}
