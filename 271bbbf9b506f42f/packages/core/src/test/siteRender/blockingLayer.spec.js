define(['lodash', 'react', 'core/siteRender/blockingLayer'], function (_, React, blockingLayerClass) {
    'use strict';

    var TestUtils = React.addons.TestUtils;

    describe('blocking layer', function () {
        var blockingLayerEl, blockingLayerComp, siteData;
        var zIndex = Math.pow(2, 31) - 2; //NOTE: z-index.scss

        beforeEach(function () {
            siteData = {
                renderFlags: {
                    blockingLayer: {}
                }
            };
            blockingLayerEl = React.createElement(blockingLayerClass, {siteData: siteData});
            blockingLayerComp = TestUtils.renderIntoDocument(blockingLayerEl);
        });

        it('should merge style from site data', function () {
            siteData.renderFlags.blockingLayer = {backgroundColor: 'red'};
            var expectedStyle = {
                display: 'inline-block',
                width: '100vw',
                height: '100vh',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: zIndex,
                backgroundColor: 'red'
            };
            expect(blockingLayerComp.getStyle()).toEqual(expectedStyle);
        });

        it('should merge style from site data also if style is null', function () {
            siteData.renderFlags.blockingLayer = null;
            var expectedStyle = {
                display: 'inline-block',
                width: '100vw',
                height: '100vh',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: zIndex
            };
            expect(blockingLayerComp.getStyle()).toEqual(expectedStyle);
        });
    });
});
