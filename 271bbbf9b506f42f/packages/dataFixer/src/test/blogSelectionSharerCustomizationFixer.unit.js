define([
    'dataFixer/plugins/blogSelectionSharerCustomizationsFixer',
    'coreUtils'
], function (
    blogSelectionSharerCustomizationsFixer,
    coreUtils
) {
    'use strict';

    describe('blogSelectionSharerCustomizationsFixer', function () {

        it('should add the selection sharer customization when its missing', function () {
            var pageJson = this.getPageJsonWithoutSelectionSharerCustomization();
            var expectedCustomizationsArray = [
                {
                    forType: 'Post',
                    fieldId: 'vars',
                    key: 'selectionSharerExperimentOpen',
                    view: 'fakeComp',
                    type: 'AppPartCustomization',
                    format: ''
                }
            ];
            blogSelectionSharerCustomizationsFixer.exec(pageJson);
            expect(pageJson.data.document_data.fakeComp.appLogicCustomizations).toEqual(expectedCustomizationsArray);
        });

        it('should not add the selection sharer customization when it exists', function () {
            var pageJson = this.getPageJsonWithSelectionSharerCustomization();
            var expectedCustomizationsArray = [
                {
                    forType: 'Post',
                    fieldId: 'vars',
                    key: 'selectionSharerExperimentOpen',
                    view: 'fakeComp',
                    type: 'AppPartCustomization',
                    format: ''
                }
            ];
            blogSelectionSharerCustomizationsFixer.exec(pageJson);
            expect(pageJson.data.document_data.fakeComp.appLogicCustomizations).toEqual(expectedCustomizationsArray);
        });

        beforeEach(function () {
            this.getPageJsonWithoutSelectionSharerCustomization = function () {
                return {
                    data: {
                        document_data: {
                            fakeComp: {
                                type: 'AppPart',
                                viewName: 'fakeComp',
                                appPartName: coreUtils.blogAppPartNames.SINGLE_POST,
                                appLogicCustomizations: []
                            }
                        }
                    }
                };
            };
            this.getPageJsonWithSelectionSharerCustomization = function () {
                return {
                    data: {
                        document_data: {
                            fakeComp: {
                                type: 'AppPart',
                                appPartName: coreUtils.blogAppPartNames.SINGLE_POST,
                                viewName: 'fakeComp',
                                appLogicCustomizations: [
                                    {
                                        forType: 'Post',
                                        fieldId: 'vars',
                                        key: 'selectionSharerExperimentOpen',
                                        view: 'fakeComp',
                                        type: 'AppPartCustomization',
                                        format: ''
                                    }
                                ]
                            }
                        }
                    }
                };
            };

        });
    });
});
