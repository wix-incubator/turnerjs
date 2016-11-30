define(['wixappsClassics/util/componentTypeUtil'], function (componentTypeUtil) {

    'use strict';


    describe('componentTypeUtil', function () {

        describe('getComponentTypeByProxyName', function () {

            function expectComponentType(proxyName, expectedComponentType) {
                expect(componentTypeUtil.getComponentTypeByProxyName(proxyName)).toBe(expectedComponentType);
            }

            it('should be "wysiwyg.viewer.components.WPhoto" if called with "Image"', function () {
                expectComponentType('Image', 'wysiwyg.viewer.components.WPhoto');
            });


            it('should be "wysiwyg.viewer.components.Video" if called with "Video"', function () {
                expectComponentType('Video', 'wysiwyg.viewer.components.Video');
            });


            it('should be "wysiwyg.viewer.components.SiteButton" if called with "Button2"', function () {
                expectComponentType('Button2', 'wysiwyg.viewer.components.SiteButton');
            });


            it('should be "wysiwyg.viewer.components.WRichText" if called with "Label"', function () {
                expectComponentType('Label', 'wysiwyg.viewer.components.WRichText');
            });


            it('should be "wysiwyg.viewer.components.FiveGridLine" if called with "HorizontalLine"', function () {
                expectComponentType('HorizontalLine', 'wysiwyg.viewer.components.FiveGridLine');
            });


            it('should be "mobile.core.components.Container" if called with "Container"', function () {
                expectComponentType('Container', 'mobile.core.components.Container');
            });


            it('should be "wysiwyg.viewer.components.WRichText" if called with "ClippedParagraph2"', function () {
                expectComponentType('ClippedParagraph2', 'wysiwyg.viewer.components.WRichText');
            });


            it('should be undefined if called with "UnknownType"', function () {
                expectComponentType('UnknownType', undefined);
            });


            it('should be undefined if called with no arguments', function () {
                expectComponentType(undefined, undefined);
            });

        });

    });

});