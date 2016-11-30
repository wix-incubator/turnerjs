describe("BgImageStrip", function () {
    testRequire()
        .classes('core.managers.components.ComponentBuilder')
        .components('wysiwyg.viewer.components.BgImageStrip', 'core.components.Image')
        .resources('W.Data', 'W.Viewer', 'W.ComponentLifecycle');
    var bgStrip, dataItem, dataMoc;
    beforeEach(function() {
        bgStrip = null;
        dataItem = this.W.Data.createDataItem( { type: 'Image', bgSize: 'auto', bgPosition: 'top left', bgRepeat: 'repeat', bgUrl: 'http://static.dummy.com/media/' } );

        // Moc Doc Width
        spyOn(W.Viewer, 'getDocWidth').andReturn(600);

        this.builder = new this.ComponentBuilder(document.createElement('div'));
        this.builder.withType( 'wysiwyg.viewer.components.BgImageStrip' )
               .withSkin( 'mock.viewer.skins.BgImageStripSkin' )
               .withData( dataItem )
               ._with("htmlId", "mockId")
               .onWixified( function( comp ){
                    bgStrip = comp;
                    getPlayGround().adopt(bgStrip.$view);
                })
               .create();
        waitsFor( function() { return bgStrip !== null && bgStrip.$view.$measure}, 'bgStrip component to be ready', 1000);
    });

    afterEach(function(){
        clearPlayGround();
    });

    describe('tests for the components structure', function(){
        beforeEach(function() {
            this.ComponentLifecycle["@testRenderNow"](bgStrip);
        });

//
//        _isFakeOrEmptyUri : function() {
//            var uri = this._data.get('uri');
//            return !uri || uri === '' || /add\_image\_thumb\.png/.test(uri);
//        },

//
//        it('image uri should be defined and set to empty string', function(){
//            var uri = bgStrip.getDataItem().get('uri')
//                ,expectedUri = ''
//            expect( uri ).toBeDefined();
//            expect( uri ).toBe( expectedUri );
//        });
//
        xit('image uri should be defined and set to empty string', function(){
            var uri = bgStrip.getDataItem().get('uri');
            var spy = spyOn(bgStrip, '_isFakeOrEmptyUri');

            expect( uri ).toBeDefined();
//            expect( spy ).toHaveBeenCalled();
            expect( uri ).toMatch( /add\_image\_thumb\.png/ );
        });

        it('bg properties should be defined', function(){
            var bgData = bgStrip.getDataItem();
            expect(bgData.get('bgUrl')).toBeDefined();
        });

        xit('should set component offset', function(){
            var expectedOffset = Math.floor(_.parseInt( bgStrip._view.style.left ));
            expect( Math.floor( bgStrip._getDiff()) ).toBe( expectedOffset );
        });

        it('should set component width', function(){
            expect( bgStrip.getWidth() ).toBe( document.body.clientWidth );
        });

        it('should be resizable by y-axis only', function(){
            var resize = bgStrip._resizableSides;

            expect(resize.length).toBe(2);
            expect(resize).toContain('RESIZE_TOP');
            expect(resize).toContain('RESIZE_BOTTOM');
        });

        it('should not fall into infinite loop if width was changed', function () {
            var setWidth = spyOn(bgStrip, 'setWidth').andCallThrough(),
                timePassed;

            bgStrip.setWidth(100);

            setTimeout(function () {
                timePassed = true;
            }, 500);

            waitsFor(function () {
                return timePassed;
            }, 600);

            runs(function () {
                expect(setWidth.callCount).toBe(2);
                expect(setWidth).toHaveBeenCalledWith(100);
                expect(setWidth).toHaveBeenCalledWith(document.body.clientWidth);
            });
        });
    });
});
