define(['definition'], function(definition){
	'use strict';
    describe('definition', function(){
        it('should have a valid definition', function(){
            expect(definition).not.toBeUndefined();
        });

        it('should be a requirejs plugin', function(){
            expect(definition.load).toBeDefined();
            expect(typeof definition.load).toBe('function');
        });
    });
});