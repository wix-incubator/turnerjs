define([
    'lodash',
    'dataFixer/plugins/appPartDuplicateCustomizationFixer'
], function (_, appPartDuplicateCustomizationFixer) {

    'use strict';


    describe('appPartDuplicateCustomizationFixer', function () {

        it('should remove duplicate app part customizations (ignoring value) leaving only the last one', function () {
            expectInputTransformation({
                data: {
                    document_data: {
                        appPart: {
                            appLogicCustomizations: [
                                createCustomization1('a'),
                                createCustomization1('b'),
                                createCustomization1('c'),
                                createCustomization3('d'),
                                createCustomization2('e'),
                                createCustomization2('f'),
                                createCustomization3('g')
                            ],
                            type: 'AppPart'
                        }
                    }
                }
            }, {
                data: {
                    document_data: {
                        appPart: {
                            appLogicCustomizations: [
                                createCustomization1('c'),
                                createCustomization2('f'),
                                createCustomization3('g')
                            ],
                            type: 'AppPart'
                        }
                    }
                }
            });

            
            expectInputTransformation({
                data: {
                    document_data: {
                        otherAppPart: {
                            appLogicCustomizations: [
                                createCustomization1('a'),
                                createCustomization1('b')
                            ],
                            type: 'AppPart'
                        }
                    }
                }
            }, {
                data: {
                    document_data: {
                        otherAppPart: {
                            appLogicCustomizations: [
                                createCustomization1('b')
                            ],
                            type: 'AppPart'
                        }
                    }
                }
            });
        });


        it('should process only app parts', function () {
            expectInputTransformation({
                data: {
                    document_data: {
                        otherAppPart: {
                            appLogicCustomizations: [
                                createCustomization1('a'),
                                createCustomization1('b')
                            ],
                            type: 'Component'
                        }
                    }
                }
            }, {
                data: {
                    document_data: {
                        otherAppPart: {
                            appLogicCustomizations: [
                                createCustomization1('a'),
                                createCustomization1('b')
                            ],
                            type: 'Component'
                        }
                    }
                }
            });

            expectInputTransformation({
                data: {
                    document_data: {
                        otherAppPart: {
                            appLogicCustomizations: [
                                createCustomization1('a'),
                                createCustomization1('b')
                            ],
                            type: 'OtherComponent'
                        }
                    }
                }
            }, {
                data: {
                    document_data: {
                        otherAppPart: {
                            appLogicCustomizations: [
                                createCustomization1('a'),
                                createCustomization1('b')
                            ],
                            type: 'OtherComponent'
                        }
                    }
                }
            });
        });


        it('should not break if there is a null customization', function () {
            expectInputTransformation({
                data: {
                    document_data: {
                        otherAppPart: {
                            appLogicCustomizations: [null],
                            type: 'AppPart'
                        }
                    }
                }
            }, {
                data: {
                    document_data: {
                        otherAppPart: {
                            appLogicCustomizations: [null],
                            type: 'AppPart'
                        }
                    }
                }
            });
        });


        function createCustomization1(value) {
            return {
                fieldId: 'G3qC',
                forType: 'J3MQ3N',
                format: 'TDvLkT3jn',
                key: 'NEi9T',
                mode: 'i52z',
                type: 'SKwcc',
                value: value
            };
        }


        function createCustomization2(value) {
            return {
                fieldId: 'ky4',
                forType: 'gW1DAV1',
                format: 'Of53lj',
                key: 'jDN',
                type: 'wMNYZFpr',
                value: value
            };
        }


        function createCustomization3(value) {
            return {
                fieldId: 'D9bQ',
                forType: 'jCHd32vL9',
                key: 'rg7Rww6r',
                type: 'OJu',
                value: value
            };
        }


        function expectInputTransformation(input, output) {
            appPartDuplicateCustomizationFixer.exec(input);
            expect(input).toEqual(output);
        }

    });

});
