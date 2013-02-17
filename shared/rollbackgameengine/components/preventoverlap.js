
//==================================================//
// rollbackgameengine/components/preventoverlap.js
//==================================================//

rollbackgameengine.components.preventOverlap = {
	loadType : function(type, options) {
		//declare variables
		var shouldAddToType = false;

		//check add to type
		if(!type._preventOverlapMap) {
			//set boolean
			shouldAddToType = true;

			//create hash
			type._preventOverlapMap = {};
		}

		//loop through types
		for(var i=0, j=options.types.length; i<j; i++) {
			//register collision
			type.registerCollision(options.types[i], this);

			//add to type
			if(shouldAddToType) {
				type._preventOverlapMap[options.types[i]] = null; //doing it this way for lookup speed
			}
		}
	},

	didCollide : function(entity1, entity2) {
		//declare variables
		var halfPreventOverlap = (entity2.type._preventOverlapMap && typeof entity2.type._preventOverlapMap[entity1.type] !== 'undefined');
		var right1 = entity1.right;
		var right2 = entity2.right;
		var bottom1 = entity1.bottom;
		var bottom2 = entity2.bottom;
		var centerX1 = entity1.centerX;
		var centerX2 = entity2.centerX;
		var centerY1 = entity1.centerY;
		var centerY2 = entity2.centerY;
		var diffX = 0;
		var diffY = 0;
		var isLeft = (centerX1 < centerX2);
		var isRight = (centerX1 > centerX2);
		var isTop = (centerY1 < centerY2);
		var isBottom = (centerY1 > centerY2);

		//get x diffs
		if(isLeft) {
			diffX = right1 - entity2.x;
		}else if(isRight) {
			diffX = right2 - entity1.x;
		}

		//get y diffs
		if(isTop) {
			diffY = bottom1 - entity2.y;
		}else if(isBottom) {
			diffY = bottom2 - entity1.y;
		}

		//valid check
		if(!isLeft && !isRight && !isTop && !isBottom) {
			return;
		}

		//resolve
		if((!isTop && !isBottom) || (diffX <= diffY)) {
			//x
			if(isLeft) {
				//left
				if(halfPreventOverlap) {
					//half
					entity1.moveX -= Math.ceil(diffX * 0.5);
				}else {
					//full
					entity1.moveX -= diffX;
				}
			}else if(isRight) {
				//right
				if(halfPreventOverlap) {
					//half
					entity1.moveX += Math.ceil(diffX * 0.5);
				}else {
					//full
					entity1.moveX += diffX;
				}
			}
		}else if((!isLeft && !isRight) || (diffX > diffY)) {
			//y
			if(isTop) {
				//top
				if(halfPreventOverlap) {
					//half
					entity1.moveY -= Math.ceil(diffY * 0.5);

				}else {
					//full
					entity1.moveY -= diffY;
				}
			}else if(isBottom) {
				//bottom
				if(halfPreventOverlap) {
					//half
					entity1.moveY += Math.ceil(diffY * 0.5);
				}else {
					//full
					entity1.moveY += diffY;
				}
			}
		}
	}
}
