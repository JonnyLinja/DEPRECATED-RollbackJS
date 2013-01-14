
//==================================================//
// rollbackgameengine/components/frame.js
//==================================================//

rollbackgameengine.components.Frame = function() {
}

rollbackgameengine.components.Frame.prototype.init = function(x, y, width, height) {
	//add default properties to parent
	this.entity.x = x;
	this.entity.y = y;
	this.entity.width = width;
	this.entity.height = height;
}

rollbackgameengine.components.Frame.prototype.rollback = function(component) {
	//rollback values
	this.entity.x = component.entity.x;
	this.entity.y = component.entity.y;
}
