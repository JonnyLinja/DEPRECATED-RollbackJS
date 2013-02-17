RollbackJS
==========

SMALL:
- Pass in width and height to world
- Add offscreen check convenience function

NEXT:
- Rewrite spritemaps to have string IDs locally and integer IDs for networking
- Make frame value a variable length 4 bit encoding (optional set bit)
- Make outgoing messages non hardcoded length (frame 4 bit, sync last int)
- Compare sync check with server sync check

AFTER:
- Quake effect (see if can move the webpage DOM itself rather than camera)
- Figure out system for offscreen canvas prerendering for rotations
- Figure out system for canvas clearing bounding box

LATER:
- Figure out system for canvas layers (maybe, not necessary for my game)
- Extend spritemap to allow for multiple spritemap sources and scaling
- Interpolation (for direct player controlled objects)
- Camera
- Sounds (once WebAudio becomes standard)
- Tweens (maybe)