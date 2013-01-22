
//==================================================//
// rollbackgameengine/components/preventoverlap.js
//==================================================//

rollbackgameengine.components.preventOverlap = {
	load : function(entity) {
		//declare variables
		var shouldAddToFactory = false;

		//check add to factory
		if(!entity.factory._preventOverlapMap) {
			//set boolean
			shouldAddToFactory = true;

			//create hash
			entity.factory._preventOverlapMap = {};
		}

		//loop through factories
		for(var i=1, j=arguments.length; i<j; i++) {
			//register collision
			entity.registerCollision(arguments[i], this);

			//add to factory
			if(shouldAddToFactory) {
				entity.factory._preventOverlapMap[arguments[i]] = null; //doing it this way for lookup speed
			}
		}

		//return
		return this;
	},

	didCollide : function(entity1, entity2) {
		//declare variables
		var halfPreventOverlap = (entity2.factory._preventOverlapMap && typeof entity2.factory._preventOverlapMap[entity1.factory] !== 'undefined');
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
