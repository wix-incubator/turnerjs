define(['lodash', 'dataFixer/plugins/bgImageStripDataFixer'], function (_, bgImageStripDataFixer) {
    'use strict';

    describe('bgImageStripDataFixer', function () {
        var json;

        beforeEach(function () {
            json = {
                structure: {
                    id: 'pageToFix',
                    components: [{
                        componentType: 'wysiwyg.viewer.components.BgImageStrip',
                        dataQuery: '#validQuery'
                    }],
                    mobileComponents: [{
                        componentType: 'wysiwyg.viewer.components.BgImageStrip',
                        dataQuery: '#validQuery'
                    }]
                },
                data: {
                    document_data: {
                        'validQuery': {
                            uri: 'someImage.png',
                            title: ''
                        },
                        'validQuery2': {
                            uri: 'someOtherImage.png',
                            title: ''
                        }
                    }
                }
            };
        });

        function getDesktopComponent(i) {
            return json.structure.components[i || 0];
        }

        function getMobileComponent(i) {
            return json.structure.mobileComponents[i || 0];
        }

        describe('should not patch json', function () {
            function testThatJsonHasNotBeenChangedAfterThePatch() {
                var jsonBefore = _.cloneDeep(json);
                bgImageStripDataFixer.exec(json);

                expect(json).toEqual(jsonBefore);
            }

            it('when it has no structure', function () {
                delete json.structure;
                testThatJsonHasNotBeenChangedAfterThePatch();
            });

            it('when it has no desktop components', function () {
                delete json.structure.components;
                testThatJsonHasNotBeenChangedAfterThePatch();
            });

            it('when it has no mobile components', function () {
                delete json.structure.mobileComponents;
                testThatJsonHasNotBeenChangedAfterThePatch();
            });

            it('when mobile component is missing', function () {
                json.structure.mobileComponents = [];
                testThatJsonHasNotBeenChangedAfterThePatch();
            });

            it('when there are another components with data not synced', function () {
                json.structure.components.push({componentType: 'otherComp', dataQuery: 'blabla'});
                json.structure.mobileComponents.push({componentType: 'otherComp', dataQuery: 'blabla_another'});
                testThatJsonHasNotBeenChangedAfterThePatch();
            });

            it('when BgImageStrip is consistent between desktop and mobile', function () {
                json.structure.components.push({type: 'Component'});
                json.structure.mobileComponents.push({type: 'Component'});
                testThatJsonHasNotBeenChangedAfterThePatch();
            });
        });

        describe('placeholder image fixes', function () {
            describe('when the image is a placeholder', function () {
                beforeEach(function () {
                    json.data.document_data.validQuery.uri = 'add_image_thumb.png';
                    bgImageStripDataFixer.exec(json);
                });

                it('should delete dataQuery from desktop component', function () {
                    expect(getDesktopComponent().hasOwnProperty('dataQuery')).toBe(false);
                });

                it('should delete dataQuery from mobile component', function () {
                    expect(getMobileComponent().hasOwnProperty('dataQuery')).toBe(false);
                });
            });

            describe('when the image ends with a placeholder', function () {
                beforeEach(function () {
                    json.data.document_data.validQuery.uri = '/add_image_thumb.png';
                    bgImageStripDataFixer.exec(json);
                });

                it('should delete dataQuery from desktop component', function () {
                    expect(getDesktopComponent().hasOwnProperty('dataQuery')).toBe(false);
                });

                it('should delete dataQuery from mobile component', function () {
                    expect(getMobileComponent().hasOwnProperty('dataQuery')).toBe(false);
                });
            });

            describe('when the image is not a placeholder', function () {
                it('should not change the uri', function () {
                    var currentImageUri = json.data.document_data.validQuery.uri;
                    bgImageStripDataFixer.exec(json);
                    expect(json.data.document_data.validQuery.uri).toBe(currentImageUri);
                });
            });
        });

        describe('when desktop component has no dataQuery', function () {
            beforeEach(function () {
                delete getDesktopComponent().dataQuery;
                bgImageStripDataFixer.exec(json);
            });

            it('should not add dataQuery to desktop component', function () {
                expect(getDesktopComponent().hasOwnProperty('dataQuery')).toBe(false);
            });

            it('should delete dataQuery from mobile component', function () {
                expect(getMobileComponent().hasOwnProperty('dataQuery')).toBe(false);
            });
        });

        describe('when desktop component has dataQuery but no data exists for the dataQuery', function () {
            beforeEach(function () {
                getDesktopComponent().dataQuery = '#nonexistingDataItem';
                bgImageStripDataFixer.exec(json);
            });

            it('should delete dataQuery from desktop component', function () {
                expect(getDesktopComponent().hasOwnProperty('dataQuery')).toBe(false);
            });

            it('should delete dataQuery from mobile component', function () {
                expect(getMobileComponent().hasOwnProperty('dataQuery')).toBe(false);
            });
        });

        describe('when mobile component has no dataQuery', function () {
            beforeEach(function () {
                delete getMobileComponent().dataQuery;
                bgImageStripDataFixer.exec(json);
            });

            it('should leave desktop dataQuery as is', function () {
                expect(getDesktopComponent().dataQuery).toBe('#validQuery');
            });

            it('should update mobile dataQuery with the one from desktop', function () {
                expect(getMobileComponent().dataQuery).toBe('#validQuery');
            });
        });

        describe('when mobile component has different dataQuery', function () {
            beforeEach(function () {
                getMobileComponent().dataQuery = '#validQuery2';
                bgImageStripDataFixer.exec(json);
            });

            it('should leave desktop dataQuery as is', function () {
                expect(getDesktopComponent().dataQuery).toBe('#validQuery');
            });

            it('should update mobile dataQuery with the one from desktop', function () {
                expect(getMobileComponent().dataQuery).toBe('#validQuery');
            });
        });

        describe('when desktop component has dataQuery and the data has no title', function () {
            beforeEach(function () {
                delete json.data.document_data.validQuery.title;
                bgImageStripDataFixer.exec(json);
            });

            it('should add an empty title', function () {
                expect(json.data.document_data.validQuery.title).toEqual('');
            });
        });
    });
});
