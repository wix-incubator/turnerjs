describe( 'PinItPinWidget', function() {
    testRequire()
        .classes('core.managers.components.ComponentBuilder')
        .components('wysiwyg.common.components.pinitpinwidget.viewer.PinItPinWidget')
        .resources('W.Data', 'W.ComponentLifecycle', 'topology');


    function createComponent() {
        var that = this;
        this.componentLogic = null;
        this.mockData = this.W.Data.createDataItem({type: 'PinItPinWidget'});

        var builder = new this.ComponentBuilder(document.createElement('div'));
        builder
            .withType('wysiwyg.common.components.pinitpinwidget.viewer.PinItPinWidget')
            .withSkin('wysiwyg.common.components.pinitpinwidget.viewer.skins.PinItPinWidgetSkin')
            .withData(this.mockData)
            .onWixified(function (component) {
                that.componentLogic = component;
//                 that.componentLogic.data = component.getDataItem();
            })
            .create();
    }
beforeEach(function (){
    createComponent.call(this);

    waitsFor(function () {
        return this.componentLogic !== null;
    }, 'pinitpinwidget component to be ready', 1000);
});


describe('pinitpinwidget component test', function(){

    describe('Structure', function () {
        it('Skin parts should be defined', function () {
            expect(this.componentLogic._skinParts.iframe).toBeDefined();
        });
    });

    describe('Functionality', function(){
        var comp,
            dataItem,
            expected = true,
            actual = false;

        beforeEach(function(){
            comp = this.componentLogic;
            dataItem = comp.getDataItem();
        });

        describe('Viewer', function(){
            describe('Iframe size', function(){
                xit('should set iframe sizes accordingly to pin size', function(){
                    var iframe = comp._skinParts.iframe;
                    expected = {
                        width: 237,
                        height: 249
                    };
                    var respData = JSON.stringify({"topic":"resize","height":249,"width":237});
                    comp._postMessageCallback({"data":respData});
                    actual = {
                        width: parseInt(iframe.style.width),
                        height: parseInt(iframe.style.height)
                    };

                    expect(actual).toEqual(expected);
                });

                it('iframe size is 0 when pin id not exist', function(){
                    dataItem.set('pinId', '1');
                    comp._updateIframe();
                    expected = {
                        width: 0,
                        height: 0
                    };
                    var iframe = comp._skinParts.iframe;
                    actual = {
                        width: parseInt(iframe.style.width),
                        height: parseInt(iframe.style.height)
                    };
                    expect(actual).toEqual(expected);
                });

                it('iframe size is 0 after calling reset function', function(){
                    comp._resetIframeSize();
                    expected = {
                        width: 0,
                        height: 0
                    };
                    var iframe = comp._skinParts.iframe;
                    actual = {
                        width: parseInt(iframe.style.width),
                        height: parseInt(iframe.style.height)
                    };
                    expect(actual).toEqual(expected);
                });
            });

            describe('Data validation', function(){
                it('schema should have default pinId', function(){
                    expect(comp._hasPinId()).toBe(true);
                });

                it('is not valid when pinId field is not defined or empty', function(){
                    dataItem.set('pinId', '');
                    expect(comp._hasPinId()).toBe(false);
                });
            });

            describe('Data sending', function(){
                xit('should generate valid url for iframe', function(){
                    var baseUrl = comp.resources.topology.wysiwyg + "/html/external/pinterestWidget.html",
                        sets = {
                            "pinId": dataItem.get('pinId'),
                            "originDomain": window.location.origin
                        };
                    expected = baseUrl + '?' + Object.toQueryString(sets);

                    actual = comp._generateIframeUrl();

                    expect(actual).toEqual(expected);
                });

                it('iframe source is changed after changing pin id', function(){
                    var urlBefore = comp._skinParts.iframe.src;
                    dataItem.set('pinId', '1');
                    comp._changeIframeUrl();
                    actual = comp._skinParts.iframe.src;

                    expect(actual).not.toEqual(urlBefore);
                });


                xit('should change iframe src when the pin Id is changed', function(){
                    dataItem.set('pinId', '1');
                    var baseUrl = comp.resources.topology.wysiwyg + "/html/external/pinterestWidget.html";
                    var sets = {
                        "pinId": dataItem.get('pinId'),
                        "originDomain": window.location.origin
                    };
                    expected = baseUrl + '?' + Object.toQueryString(sets);


                    comp._changeIframeUrl();

                    expect(comp._skinParts.iframe.src).toEqual(expected);
                });


            });
        });
    });
});

});