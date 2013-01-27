RollbackJS
==========

SMALL:
- Add semicolons to prototype functions
- Pass in width and height to world
- Add offscreen check convenience function

NEXT:
- Add encode and decode to data for entities and components
- Code sync check
- Rewrite spritemaps to be more accommodating to sync checks (ID system)
- Make sync value a variable length 4 bit encoding
- Build master server simulation with data dump

AFTER:
- Figure out system for canvas layers (background and boulders should have their own canvases)
- Figure out system for offscreen canvas prerendering
- Figure out system for canvas clearing bounding box
- Remove zPosition from entity factories and replace with layer system

LATER:
- Interpolation (for direct player controlled objects)
- Camera
- Quake effect (see if can move the canvas itself rather than camera)
- Sounds (once WebAudio becomes standard)
- Tweens (maybe)