define(['lodash', 'dataFixer/plugins/appPartCustomizationsFixer'], function (_, appPartCustomizationsFixer) {
    'use strict';

    describe('appPartCustomizationsFixer', function () {
        function createPageJSON(appPartName, viewName, appLogicCustomizations) {
            return {
                data: {
                    document_data: {
                        c1wwb: {
                            type: 'AppPart',
                            id: 'c1wwb',
                            metaData: {
                                isPreset: false,
                                schemaVersion: '1.0',
                                isHidden: false
                            },
                            appInnerID: '5',
                            appPartName: appPartName,
                            viewName: viewName,
                            appLogicCustomizations: appLogicCustomizations,
                            appLogicParams: {}
                        }
                    }
                }
            };
        }

        describe('faq', function () {
            function createFAQPageJSON(appLogicCustomizations) {
                return createPageJSON('f2c4fc13-e24d-4e99-aadf-4cff71092b88', 'ExpandQuestions', appLogicCustomizations);
            }

            it('should fix comp.initialState customization to be var.initialState', function () {
                var pageJSON = createFAQPageJSON([
                    {
                        type: 'AppPartCustomization',
                        forType: 'Category',
                        view: 'ToggleMobile',
                        key: 'comp.initialState',
                        value: 'off',
                        fieldId: 'toggle',
                        format: 'Mobile'
                    }
                ]);

                var expected = _.cloneDeep(pageJSON);
                expected.data.document_data.c1wwb.appLogicCustomizations[0].fieldId = 'vars';
                expected.data.document_data.c1wwb.appLogicCustomizations[0].key = 'initialState';

                appPartCustomizationsFixer.exec(pageJSON);

                expect(pageJSON).toEqual(expected);
            });
            it('should do nothing when the customization is not for ToggleMobile', function () {
                var pageJSON = createFAQPageJSON([
                    {
                        type: 'AppPartCustomization',
                        forType: 'Category',
                        view: 'ToggleMobileX',
                        key: 'comp.initialState',
                        fieldId: 'toggle',
                        format: 'Mobile',
                        value: 'off'
                    }
                ]);

                var expected = _.cloneDeep(pageJSON);

                appPartCustomizationsFixer.exec(pageJSON);

                expect(pageJSON).toEqual(expected);
            });
        });
    });

});
