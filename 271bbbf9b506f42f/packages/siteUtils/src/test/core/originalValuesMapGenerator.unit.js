define(['lodash', 'siteUtils/core/originalValuesMapGenerator', 'testUtils'], function
    (_, originalValuesMapGenerator, testUtils) {
    'use strict';

    describe('originalValuesMapGenerator', function () {
        describe('createOriginalValuesMap', function(){
            function getSiteData(containerComp){
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults('somePageId', containerComp);

                return siteData;
            }

            beforeEach(function(){
                this.containerComp = {
                    "id": "container-0",
                    "type": "Container",
                    "layout": {
                        "width": 751,
                        "height": 600,
                        "x": 113,
                        "y": 40,
                        "rotationInDegrees": 0
                    },
                    "componentType": "mobile.core.components.Container",
                    "components": [{
                        "id": "container-1",
                        "componentType": "mobile.core.components.Container",
                        "layout": {
                            "width": 200,
                            "height": 200,
                            "x": 325,
                            "y": 100,
                            "rotationInDegrees": 0
                        },
                        "components": [
                            {
                                "id": "button-A",
                                "componentType": "wysiwyg.viewer.components.SiteButton",
                                "layout": {
                                    "width": 50,
                                    "height": 50,
                                    "scale": 1,
                                    "x": 100,
                                    "y": 150,
                                    "rotationInDegrees": 0
                                }
                            }
                        ]
                    }]
                };
                this.siteData = getSiteData(this.containerComp);
            });


            it('should return flat map with key for each component', function(){
                var originalValuesMap = originalValuesMapGenerator.createOriginalValuesMap(this.containerComp, this.siteData.getAllTheme(), this.siteData.isMobileView());

                expect(_.keys(originalValuesMap).length).toEqual(3);
                expect(originalValuesMap['container-0']).toBeDefined();
                expect(originalValuesMap['container-1']).toBeDefined();
                expect(originalValuesMap['button-A']).toBeDefined();
            });

            it('should save original top for each component', function(){
                var originalValuesMap = originalValuesMapGenerator.createOriginalValuesMap(this.containerComp, this.siteData.getAllTheme(), this.siteData.isMobileView());
                expect(originalValuesMap['container-0'].top).toEqual(40);
                expect(originalValuesMap['container-1'].top).toEqual(100);
                expect(originalValuesMap['button-A'].top).toEqual(150);
            });

            it('should save original height for each container', function(){
                var originalValuesMap = originalValuesMapGenerator.createOriginalValuesMap(this.containerComp, this.siteData.getAllTheme(), this.siteData.isMobileView());

                expect(originalValuesMap['container-0'].height).toEqual(600);
                expect(originalValuesMap['container-1'].height).toEqual(200);
                expect(originalValuesMap['button-A'].height).not.toBeDefined();
            });
        });
    });
});
