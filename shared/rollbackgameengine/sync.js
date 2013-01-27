
//==================================================//
// rollbackgameengine/sync.js
//==================================================//

rollbackgameengine.sync = {};
rollbackgameengine.sync.none = 0; //do not sync this entity
rollbackgameengine.sync.singleton = 1; //only 1, always exists
rollbackgameengine.sync.sometimes = 2; //bool for use, if true then followed by count and data
rollbackgameengine.sync.often = 3; //count followed by data
