define([
    'lodash',
    'react',
    'utils',
    'testUtils',
    'wixappsCore/core/proxyFactory',
    'wixappsCore/proxies/mixins/baseProxy',
    'wixappsCore/proxies/mixins/zoomProxy'
], function (_, React, utils, testUtils, /** wixappsCore.proxyFactory */proxyFactory, baseProxy, zoomProxy) {
    'use strict';

    describe('zoomProxy', function () {

        var anchorProxy = {
            mixins: [baseProxy],
            renderProxy: function () {
                return React.DOM.a({href: 'http://barvaz.oger.com'});
            }
        };

        beforeEach(function () {
            proxyFactory.register('zoom', zoomProxy);
            proxyFactory.register('anchor', anchorProxy);
        });

        afterEach(function () {
            proxyFactory.invalidate('zoom');
            proxyFactory.invalidate('anchor');
        });

        it('should be able to render child that renders and cnhor element (i.e. <a></a>)', function () {
            var viewDef = {
                comp: {
                    'name': 'zoom',
                    items: [
                        {
                            comp: {
                                name: 'anchor'
                            }
                        }
                    ]
                }
            };

            var props = testUtils.proxyPropsBuilder(viewDef);

            var html = testUtils.proxyStringBuilder('zoom', props);

            var numberOfAnchorElements = 0;
            utils.htmlParser(html, {
                start: function (tagName) {
                    if (tagName === 'a') {
                        // If numberOfAnchorElements is bigger then 0 it means that there is 'a' element that is descendant of other 'a' element.
                        expect(numberOfAnchorElements).toEqual(0);
                        numberOfAnchorElements++;
                    }
                },
                end: function (tagName) {
                    if (tagName === 'a') {
                        numberOfAnchorElements--;
                    }
                }
            });
        });
    });
});
