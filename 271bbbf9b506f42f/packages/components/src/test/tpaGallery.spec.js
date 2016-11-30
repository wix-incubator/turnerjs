define(['testUtils', 'lodash', 'components/components/galleries/accordion'], function (testUtils, _, accordion) {
    'use strict';

    describe('TPA Gallery Component', function () {
        var mockTpaPostMessageAspect = {
            sendPostMessage: function () {
            }
        };

        var mockImageItems;
        var theme_data;

        function createMockGalleryComponent() {
            var props = testUtils.mockFactory.mockProps();
            var mockData = props.siteData.mock;
            mockImageItems = [mockData.imageData()];
            props.setCompData(mockData.imageList({items: mockImageItems}))
                .setCompProp({
                    mockProp1: 'mockProp1'
                }).setThemeStyle({
                    style: {
                        properties: {
                            'alpha-color1': "1",
                            'alpha-color2': "0.7",
                            'alpha-color3': "0.6",
                            color1: 'color_11',
                            color2: 'color_12',
                            color3: 'color_13',
                            color4: 'color_14'
                        }
                    },
                    id: 'mockStyleId'
                });
            props.structure.componentType = 'wysiwyg.viewer.components.tpapps.TPA3DGallery';
            props.siteData.getExternalBaseUrl = function () {
                return 'http://externalBaseUrl/';
            };
            props.siteAPI.registerMockSiteAspect('tpaPostMessageAspect', mockTpaPostMessageAspect);


            theme_data = {
                THEME_DATA: {
                    color: {
                        11: '1,2,3',
                        12: '1,2,3',
                        13: '1,2,3',
                        14: '1,2,3'
                    }
                },
                mockStyleId: {
                    style: {
                        properties: {
                            "alpha-color1": "1",
                            "alpha-color2": "0.7",
                            "alpha-color3": "0.6",
                            "color1": "color_11",
                            "color2": "color_12",
                            "color3": "color_13",
                            "color4": 'color_14'
                        }
                    }
                },
                styleId: {
                    style: {
                        properties: {
                            "alpha-color1": "1",
                            "alpha-color2": "0.7",
                            "alpha-color3": "0.6",
                            "color1": "color_11",
                            "color2": "color_12",
                            "color3": "color_13",
                            "color4": 'color_14'
                        }
                    }
                }
            };

            props.siteData.getGeneralTheme = function() {
              return theme_data.THEME_DATA;
            };

            props.siteData.getAllTheme = function() {
                return theme_data;
            };

            return testUtils.getComponentFromDefinition(accordion, props);
        }

        beforeEach(function () {
            this.gallery = createMockGalleryComponent();
            this.gallery.buildUrl = jasmine.createSpy('buildUrl');
            this.gallery.lastRenderedStyleData = {
                "alpha-color1": "1",
                "alpha-color2": "0.7",
                "alpha-color3": "0.6",
                "color1": "color_11",
                "color2": "color_12",
                "color3": "color_13",
                "color4": 'color_14'
            };
            spyOn(this.gallery, 'getGalleryType').and.returnValue('TheGalleryMockType');
        });

        describe('Component definition', function () {

            it('component should be defined', function () {
                expect(this.gallery).toBeDefined();
            });

            it('should start with isAlive state set to false', function () {
                expect(this.gallery.isAlive).toBeFalsy();
            });

        });

        describe('Testing message props patcher', function () {

            it('Should call patchMessageProps', function () {

                this.gallery.patchMessageProps = jasmine.createSpy('patchMessageProps');

                this.gallery.setAppIsAlive();
                this.gallery.setComponentInIframeReady();

                this.gallery.sendIframeMessage();

                expect(this.gallery.patchMessageProps).toHaveBeenCalled();
            });
        });

        describe('Component skin properties', function () {

            it('should have correct iframe url', function () {
                // in default debub mode is set to true.
                this.gallery.getSkinProperties();
                expect(this.gallery.buildUrl).toHaveBeenCalledWith('/galleries/src/TheGalleryMockType/TheGalleryMockType.html', ['compId', 'deviceType', 'locale', 'viewMode']);

                this.gallery.props.siteData.isDebugMode.and.returnValue(false);
                this.gallery.getSkinProperties();
                expect(this.gallery.buildUrl).toHaveBeenCalledWith('/galleries/target/TheGalleryMockType/TheGalleryMockType.html', ['compId', 'deviceType', 'locale', 'viewMode']);
            });

        });

        describe('shouldRenderIframe', function(){
            it('should NOT render iframe if new images data is equal to old images data', function() {
                var newProps = _.clone(this.gallery.props);
                expect(this.gallery.shouldRenderIframe(newProps)).toBeFalsy();
            });

            it('should render iframe if new image data is different from old one', function() {
                var newProps = _.clone(this.gallery.props);
                newProps.compData.items = [];
                expect(this.gallery.shouldRenderIframe(newProps)).toBeTruthy();
            });

            it('should render iframe if global quality has changed', function() {
                var newProps = _.clone(this.gallery.props);

                spyOn(this.gallery.props.siteData, 'getGlobalImageQuality').and.returnValue({
                    quality: 80,
                    unsharpMask: {}
                });

                expect(this.gallery.shouldRenderIframe(newProps)).toBeTruthy();
            });

            it('should NOT render iframe if global quality did not change either image quality', function() {
                var newProps = _.clone(this.gallery.props);

                spyOn(this.gallery.props.siteData, 'getGlobalImageQuality').and.returnValue({});

                expect(this.gallery.shouldRenderIframe(newProps)).toBeFalsy();
            });

            it('should NOT render iframe if global quality is not present but image quality was changed', function() {
                var newProps = _.clone(this.gallery.props);

                newProps.compData.items[0].quality = {quality: 80, unsharpMask:{}};
                spyOn(this.gallery.props.siteData, 'getGlobalImageQuality').and.returnValue({});

                expect(this.gallery.shouldRenderIframe(newProps)).toBeTruthy();
            });
        });

        describe('Iframe interaction', function () {

            function validateExpectedMessage(sendPostMessage, gallery, expectedMessage) {
                var messageArgs = sendPostMessage.calls.mostRecent().args;
                expect(messageArgs[0]).toBe(gallery);
                expect(messageArgs[1]).toEqual(expectedMessage);
                expect(messageArgs.length).toEqual(2);
            }

            it('should send correct message to iframe', function () {
                var expectedMessage = {params: {
                        mainPageId: this.gallery.props.siteData.getMainPageId(),
                        props: {mockProp1: 'mockProp1', textColor: '#010203', alphaTextColor: '1', descriptionColor: '#010203', alphaDescriptionColor: '0.7', textBackgroundColor: '#010203', alphaTextBackgroundColor: '0.6', borderColor: '#010203'},
                        items: mockImageItems,
                        quality: {},
                        marketingLandingPage: false
                        },
                        eventType: 'SETTINGS_UPDATED', intent: 'addEventListener'},
                    sendPostMessage = spyOn(mockTpaPostMessageAspect, 'sendPostMessage');

                this.gallery.getSkinProperties();
                this.gallery.setAppIsAlive();
                this.gallery.setComponentInIframeReady();
                this.gallery.getSkinProperties();

                validateExpectedMessage(sendPostMessage, this.gallery, expectedMessage);
            });

            it('should open correct url when clicking on an image', function () {
                var actualPageInfo = {};
                spyOn(this.gallery.props.siteAPI, 'navigateToPage').and.callFake(function (pageInfo) {
                    actualPageInfo = pageInfo;
                });
                this.gallery.processImageClick({args: [0]});

                expect(actualPageInfo.title).toBe('My mock image title');
                expect(actualPageInfo.imageZoom).toBe(true);
                expect(actualPageInfo.pageId).toBe('currentPage');
                expect(actualPageInfo.pageItemId).toBe(mockImageItems[0].id);
                expect(actualPageInfo.pageItemAdditionalData).toBe("galleryId:" + this.gallery.props.compData.id);
            });

            it('should send an EDIT_MODE_CHANGE message with "editor" editMode ≈when isPlayingAllowed changes to false', function () {
                this.gallery.props.siteData.renderFlags.isPlayingAllowed = false;
                var expectedMessage = {
                    params: {
                        editMode: 'editor'
                    },
                    eventType: 'EDIT_MODE_CHANGE',
                    intent: 'addEventListener'
                };
                var sendPostMessage = spyOn(mockTpaPostMessageAspect, 'sendPostMessage');
                this.gallery.setAppIsAlive();
                this.gallery.setComponentInIframeReady();

                this.gallery.componentWillReceiveProps(_.merge({}, this.gallery.props, {compData: {}, style: {}, structure: {styleId: 'styleId'}}));

                validateExpectedMessage(sendPostMessage, this.gallery, expectedMessage);
            });

            it('should send an EDIT_MODE_CHANGE message with "site" editMode when isPlayingAllowed changes to true', function () {
                this.gallery.props.siteData.renderFlags.isPlayingAllowed = true;
                var expectedMessage = {
                    params: {
                        editMode: 'site'
                    },
                    eventType: 'EDIT_MODE_CHANGE',
                    intent: 'addEventListener'
                };
                var sendPostMessage = spyOn(mockTpaPostMessageAspect, 'sendPostMessage');
                this.gallery.setAppIsAlive();
                this.gallery.setComponentInIframeReady();

                this.gallery.componentWillReceiveProps(_.merge({}, this.gallery.props, {compData: {}, style: {}, structure: {styleId: 'styleId'}}));

                validateExpectedMessage(sendPostMessage, this.gallery, expectedMessage);
            });
        });
    });

});
