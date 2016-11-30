define(['testUtils', 'core'], function (/** testUtils */ testUtils, /** core */ core) {
    'use strict';

    describe('PinterestWidgetPostMessageAspect tests', function () {

        var PinterestWidgetAspect;
        beforeEach(function (done) {
            var PinterestWidgetAspectConstructor = core.siteAspectsRegistry.getSiteAspectConstructor('PinterestWidgetPostMessageAspect'),
                self = this;

            testUtils.mockModules(['siteUtils/core/SiteData', 'core/siteRender/SiteAspectsSiteAPI'], {
                'core/siteRender/SiteAspectsSiteAPI': {
                    registerToComponentDidMount: function (func) {
                        func();
                    }
                }
            }, function (SiteData, SiteAPI) {
                self.siteAPI = new SiteAPI();
                self.siteAPI.getSiteData = function () {
                    SiteData = {
                        serverAndClientRender: false,
                        santaBase: 'someSource'
                    };
                    return SiteData;
                };

                PinterestWidgetAspect = new PinterestWidgetAspectConstructor(self.siteAPI);
                done();
            });

            this.comp = {
                props: {
                    id: '1234'
                },
                style: {
                    height: 772,
                    width: 280
                }
            };
        });

        describe('getIframeDimensions', function () {
            it('Should return iframe height according to component id', function () {
                var actualHeight,
                    actualWidth;
                PinterestWidgetAspect.dimensions = {
                    '1234': {
                        width: 237,
                        height: 377
                    }
                };

                actualHeight = PinterestWidgetAspect.getIframeDimensions(this.comp.props.id).height;
                actualWidth = PinterestWidgetAspect.getIframeDimensions(this.comp.props.id).width;

                expect(actualHeight).toEqual(377);
                expect(actualWidth).toEqual(237);
            });
        });

        describe('handlePostMessage', function () {
            it('Should set height from data.height', function () {
                var actualHeight,
                    actualWidth,
                    mockEvent = {
                        data: '{"height": 377, "width": 237, "compId": "1234"}'
                    };

                PinterestWidgetAspect.dimensions = {
                    '1234': {
                        width: 237,
                        height: 377
                    }
                };
                spyOn(this.siteAPI, 'forceUpdate').and.callFake(function () {
                    return;
                });

                PinterestWidgetAspect.handlePostMessage(mockEvent);
                actualHeight = PinterestWidgetAspect.getIframeDimensions(this.comp.props.id).height;
                actualWidth = PinterestWidgetAspect.getIframeDimensions(this.comp.props.id).width;

                expect(actualHeight).not.toEqual(this.comp.style.height);
                expect(actualWidth).not.toEqual(this.comp.style.width);
                expect(actualHeight).toEqual(377);
                expect(actualWidth).toEqual(237);
            });
        });
    });
});
