define(['zepto', 'lodash', 'testUtils', 'definition!layout/specificComponents/siteBackgroundLayout', 'fake!layout/util/layout'],
    function ($, _, testUtils, siteBackgroundLayoutDef, layoutFake) {
    "use strict";

    xdescribe("siteBackgroundLayout", function(){
        beforeEach(function(){
            var self = this;

            spyOn(layoutFake, 'registerPatcher').and.callFake( function(compName, callback){
                self.patcher = callback;
            });

            spyOn(layoutFake, 'registerCustomMeasure').and.callFake( function(compName, callback){
                self.measurer = callback;
            });

            siteBackgroundLayoutDef($, _, layoutFake);

            this.siteData = testUtils.mockFactory.mockSiteData();

            this.compId = 'comp';
            this.comp = window.document.createElement('div');

            this.measureMap = {
                'absoluteLeft': {

                },
                'height': {
                    'comp': 20,
                    'screen': 100
                },
                'width': {
                    screen: 80,
                    masterPage: 60
                },
                'top': {
                    WIX_ADS: 44
                },
                siteMarginBottom: 10
            };

            this.nodesMap = {
                'comp': this.comp
            };
        });

        xit("should calc the height of the BG to be the screen height if the entire structure height is smaller.", function () {
            this.measureMap.height.screen = 666;
            this.measureMap.height.masterPage = 400;
            this.measureMap.siteMarginBottom = 100;

            this.measurer(this.compId, this.measureMap, this.nodesMap, this.siteData);
            this.patcher(this.compId, this.nodesMap, this.measureMap, {}, this.siteData);

            expect(this.comp.style.height).toBeDefined();
            expect(this.comp.style.height).toBe('666px');
        });

        xit("should calc the height of the BG to be the structure height if longer than screen.", function () {
            this.measureMap.height.screen = 666;
            this.measureMap.height.masterPage = 667;
            this.measureMap.siteMarginBottom = 100;

            this.measurer(this.compId, this.measureMap, this.nodesMap, this.siteData);
            this.patcher(this.compId, this.nodesMap, this.measureMap, {}, this.siteData);

            expect(this.comp.style.height).toBeDefined();
            expect(this.comp.style.height).toBe('667px');
        });
    });
});
