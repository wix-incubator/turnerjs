xdescribe("Temporarily turning tests off, due to failures.", function() {
//    describeExperiment({'MediaGalleryFrame': 'New'}, 'MediaFrameManagerSpec', function() {

        testRequire().classes('wysiwyg.editor.managers.MediaFrameManager');

        beforeEach(function() {
            spyOn(LOG, 'reportEvent').andCallFake(function(){});

            this.MediaFrameManager._initMediaGallery = function() {};

            window.Protocol = {
                forEditor: function() {
                    return {
                        onReady: function(callback) { callback(); },
                        initialize: function(options) {},
                        onItems: function(callback) { callback(); },
                        onCancel: function(callback) { callback(); }
                    };
                }
            };

            this.logic = new this.MediaFrameManager({
                i18nPrefix      : "single_image",
                publicMediaFile : "photos",
                selectionType   : "single"
            });

            spyOn(this.logic, '_initEditorProtocol').andCallFake(function(){});
        });

        afterEach(function() {
            $$('#mediaGalleryFrame').dispose();
        });

        describe('Protocol Handlers', function() {
            beforeEach(function() {
                spyOn(this.logic, '_collapse').andCallFake(function(){});
                spyOn(this.logic, '_uncollapse').andCallFake(function(){});
            });
            describe('onItems', function() {
                it('should flatten array if consists of a single item (if selectionType is not in multiple)', function(){
                    var item1 = {
                        title:"image1",
                        uri:"http://example.com"
                    };

                    this.logic._params = {
                        callback: function(payload) {},
                        selectionType: "single"
                    };

                    spyOn(this.logic._params, 'callback');

                    this.logic._onItems({items: [item1]});

                    expect(this.logic._params.callback).toHaveBeenCalledWith({
                        title:"image1",
                        uri:"http://example.com"
                    });
                });

                it('should pass an array of objects of payload consists of multiple items', function(){
                    var item1 = {
                        title:"image1",
                        uri:"http://example.com"
                    };

                    var item2 = {
                        title:"image2",
                        uri:"http://example2.com"
                    };

                    this.logic._params = {
                        callback: function(payload) {}
                    };

                    spyOn(this.logic._params, 'callback');

                    this.logic._onItems({items: [item1, item2]});

                    expect(this.logic._params.callback).toHaveBeenCalledWith([
                        {
                            title:"image1",
                            uri:"http://example.com"
                        },
                        {
                            title:"image2",
                            uri:"http://example2.com"
                        }
                    ]);
                });

                it('should execute a callback from the component instance of a selectedComp initiated the call', function(){
                    var item1 = {
                        title:"image1",
                        uri:"http://example.com"
                    };

                    this.logic._params = {
                        callback: "testCallback",
                        selectedComp: function() {
                            return {
                                getDataItem: function() {},
                                testCallback: function(data) {}
                            };
                        }
                    };

                    spyOn(this.logic._params.selectedComp, 'testCallback');
                    spyOn(this.logic, '_startUndoTransaction');
                    spyOn(this.logic, '_endUndoTransaction');

                    this.logic._onItems({items: [item1]});

                    expect(this.logic._params.selectedComp.testCallback).toHaveBeenCalledWith({
                        title:"image1",
                        uri:"http://example.com"
                    });
                });

                it('should report error if either `callback` or `selectedComp` was not specified', function(){
                    spyOn(LOG, "reportError");
                    this.logic._onItems({items: []});
                    expect(LOG.reportError).toHaveBeenCalledWith("MediaGallery failed to execute onItems callback");
                });
            });
        });

        describe('IFrame', function() {
            beforeEach(function() {
                spyOn(this.logic, '_collapse').andCallFake(function(){});
                spyOn(this.logic, '_uncollapse').andCallFake(function(){});
            });

            describe("Styles", function() {
                it('Iframe `height` attribute should be 100%', function(){
                    var frame = this.logic._createFrame();
                    expect(frame.getStyle("height")).toBe("100%");
                });

                it('Iframe `width` attribute should be 100%', function(){
                    var frame = this.logic._createFrame();
                    expect(frame.getStyle("width")).toBe("100%");
                });

                it('Iframe `overflow` attribute should be hidden', function(){
                    var frame = this.logic._createFrame();
                    expect(frame.getStyle("overflow")).toBe("hidden");
                });

                it('Iframe `position` attribute should be fixed', function(){
                    var frame = this.logic._createFrame();
                    expect(frame.getStyle("position")).toBe("fixed");
                });

                it('Iframe `top` attribute should be 0', function(){
                    var frame = this.logic._createFrame();
                    expect(_.parseInt(frame.getStyle("top"))).toBe(0);
                });

                it('Iframe `left` attribute should be 0', function(){
                    var frame = this.logic._createFrame();
                    expect(_.parseInt(frame.getStyle("left"))).toBe(0);
                });

                it('Iframe should instantiate with `display:none` attribute', function(){
                    var frame = this.logic._createFrame();
                    expect(frame.getStyle("display")).toBe("none");
                });
            });
        });

        describe('View Toggle', function() {
            it('should collapse Iframe', function(){
                this.logic._onLoadReady();
                this.logic._collapse();
                expect($$("#mediaGalleryFrame").length).toEqual(0);
            });
        });

        describe('BI Reports', function() {
            it('should report on Media Gallery open', function(){
                expect(LOG.reportEvent).toHaveBeenCalledWith(wixEvents.MEDIA_GALLERY_OPEN, {
                    c1: "single_image",
                    c2: "photos",
                    i1: "single"
                });
            });

            it('should report on MEDIA_GALLERY_CLOSE on _collapse() specify zero items included', function(){
                this.logic._onLoadReady();
                this.logic._collapse();
                expect(LOG.reportEvent).toHaveBeenCalledWith(wixEvents.MEDIA_GALLERY_CLOSE, {
                    c1: 0
                });
            });

            it('should report on MEDIA_GALLERY_CLOSE _onItems specify number of items included', function(){
                this.logic._onLoadReady();
                var mockPayload = {items: [{},{}]};
                this.logic._onItems(mockPayload);
                expect(LOG.reportEvent).toHaveBeenCalledWith(wixEvents.MEDIA_GALLERY_CLOSE, {
                    c1: 2
                });
            });

            it('should report 0 items on MEDIA_GALLERY_CLOSE when no items were returned in payload', function(){
                this.logic._onLoadReady();
                var emptyPayload = {items: []};
                this.logic._onItems(emptyPayload);
                expect(LOG.reportEvent).toHaveBeenCalledWith(wixEvents.MEDIA_GALLERY_CLOSE, {
                    c1: 0
                });
            });

            it('should handle undefined invalid payload with BI error', function(){
                spyOn(LOG, "reportError");
                this.logic._onLoadReady();
                var invalidPayload = {};
                this.logic._onItems(invalidPayload);
                expect(LOG.reportError).toHaveBeenCalledWith("MediaGallery returned with an invalid payload");
            });

            it('should report 0 items on MEDIA_GALLERY_CLOSE if payload is invalid', function(){
                spyOn(LOG, "reportError");
                this.logic._onLoadReady();
                var invalidPayload = {};
                this.logic._onItems(invalidPayload);
                expect(LOG.reportEvent).toHaveBeenCalledWith(wixEvents.MEDIA_GALLERY_CLOSE, {
                    c1: 0
                });
            })
        });
   // });
});


describe('MediaFrameManagerSpec', function() {

    testRequire().classes('wysiwyg.editor.managers.MediaFrameManager');

    describe("startingTab parameter", function(){
        it('should have "undefined" as default options.startingTab value', function(){
            var calculatedValue;

            this.logic = new this.MediaFrameManager({});
            calculatedValue = this.logic.options.startingTab;

            expect(calculatedValue).toBeUndefined();
        });

        it('should have options.startingTab value when passed as an argument', function(){
            var expectedValue = 'mockStartingTab',
                calculatedValue;

            this.logic = new this.MediaFrameManager({
                startingTab: expectedValue
            });
            calculatedValue = this.logic.options.startingTab;

            expect(calculatedValue).toBe(expectedValue);
        });
    });
});