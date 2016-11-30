define(['lodash', 'documentServices/saveAPI/saveDataFixer/plugins/backgroundsSaveDataFixer'], function(_, backgroundsSaveDataFixer) {
    'use strict';

    describe('backgroundsFixer spec', function() {
        var reverseConversionMap = {
            BgImageStripUnifiedProperties: 'BgImageStripProperties'
        };

        beforeEach(function() {
            this.dataToSave = {
                dataDelta: {
                    component_properties: {
                        p1: {
                            type: "someType",
                            bgSize: "cover",
                            bgRepeat: "no-repeat",
                            bgPosition: "center",
                            bgUrl: ""
                        },
                        p2: {
                            type: "BgImageStripUnifiedProperties",
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
            it('should do nothing if property type doesnt exist as key in migration function map', function() {
                var p1 = this.dataToSave.dataDelta.component_properties.p1;
                var expectedProperty = _.clone(p1);

                backgroundsSaveDataFixer.exec(this.dataToSave);

                expect(expectedProperty).toEqual(p1);
            });

            describe('fix BgImageStripUnifiedProperties property data', function() {

                it('should add css properties, change the property type and delete fitting and alignment types', function() {
                    var p2 = this.dataToSave.dataDelta.component_properties.p2;
                    var sourceType = p2.type;

                    backgroundsSaveDataFixer.exec(this.dataToSave);

                    expect(p2.type).toBe(reverseConversionMap[sourceType]);

                    expect(p2.bgSize).toBeDefined();
                    expect(p2.bgRepeat).toBeDefined();
                    expect(p2.bgPosition).toBeDefined();

                    expect(p2.alignType).toBeUndefined();
                    expect(p2.fittingType).toBeUndefined();
                });

            });
        });

    });
});
