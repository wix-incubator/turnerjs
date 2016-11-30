define(['fake'], function(fake){
	'use strict';
    describe('fake', function(){
        it('should have a valid faker', function(){
            expect(fake).not.toBeUndefined();
        });

        it('should be a requirejs plugin', function(){
            expect(fake.load).toBeDefined();
            expect(typeof fake.load).toBe('function');
        });
    });
});