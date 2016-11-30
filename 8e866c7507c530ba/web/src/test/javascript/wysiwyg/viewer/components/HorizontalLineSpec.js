describe('HorizontalLineSpec', function() {

    testRequire().components('wysiwyg.viewer.components.FiveGridLine').resources('W.ComponentLifecycle') ;

    describe("Testing the Horizontal line", function() {
        this.horizontalLine = null ;

        beforeEach(function() {
            var node = new Element("div") ;
            this.horizontalLine = new this.FiveGridLine("line-id", node, {}) ;
        }) ;

        describe("when the user stretches the line sidewards", function() {
            it("should have only left and right _resizableSides", function() {
                var lineResizableSides = this.horizontalLine._resizableSides ;
                var allowedSides = [Constants.BaseComponent.ResizeSides.LEFT, Constants.BaseComponent.ResizeSides.RIGHT];

                expect(lineResizableSides.length).toBe(allowedSides.length) ;
                for(var index = 0; index < allowedSides.length; index +=1) {
                    expect(lineResizableSides.indexOf(allowedSides[index])).not.toBe(-1) ;
                }
            });
        }) ;
    })
});
