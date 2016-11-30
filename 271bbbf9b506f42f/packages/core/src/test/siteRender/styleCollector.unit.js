define(['lodash', 'core/siteRender/styleCollector', 'testUtils'], function (_, styleCollector, testUtils) {
    'use strict';

    describe('styleCollector Tests', function () {
        function fakeStyle(styleId) {
            return {
                id: styleId,
                skin: 'wysiwyg.viewer.skins.photo.ScotchTapePhoto' //just need any real skin name
            };
        }

        beforeEach(function () {
            this.siteData = testUtils.mockFactory.mockSiteData()
                .addPageWithDefaults('mainPage')
                .addDesktopComps([{
                    id: 'comp1',
                    styleId: 'style1'
                }], 'mainPage')
                .addMobileComps([{
                    id: 'mobileComp',
                    styleId: 'style2'
                }], 'mainPage')
                .addDesktopComps([{
                    id: 'comp2',
                    styleId: 'style3',
                    modes: {
                        overrides: [
                            {
                                styleId: 'style4'
                            },
                            {
                                styleId: 'style5'
                            }
                        ]
                    }
                    
                }], 'mainPage')
                .addCompTheme([fakeStyle('style1'), fakeStyle('style2'), fakeStyle('style3'), fakeStyle('style4')]);
        });

        it('should collect all styles from the full json, including override styles', function () {
            var collectedStyles = {};
            styleCollector.collectStyleIdsFromFullStructure(this.siteData.getPageData('mainPage').structure, this.siteData.getAllTheme(), this.siteData, collectedStyles, 'mainPage', false);
            var expectedStyleIdsFromStructure = ['wysiwyg.viewer.skins.page.BasicPageSkin', 'style1', 'style3', 'style4'];
            expect(_.keys(collectedStyles)).toEqual(expectedStyleIdsFromStructure);
        });

        it('Should collect the styles from the desktop comps when requesting desktop styles, regardless of desktop/mobile view', function () {
            var collectedStyles = {};
            styleCollector.collectStyleIdsFromStructure(this.siteData.getPageData('mainPage').structure, this.siteData.getAllTheme(), this.siteData, collectedStyles, 'mainPage', false);
            var expectedStyleIdsFromStructure = ['wysiwyg.viewer.skins.page.BasicPageSkin', 'style1', 'style3'];
            expect(_.keys(collectedStyles)).toEqual(expectedStyleIdsFromStructure);
        });

        it('Should collect the styles from the mobile comps when requesting mobile styles, regardless of desktop/mobile view', function () {
            var collectedStyles = {};
            styleCollector.collectStyleIdsFromStructure(this.siteData.getPageData('mainPage').structure, this.siteData.getAllTheme(), this.siteData, collectedStyles, 'mainPage', true);
            var expectedStyleIdsFromStructure = ['wysiwyg.viewer.skins.page.BasicPageSkin', 'style2'];
            expect(_.keys(collectedStyles)).toEqual(expectedStyleIdsFromStructure);
        });
    });
});
