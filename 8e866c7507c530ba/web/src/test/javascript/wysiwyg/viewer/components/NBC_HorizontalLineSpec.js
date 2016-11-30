  describe("NBC_HorizontalLineSpec", function () {

    testRequire()
        .components('wysiwyg.viewer.components.FiveGridLine')
        .classes('core.managers.components.ComponentBuilder')
        /*.resources('W.ComponentLifecycle');*/
        .resources('W.Data', 'W.Viewer', 'W.ComponentLifecycle');

    describe("Testing the Horizontal line", function() {
        beforeEach(function() {
            var builder = new this.ComponentBuilder(document.createElement('div'));
            this.horizontalLine = null;

            builder
                .withType('wysiwyg.viewer.components.FiveGridLine')
                .withSkin('mock.viewer.skins.line.HorizontalSolidLine')
                ._with("htmlId", "mockId")
                .onWixified(function(component){
                    this.horizontalLine = component ;
                }.bind(this))
                .create();

            waitsFor(function() {
                return this.horizontalLine;
            }, "Horizontal line to be ready", 1000) ;
        }) ;

        describe("when the user stretches the line sidewards", function() {
            it("should have LEFT defined in _resizableSides", function() {
                var lineResizableSides = this.horizontalLine._resizableSides;

                expect(lineResizableSides.indexOf(Constants.BaseComponent.ResizeSides.LEFT)).toBeGreaterThan(-1);
            });

            it("should have RIGHT defined in _resizableSides", function() {
                var lineResizableSides = this.horizontalLine._resizableSides;

                expect(lineResizableSides.indexOf(Constants.BaseComponent.ResizeSides.RIGHT)).toBeGreaterThan(-1);
            });

            it("should have exactly two _resizableSides", function() {
                var lineResizableSides = this.horizontalLine._resizableSides;

                expect(lineResizableSides.length).toBe(2);
            });

            it("should resize the component height if the line skin part thickness changes", function() {
                waitsFor(function(){
                    return this.horizontalLine._skinParts.line.$measure;
                }.bind(this), "measure", 200);
                runs(function(){
                    var thickness = 200;
                    spyOn(this.horizontalLine, 'setHeight');

                    this.horizontalLine._skinParts.line.$measure.height = thickness;
                    this.ComponentLifecycle["@testRenderNow"](this.horizontalLine);

                    expect(this.horizontalLine.setHeight).toHaveBeenCalledWith(thickness);
                });
            });



        });

//        describe("Horizontal line after load behavior.", function() {
//
//            it('When user load the the page first time after save the lines left should be in the negative.', function () {
//                var cureentPosition,
//                    newPosition,
//                    properties = this.horizontalLine.getComponentProperties();
//
//                this.horizontalLine._firstInitialization = true;
//                this.horizontalLine.setX(0);
//                properties.set('fullScreenModeOn', true);
//
//                spyOn(this.horizontalLine.resources.W.Viewer,'getDocWidth').andReturn(980);
//                this.ComponentLifecycle["@testRenderNow"](this.horizontalLine);
//
//                cureentPosition = this.horizontalLine.getRequestDimensions().left;
//                newPosition = ((this.horizontalLine.resources.W.Viewer.getDocWidth() - (document.body.clientWidth))/2) - 1;
//
//                expect(cureentPosition).toBe(newPosition);
//            });
//
//
//        });
    });
});
