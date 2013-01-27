
//==================================================//
// rollbackgameengine/sync.js
//==================================================//

rollbackgameengine.sync = {};
rollbackgameengine.sync.never = 0; //do not sync this entity
rollbackgameengine.sync.singleton = 1; //same number always exists
rollbackgameengine.sync.sometimes = 2; //bool for use, if true then followed by count and data
rollbackgameengine.sync.often = 3; //count followed by data
