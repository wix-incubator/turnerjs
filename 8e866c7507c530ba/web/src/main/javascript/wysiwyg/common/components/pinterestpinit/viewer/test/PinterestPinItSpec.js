describe('PinterestPinIt', function () {
    testRequire()
        .classes('core.managers.components.ComponentBuilder')
        .components('wysiwyg.common.components.pinterestpinit.viewer.PinterestPinIt')
        .resources('W.Data', 'W.ComponentLifecycle', 'topology');

    function createComponent() {
        var that = this,
            builder;
        this.comp = null;
        this.mockData = this.W.Data.createDataItem({
            id: 'dummyData',
            type: 'PinterestPinIt',
            uri: 'cbe56562e31c4b73ebd02449b9f115c0.png'
        });
        this.mockProps = this.W.Data.createDataItem({
            id: 'dummyData',
            type: 'PinterestPinItProperties'
        });

        builder = new this.ComponentBuilder(document.createElement('div'));
        builder
            .withType('wysiwyg.common.components.pinterestpinit.viewer.PinterestPinIt')
            .withSkin('wysiwyg.common.components.pinterestpinit.viewer.skins.PinterestPinItSkin')
            .withData(this.mockData)
            .onWixified(function (component) {
                that.comp = component;
                that.comp.setComponentProperties(that.mockProps);
            })
            .create();
    }

    beforeEach(function () {
        createComponent.call(this);

        waitsFor(function () {
            return this.comp !== null;
        }, 'PinterestPinIt component to be ready', 1000);
    });

    describe('PinterestPinIt component test', function () {

        describe('Structure', function () {
            it('Skin parts should be defined', function () {
                expect(this.comp._skinParts.iframe).toBeDefined();
            });
        });

        describe('Functionality', function () {
            var comp,
                dataItem,
                propsItem,
                expected = true,
                actual = false;

            beforeEach(function () {
                comp = this.comp;
                dataItem = comp.getDataItem();
                propsItem = comp.getComponentProperties();
                dataItem.setFields({
                    uri: 'bla.jpg',
                    description: 'description'
                });
            });

            describe('Viewer', function () {
                describe('Iframe size', function () {
                    it('should set iframe sizes accordingly to the component settings', function () {
                        this.ComponentLifecycle["@testRenderNow"](comp);
                        var iframe = comp._skinParts.iframe,
                            counterPosition = propsItem.get('counterPosition'),
                            buttonSize = propsItem.get('size');
                        expected = {
                            width: comp._pinButtonSizes[counterPosition][buttonSize].width,
                            height: comp._pinButtonSizes[counterPosition][buttonSize].height
                        };

                        actual = {
                            width: parseInt(iframe.width, 10),
                            height: parseInt(iframe.height, 10)
                        };

                        expect(actual).toEqual(expected);
                    });
                });

                describe('Data validation', function () {
                    it('is valid when all fields are defined and not empty', function () {
                        expect(comp._haveRequiredData()).toBe(true);
                    });

                    it('is not valid when "uri" field is not defined or empty', function () {
                        dataItem.set('uri', '');

                        expect(comp._haveRequiredData()).toBe(false);
                    });

                    it('is not valid when "description" field is not defined or empty', function () {
                        dataItem.set('description', '');

                        expect(comp._haveRequiredData()).toBe(false);
                    });
                });

                describe('Data sending', function () {
                    it('should return a valid image url with a protocol, when the uri contains a protocol', function () {
                        var expectedUrl = 'http://someFakeUri',
                            actualUrl;

                        spyOn(comp._imgUtils, 'getImageAbsoluteUrlFromRelativeUrl').andCallFake(function () {
                            return expectedUrl;
                        });

                        actualUrl = comp._getImageUrl();

                        expect(actualUrl).toEqual(expectedUrl);
                    });

                    it('addProtocolIfMissing should return a valid image url with a protocol, when the given url starts with double slash', function () {
                        var mockUrl = '//someFakeUriWithoutProtocol',
                            expectedUrl = 'http:' + mockUrl,
                            actualUrl;

                        actualUrl = comp.addProtocolIfMissing(mockUrl);

                        expect(actualUrl).toEqual(expectedUrl);
                    });

                    it('addProtocolIfMissing should return a valid image url with a protocol, when the given url doesnt have a protocol', function () {
                        var mockUrl = 'someFakeUriWithoutProtocol',
                            expectedUrl = 'http://' + mockUrl,
                            actualUrl;

                        actualUrl = comp.addProtocolIfMissing(mockUrl);

                        expect(actualUrl).toEqual(expectedUrl);
                    });

                    it('should generate valid url for iframe if there is required data', function () {
                        var baseUrl = comp.resources.topology.wysiwyg + "/html/external/pinterestpin.html",
                            size = propsItem.get('size'),
                            sets = {
                                media: comp._getImageUrl(),
                                url: comp._getSiteUrl(),
                                description: dataItem.get('description'),
                                'data-pin-config': propsItem.get('counterPosition'),
                                'data-pin-color': propsItem.get('color'),
                                'data-pin-height': comp._pinButtonSizes.none[size].height
                            };
                        expected = baseUrl + '?' + Object.toQueryString(sets);

                        actual = comp._generateIframeUrl(comp._haveRequiredData());

                        expect(actual).toEqual(expected);
                    });

                    it('should generate valid url for iframe if there is NO required data', function () {
                        var baseUrl = comp.resources.topology.wysiwyg + "/html/external/pinterestpin.html",
                            imagePath = 'pinterestPinIt/pinterest_disabled.png',
                            sets = {
                                gagPath: W.Theme.getProperty('WEB_THEME_DIRECTORY') + imagePath
                            };
                        expected = baseUrl + '?' + Object.toQueryString(sets);

                        dataItem.set('description', '');
                        actual = comp._generateIframeUrl(comp._haveRequiredData());

                        expect(actual).toEqual(expected);
                    });
                });
            });
        });
    });

});