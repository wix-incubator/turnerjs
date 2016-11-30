
describe('console._oldConsole', function() {

    it('should be defined', function() {
        expect(console._oldConsole).toBeDefined();
    });

    describe('console._oldConsole.log', function() {

        it('should be a function', function(){
            expect(typeof console._oldConsole.log).toBe('function');
        });

    });

});
