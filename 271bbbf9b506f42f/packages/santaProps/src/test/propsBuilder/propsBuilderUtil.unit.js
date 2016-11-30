define(['testUtils', 'santaProps/propsBuilder/propsBuilderUtil'], function(testUtils, propsBuilderUtil) {
    'use strict';

    describe('propsbuilderUtil', function () {

        describe('getStyle', function() {

            it('Should convert x,y to left,top', function() {
                var siteAPI = testUtils.mockFactory.mockSiteAPI();
                var structure = {
                    layout: {
                        x: 100,
                        y: 100
                    }
                };

                expect(propsBuilderUtil.getStyle(structure.layout, siteAPI)).toContain({
                    top: 100,
                    left: 100
                });
            });

            it('should keep component dimensions between min and max bounds', function() {
                var siteAPI = testUtils.mockFactory.mockSiteAPI();
                var structure = {
                    layout: {
                        height: 2,
                        width: 2
                    }
                };

                expect(propsBuilderUtil.getStyle(structure.layout, siteAPI)).toContain({
                    width: 5,
                    height: 5
                });
            });
        });

        describe('getCompProp - using runtimeDal data', function () {
            xit('should return runtime overrides when component does not have property query', function () {
                var testCompId = 'testComp';
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults('testPage', [{
                        id: testCompId,
                        componentType: 'wysiwyg.viewer.components.SiteButton'
                    }])
                    .setCurrentPage('testPage');
                var siteAPI = testUtils.mockFactory.mockSiteAPI(siteData);
                siteAPI.getRuntimeDal().setCompProps(testCompId, {
                    isHidden: true
                });

                var compProps = propsBuilderUtil.getCompProp(siteAPI, testCompId, null, 'testPage');

                expect(compProps).toEqual({
                    isHidden: true
                });
            });

            it('should merge props with runtime overrides when component does not has props', function () {
                var testCompId = 'testComp';
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults('testPage', [{
                        id: testCompId,
                        componentType: 'wysiwyg.viewer.components.SiteButton',
                        propertyQuery: '#testData'
                    }])
                    .addProperties({
                        id: 'testData',
                        myProp: 'value'
                    }, 'testPage')
                    .setCurrentPage('testPage');
                var siteAPI = testUtils.mockFactory.mockSiteAPI(siteData);
                siteAPI.getRuntimeDal().setCompProps(testCompId, {
                    isHidden: true
                });

                var compProps = propsBuilderUtil.getCompProp(siteAPI, testCompId, 'testData', 'testPage');

                expect(compProps).toEqual({
                    id: 'testData',
                    isHidden: true,
                    myProp: 'value'
                });
            });
        });

        describe('getCompDesign - using runtimeDal data', function() {
            it('should return runtime overrides when component does not have property query', function() {
                var testCompId = 'testComp';
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults('testPage', [{
                        id: testCompId,
                        componentType: 'wysiwyg.viewer.components.SiteButton'
                    }])
                    .setCurrentPage('testPage');
                var siteAPI = testUtils.mockFactory.mockSiteAPI(siteData);
                siteAPI.getRuntimeDal().setCompDesign(testCompId, {
                    isHidden: true
                });

                var compDesign = propsBuilderUtil.getCompDesign(siteAPI, testCompId, null, 'testPage');

                expect(compDesign).toEqual({
                    isHidden: true
                });
            });

        });
    });
});
