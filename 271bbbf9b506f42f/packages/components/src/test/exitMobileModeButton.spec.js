define(['lodash', 'testUtils', 'siteUtils', 'components/components/exitMobileModeButton/exitMobileModeButton'], function (_, testUtils, siteUtils, exitMobileModeButton) {
    'use strict';

    var exitMobileModeButtonInstance;

    describe('exitMobileModeButton component', function () {
        beforeEach(function () {
            var props = testUtils.mockFactory.mockProps();
            props
                .setCompData({id: 'extMblDtId', label: 'gaga'})
                .setCompProp({id: 'extMblPrprtId', align: 'left', margin: 'right'})
                .setNodeStyle({width: '250px', height: '500px'})
                .addSiteData({full: 'http://fake/url'}, 'currentUrl')
                .setLayout({scale: '1.0'})
                .setSkin("wysiwyg.common.components.exitmobilemode.viewer.skins.ExitMobileModeSkin")
                .addSiteData(function () {
                    return true;
                }, 'isMobileView')
                .addSiteData(function () {
                    return {
                        font: ['normal normal normal 23px/1.4em arial+black,arial-w01-black,arial-w02-black,arial-w10 black,sans-serif ;'],
                        color: ['red']
                    };
                }, 'getGeneralTheme');
            props.structure.componentType = 'wysiwyg.common.components.exitmobilemode.viewer.ExitMobileMode';

            props.compTheme = {
                id: 'extMblStlId',
                style: {
                    properties: {
                        fnt: 'font_0'
                    }
                },
                skin: 'wysiwyg.common.components.exitmobilemode.viewer.skins.ExitMobileModeSkin'
            };

            spyOn(siteUtils.mobileUtils, 'convertFontSizeToMobile').and.callFake(function (desktopFontSize, scale) {
                var mobileFontSize = 15;
                return scale * Math.round(mobileFontSize);
            });

            exitMobileModeButtonInstance = testUtils.getComponentFromDefinition(exitMobileModeButton, props);
        });

        it('Should getLabelStyleProperties', function () {
            var skinProps = exitMobileModeButtonInstance.getSkinProperties();
            expect(skinProps.link).toBeDefined();
            expect(skinProps.label).toBeDefined();
        });

        it("image data should be defined", function () {
            var skinProps = exitMobileModeButtonInstance.getSkinProperties();

            expect(skinProps.link.href).toBe('http://fake/url');
            expect(skinProps.link.target).toBe('_self');
            expect(skinProps.link['data-mobile']).toBeFalsy();
            expect(skinProps.link.style).toEqual({'textAlign': 'left'});
        });

        it("linkSkinPart should be defined", function () {
            var skinProps = exitMobileModeButtonInstance.getSkinProperties();

            expect(skinProps.label.children).toEqual(['gaga']);
            expect(skinProps.label.style).toEqual({'marginLeft': 'right', 'fontSize': '15px'});
        });
    });
});
