describe('lodash.js', function(){
    it("should be defined",function(){
        expect(_).toBeDefined();
    });

    describe("Settings", function () {
        describe("Markup", function () {
            it("should be mustache-like",function(){
                var generatedResult = _.template('hello {{ name }}!', { 'name': 'mustache' });
                expect(generatedResult).toBe("hello mustache!");
            });
        });
    });
});