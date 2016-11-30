describe('VerticalLineSpec', function() {

    testRequire().components('wysiwyg.viewer.components.VerticalLine').resources('W.ComponentLifecycle') ;

    describe("Testing the vertical line", function() {
        this.verticalLine = null;
        this.lineNode = null;

        beforeEach(function() {
            this.lineNode = document.createElement('div');
            this.verticalLine = new this.VerticalLine("line-id", this.lineNode, {}) ;
        }) ;

        describe("when the user stretches the line up or downwards", function() {
            it("should have only top and bottom _resizableSides", function() {
                var lineResizableSides = this.verticalLine._resizableSides ;
                var allowedSides = [Constants.BaseComponent.ResizeSides.TOP, Constants.BaseComponent.ResizeSides.BOTTOM]

                expect(lineResizableSides.length).toBe(allowedSides.length) ;
                for(var index = 0; index < allowedSides.length; index +=1) {
                    expect(lineResizableSides.indexOf(allowedSides[index])).not.toBe(-1) ;
                }
            });
        }) ;
    })
});
