define(['lodash', 'dataFixer/plugins/compsWithImagesDataFixer'], function(_, compsWithImagesDataFixer) {
    'use strict';

    describe('backgroundsFixer spec', function() {
        var conversionMap = {
            BgImageStripProperties: 'BgImageStripUnifiedProperties'
        };

        beforeEach(function() {
            this.pageJson = {
                data: {
                    component_properties: {
                        p1: {
                            type: "someType",
                            bgSize: "cover",
                            bgRepeat: "no-repeat",
                            bgPosition: "center",
                            bgUrl: ""
                        },
                        p2: {
                            type: "BgImageStripProperties",
                            bgSize: "auto",
                            bgRepeat: "repeat",
                            bgPosition: "left center",
                            bgUrl: ""
                        }
                    }
                }
            };
        });
        describe('fix properties', function() {

            it('should do nothing if property type does not exist as key in migration functions', function() {
                var p1 = this.pageJson.data.component_properties.p1;
                var expectedProperty = _.clone(p1);

                compsWithImagesDataFixer.exec(this.pageJson);

                expect(expectedProperty).toEqual(p1);
            });

            describe('fix BgImageStripUnifiedProperties property data', function() {

                it('should delete css properties, change the property type and add fitting and alignment types', function() {
                    var p2 = this.pageJson.data.component_properties.p2;
                    var sourceType = p2.type;

                    compsWithImagesDataFixer.exec(this.pageJson);

                    expect(p2.type).toBe(conversionMap[sourceType]);

                    expect(p2.bgSize).toBeUndefined();
                    expect(p2.bgRepeat).toBeUndefined();
                    expect(p2.bgPosition).toBeUndefined();
                    expect(p2.bgUrl).toBeUndefined();

                    expect(p2.alignType).toBeDefined();
                    expect(p2.fittingType).toBeDefined();
                });
            });
        });

    });
});
