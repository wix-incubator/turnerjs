define([
    'zepto',
    'documentServices/tpa/services/tpaWidgetLayoutService',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/constants/constants'], function ($, tpaWidgetLayoutService, privateServicesHelper, constants) {
    'use strict';

    describe('getCompLayoutFrom', function () {
        var pageLayout = {
            width: 980,
            height: 700,
            y: 0
        };
        var headerLayout = {
            width: 100,
            height: 200
        };
        var footerLayout = {
            width: 100,
            height: 200
        };
        var mockPs = {};
        beforeEach(function(){
            var siteData = privateServicesHelper.getSiteDataWithPages({
                masterPage: {
                    components: [
                        {id: constants.COMP_IDS.PAGES_CONTAINER, layout: pageLayout},
                        {id: constants.COMP_IDS.HEADER, layout: headerLayout},
                        {id: constants.COMP_IDS.FOOTER, layout: footerLayout}
                    ]
                }
            });
            mockPs = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

        });


        it('should return the optionsLayout if one is given', function () {
            var layout = {
                width: 10,
                height: 10
            };
            var optionsLayout = {
                width: 20,
                height: 20,
                x: 111,
                y: 222
            };

            var widgetLayout = tpaWidgetLayoutService.getCompLayoutFrom(mockPs, layout, optionsLayout);

            expect(widgetLayout).toEqual({
                width: optionsLayout.width,
                height: optionsLayout.height,
                x: optionsLayout.x,
                y: optionsLayout.y
            });
        });

        it('should return the optionsLayout with 0 values', function () {
            var layout = {
                width: 10,
                height: 10
            };
            var optionsLayout = {
                width: 0,
                height: 0,
                x: 0,
                y: 0
            };

            var widgetLayout = tpaWidgetLayoutService.getCompLayoutFrom(mockPs, layout, optionsLayout);

            expect(widgetLayout).toEqual({
                width: optionsLayout.width,
                height: optionsLayout.height,
                x: optionsLayout.x,
                y: optionsLayout.y
            });
        });

        it('should handle string x and y', function () {
            var layout = {
                width: 10,
                height: 10
            };
            var optionsLayout = {
                width: 20,
                height: 20,
                x: '111',
                y: '222'
            };

            var widgetLayout = tpaWidgetLayoutService.getCompLayoutFrom(mockPs, layout, optionsLayout);

            expect(widgetLayout).toEqual({
                width: optionsLayout.width,
                height: optionsLayout.height,
                x: 111,
                y: 222
            });
        });

        it('should position the comp in the center when defaultPosition is not provided', function () {
            var layout = {
                width: 10,
                height: 10
            };
            spyOn($.fn, 'height').and.returnValue(800);
            spyOn($.fn, 'scrollTop').and.returnValue(200);
            var widgetLayout = tpaWidgetLayoutService.getCompLayoutFrom(mockPs, layout);
            expect(widgetLayout).toContain({
                width: layout.width,
                height: layout.height,
                x: pageLayout.width / 2 - layout.width / 2,
                y: 400 - layout.height / 2 + 200
            });
        });

        describe('header', function () {
            var layout;

            it('should position the comp in the left corner', function () {
                layout = {
                    defaultPosition: {
                        region: 'header',
                        placement: 'LEFT'
                    },
                    width: 10,
                    height: 10
                };
                var widgetLayout = tpaWidgetLayoutService.getCompLayoutFrom(mockPs, layout);
                expect(widgetLayout).toContain({
                    width: layout.width,
                    height: layout.height,
                    x: 0,
                    y: headerLayout.height / 2 - layout.height / 2
                });
            });

            it('should position the comp in the RIGHT corner', function () {
                layout = {
                    defaultPosition: {
                        region: 'header',
                        placement: 'RIGHT'
                    },
                    width: 10,
                    height: 10
                };
                var widgetLayout = tpaWidgetLayoutService.getCompLayoutFrom(mockPs, layout);
                expect(widgetLayout).toContain({
                    width: layout.width,
                    height: layout.height,
                    x: headerLayout.width - layout.width,
                    y: headerLayout.height / 2 - layout.height / 2
                });
            });

            it('should position the comp in the center', function () {
                layout = {
                    defaultPosition: {
                        region: 'header',
                        placement: 'CENTER'
                    },
                    width: 10,
                    height: 10
                };
                var widgetLayout = tpaWidgetLayoutService.getCompLayoutFrom(mockPs, layout);
                expect(widgetLayout).toContain({
                    width: layout.width,
                    height: layout.height,
                    x: headerLayout.width / 2 - layout.width / 2,
                    y: headerLayout.height / 2 - layout.height / 2
                });
            });
        });

        describe('footer', function () {
            var layout;

            it('should position the comp in the left corner', function () {
                layout = {
                    defaultPosition: {
                        region: 'footer',
                        placement: 'LEFT'
                    },
                    width: 10,
                    height: 10
                };

                var widgetLayout = tpaWidgetLayoutService.getCompLayoutFrom(mockPs, layout);
                expect(widgetLayout).toContain({
                    width: layout.width,
                    height: layout.height,
                    x: 0,
                    y: pageLayout.height + footerLayout.height / 2 - layout.height / 2
                });
            });

            it('should position the comp in the RIGHT corner', function () {
                layout = {
                    defaultPosition: {
                        region: 'footer',
                        placement: 'RIGHT'
                    },
                    width: 10,
                    height: 10
                };
                var widgetLayout = tpaWidgetLayoutService.getCompLayoutFrom(mockPs, layout);
                expect(widgetLayout).toContain({
                    width: layout.width,
                    height: layout.height,
                    x: footerLayout.width - layout.width,
                    y: pageLayout.height + footerLayout.height / 2 - layout.height / 2
                });
            });

            it('should position the comp in the center', function () {
                layout = {
                    defaultPosition: {
                        region: 'footer',
                        placement: 'CENTER'
                    },
                    width: 10,
                    height: 10
                };
                var widgetLayout = tpaWidgetLayoutService.getCompLayoutFrom(mockPs, layout);
                expect(widgetLayout).toContain({
                    width: layout.width,
                    height: layout.height,
                    x: footerLayout.width / 2 - layout.width / 2,
                    y: pageLayout.height + footerLayout.height / 2 - layout.height / 2
                });
            });
        });

        describe('pageContainer', function () {
            var layout;
            it('should position the comp in the top left corner', function () {
                layout = {
                    defaultPosition: {
                        region: 'pageContainer',
                        placement: 'TOP_LEFT'
                    },
                    width: 10,
                    height: 10
                };
                var widgetLayout = tpaWidgetLayoutService.getCompLayoutFrom(mockPs, layout);
                expect(widgetLayout).toContain({
                    width: layout.width,
                    height: layout.height,
                    x: 0,
                    y: 0
                });
            });

            it('should position the comp in the top center corner', function () {
                layout = {
                    defaultPosition: {
                        region: 'pageContainer',
                        placement: 'TOP_CENTER'
                    },
                    width: 10,
                    height: 10
                };
                var widgetLayout = tpaWidgetLayoutService.getCompLayoutFrom(mockPs, layout);
                expect(widgetLayout).toContain({
                    width: layout.width,
                    height: layout.height,
                    x: pageLayout.width / 2 - layout.width / 2,
                    y: 0
                });
            });

            it('should position the comp in the top right corner', function () {
                layout = {
                    defaultPosition: {
                        region: 'pageContainer',
                        placement: 'TOP_RIGHT'
                    },
                    width: 10,
                    height: 10
                };
                var widgetLayout = tpaWidgetLayoutService.getCompLayoutFrom(mockPs, layout);
                expect(widgetLayout).toContain({
                    width: layout.width,
                    height: layout.height,
                    x: pageLayout.width - layout.width,
                    y: 0
                });
            });

            it('should position the comp in the center left corner', function () {
                layout = {
                    defaultPosition: {
                        region: 'pageContainer',
                        placement: 'CENTER_LEFT'
                    },
                    width: 10,
                    height: 10
                };

                spyOn($.fn, 'height').and.returnValue(800);
                spyOn($.fn, 'scrollTop').and.returnValue(200);
                var widgetLayout = tpaWidgetLayoutService.getCompLayoutFrom(mockPs, layout);
                expect(widgetLayout).toContain({
                    width: layout.width,
                    height: layout.height,
                    x: 0,
                    y: 400 - layout.height / 2 + 200
                });
            });

            it('should position the comp in the center center corner', function () {
                layout = {
                    defaultPosition: {
                        region: 'pageContainer',
                        placement: 'CENTER_CENTER'
                    },
                    width: 10,
                    height: 10
                };
                spyOn($.fn, 'height').and.returnValue(800);
                spyOn($.fn, 'scrollTop').and.returnValue(200);
                var widgetLayout = tpaWidgetLayoutService.getCompLayoutFrom(mockPs, layout);
                expect(widgetLayout).toContain({
                    width: layout.width,
                    height: layout.height,
                    x: pageLayout.width / 2 - layout.width / 2,
                    y: 400 - layout.height / 2 + 200
                });
            });

            it('should position the comp in the center right corner', function () {
                layout = {
                    defaultPosition: {
                        region: 'pageContainer',
                        placement: 'CENTER_RIGHT'
                    },
                    width: 10,
                    height: 10
                };
                spyOn($.fn, 'height').and.returnValue(800);
                spyOn($.fn, 'scrollTop').and.returnValue(200);

                var widgetLayout = tpaWidgetLayoutService.getCompLayoutFrom(mockPs, layout);
                expect(widgetLayout).toContain({
                    width: layout.width,
                    height: layout.height,
                    x: pageLayout.width - layout.width,
                    y: 400 - layout.height / 2 + 200
                });
            });

            it('should position the comp in the bottom left corner', function () {
                layout = {
                    defaultPosition: {
                        region: 'pageContainer',
                        placement: 'BOTTOM_LEFT'
                    },
                    width: 10,
                    height: 10
                };
                var widgetLayout = tpaWidgetLayoutService.getCompLayoutFrom(mockPs, layout);
                expect(widgetLayout).toContain({
                    width: layout.width,
                    height: layout.height,
                    x: 0,
                    y: pageLayout.height - layout.height
                });
            });

            it('should position the comp in the bottom center corner', function () {
                layout = {
                    defaultPosition: {
                        region: 'pageContainer',
                        placement: 'BOTTOM_CENTER'
                    },
                    width: 10,
                    height: 10
                };
                var widgetLayout = tpaWidgetLayoutService.getCompLayoutFrom(mockPs, layout);
                expect(widgetLayout).toContain({
                    width: layout.width,
                    height: layout.height,
                    x: pageLayout.width / 2 - layout.width / 2,
                    y: pageLayout.height - layout.height
                });
            });

            it('should position the comp in the bottom right corner', function () {
                layout = {
                    defaultPosition: {
                        region: 'pageContainer',
                        placement: 'BOTTOM_RIGHT'
                    },
                    width: 10,
                    height: 10
                };
                var widgetLayout = tpaWidgetLayoutService.getCompLayoutFrom(mockPs, layout);
                expect(widgetLayout).toContain({
                    width: layout.width,
                    height: layout.height,
                    x: pageLayout.width - layout.width,
                    y: pageLayout.height - layout.height
                });
            });
        });
    });

});
