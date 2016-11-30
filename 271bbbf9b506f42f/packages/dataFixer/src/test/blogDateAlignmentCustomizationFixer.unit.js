define([
    'dataFixer/plugins/blogDateAlignmentCustomizationFixer',
    'coreUtils'
], function (
    dataFixer,
    coreUtils
) {
    'use strict';

    describe('blogDateAlignmentCustomizationFixer', function () {
        it('should convert component property customizations for CUSTOM_FEED to vars customization', function () {
            var options = {appPartName: coreUtils.blogAppPartNames.CUSTOM_FEED, customizationFormat: ''};
            var pageJson = this.getBrokenPageJson(options);
            dataFixer.exec(pageJson);
            expect(pageJson).toEqual(this.getFixedPageJson(options));
        });

        it('should convert component property customizations for FEED to vars customization', function () {
            var options = {appPartName: coreUtils.blogAppPartNames.FEED, customizationFormat: ''};
            var pageJson = this.getBrokenPageJson(options);
            dataFixer.exec(pageJson);
            expect(pageJson).toEqual(this.getFixedPageJson(options));
        });

        it('should convert component property customizations for CUSTOM_FEED to vars customization on mobile', function () {
            var options = {appPartName: coreUtils.blogAppPartNames.CUSTOM_FEED, customizationFormat: 'Mobile'};
            var pageJson = this.getBrokenPageJson(options);
            dataFixer.exec(pageJson);
            expect(pageJson).toEqual(this.getFixedPageJson(options));
        });

        it('should convert component property customizations for FEED to vars customization on mobile', function () {
            var options = {appPartName: coreUtils.blogAppPartNames.FEED, customizationFormat: 'Mobile'};
            var pageJson = this.getBrokenPageJson(options);
            dataFixer.exec(pageJson);
            expect(pageJson).toEqual(this.getFixedPageJson(options));
        });

        it('should convert component property customizations for SINGLE POST to vars customization', function () {
            var options = {appPartName: coreUtils.blogAppPartNames.SINGLE_POST, customizationFormat: ''};
            var pageJson = this.getBrokenSinglePageJson(options);
            dataFixer.exec(pageJson);
            expect(pageJson).toEqual(this.getFixedSinglePageJson(options));
        });

        it('should convert component property customizations for SINGLE POST to vars customization on mobile', function () {
            var options = {appPartName: coreUtils.blogAppPartNames.SINGLE_POST, customizationFormat: 'Mobile'};
            var pageJson = this.getBrokenSinglePageJson(options);
            dataFixer.exec(pageJson);
            expect(pageJson).toEqual(this.getFixedSinglePageJson(options));
        });

        beforeEach(function () {
            this.getBrokenPageJson = function (options) {
                return {
                    data: {
                        document_data: {
                            'dataItem-ilnzra4s': {
                                type: 'AppPart',
                                appPartName: options.appPartName,
                                appLogicCustomizations: [{
                                    fieldId: 'date',
                                    forType: 'Post',
                                    format: options.customizationFormat,
                                    key: 'layout.spacerBefore',
                                    view: 'MediaTop',
                                    value: '0'
                                }, {
                                    fieldId: 'date',
                                    forType: 'Post',
                                    format: options.customizationFormat,
                                    key: 'layout.spacerBefore',
                                    view: 'MediaBottom',
                                    value: '*'
                                }, {
                                    fieldId: 'date',
                                    forType: 'Post',
                                    format: options.customizationFormat,
                                    key: 'layout.spacerBefore',
                                    view: 'MediaLeft',
                                    value: '0'
                                }, {
                                    fieldId: 'date',
                                    forType: 'Post',
                                    format: options.customizationFormat,
                                    key: 'layout.spacerBefore',
                                    view: 'MediaRight',
                                    value: '*'
                                }, {
                                    fieldId: 'date',
                                    forType: 'Post',
                                    format: options.customizationFormat,
                                    key: 'layout.spacerBefore',
                                    view: 'MediaZigzag',
                                    value: '0'
                                }, {
                                    fieldId: 'date',
                                    forType: 'Post',
                                    format: options.customizationFormat,
                                    key: 'layout.spacerBefore',
                                    view: 'Masonry',
                                    value: '*'
                                }, {
                                    fieldId: 'date',
                                    forType: 'Post',
                                    format: options.customizationFormat,
                                    key: 'layout.spacerBefore',
                                    view: 'MediaTopPage',
                                    value: '0'
                                }, {
                                    fieldId: 'date',
                                    forType: 'Post',
                                    format: options.customizationFormat,
                                    key: 'layout.spacerBefore',
                                    view: 'MediaBottomPage',
                                    value: '*'
                                }, {
                                    fieldId: 'date',
                                    forType: 'Post',
                                    format: options.customizationFormat,
                                    key: 'layout.spacerBefore',
                                    view: 'MediaLeftPage',
                                    value: '0'
                                }, {
                                    fieldId: 'date',
                                    forType: 'Post',
                                    format: options.customizationFormat,
                                    key: 'layout.spacerBefore',
                                    view: 'MediaRightPage',
                                    value: '*'
                                }, {
                                    fieldId: 'date',
                                    forType: 'Post',
                                    format: options.customizationFormat,
                                    key: 'layout.spacerBefore',
                                    view: 'MediaZigzagPage',
                                    value: '0'
                                }, {
                                    fieldId: 'date',
                                    forType: 'Post',
                                    format: options.customizationFormat,
                                    key: 'layout.spacerBefore',
                                    view: 'MasonryPage',
                                    value: '*'
                                }]
                            }
                        }
                    }
                };
            };

            this.getFixedPageJson = function (options) {
                return {
                    data: {
                        document_data: {
                            'dataItem-ilnzra4s': {
                                type: 'AppPart',
                                appPartName: options.appPartName,
                                appLogicCustomizations: [{
                                    fieldId: 'vars',
                                    forType: 'Post',
                                    format: options.customizationFormat,
                                    key: 'dateAndAuthorPosition',
                                    view: 'MediaTop',
                                    value: 'left'
                                }, {
                                    fieldId: 'vars',
                                    forType: 'Post',
                                    format: options.customizationFormat,
                                    key: 'dateAndAuthorPosition',
                                    view: 'MediaBottom',
                                    value: 'right'
                                }, {
                                    fieldId: 'vars',
                                    forType: 'Post',
                                    format: options.customizationFormat,
                                    key: 'dateAndAuthorPosition',
                                    view: 'MediaLeft',
                                    value: 'left'
                                }, {
                                    fieldId: 'vars',
                                    forType: 'Post',
                                    format: options.customizationFormat,
                                    key: 'dateAndAuthorPosition',
                                    view: 'MediaRight',
                                    value: 'right'
                                }, {
                                    fieldId: 'vars',
                                    forType: 'Post',
                                    format: options.customizationFormat,
                                    key: 'dateAndAuthorPosition',
                                    view: 'MediaZigzag',
                                    value: 'left'
                                }, {
                                    fieldId: 'vars',
                                    forType: 'Post',
                                    format: options.customizationFormat,
                                    key: 'dateAndAuthorPosition',
                                    view: 'Masonry',
                                    value: 'right'
                                }, {
                                    fieldId: 'vars',
                                    forType: 'Post',
                                    format: options.customizationFormat,
                                    key: 'dateAndAuthorPosition',
                                    view: 'MediaTopPage',
                                    value: 'left'
                                }, {
                                    fieldId: 'vars',
                                    forType: 'Post',
                                    format: options.customizationFormat,
                                    key: 'dateAndAuthorPosition',
                                    view: 'MediaBottomPage',
                                    value: 'right'
                                }, {
                                    fieldId: 'vars',
                                    forType: 'Post',
                                    format: options.customizationFormat,
                                    key: 'dateAndAuthorPosition',
                                    view: 'MediaLeftPage',
                                    value: 'left'
                                }, {
                                    fieldId: 'vars',
                                    forType: 'Post',
                                    format: options.customizationFormat,
                                    key: 'dateAndAuthorPosition',
                                    view: 'MediaRightPage',
                                    value: 'right'
                                }, {
                                    fieldId: 'vars',
                                    forType: 'Post',
                                    format: options.customizationFormat,
                                    key: 'dateAndAuthorPosition',
                                    view: 'MediaZigzagPage',
                                    value: 'left'
                                }, {
                                    fieldId: 'vars',
                                    forType: 'Post',
                                    format: options.customizationFormat,
                                    key: 'dateAndAuthorPosition',
                                    view: 'MasonryPage',
                                    value: 'right'
                                }]
                            }
                        }
                    }
                };
            };

            this.getBrokenSinglePageJson = function (options) {
                return {
                    data: {
                        document_data: {
                            'dataItem-ilnzra4s': {
                                type: 'AppPart',
                                appPartName: options.appPartName,
                                appLogicCustomizations: [{
                                    fieldId: 'date',
                                    forType: 'Post',
                                    format: options.customizationFormat,
                                    key: 'layout.spacerBefore',
                                    view: 'SinglePostMediaTop',
                                    value: '0'
                                }, {
                                    fieldId: 'date',
                                    forType: 'Post',
                                    format: options.customizationFormat,
                                    key: 'layout.spacerBefore',
                                    view: 'SinglePostMediaTop',
                                    value: '*'
                                }, {
                                    fieldId: 'date',
                                    forType: 'Post',
                                    format: options.customizationFormat,
                                    key: 'layout.spacerBefore',
                                    view: 'SinglePostMediaBottom',
                                    value: '0'
                                }, {
                                    fieldId: 'date',
                                    forType: 'Post',
                                    format: options.customizationFormat,
                                    key: 'layout.spacerBefore',
                                    view: 'SinglePostMediaBottom',
                                    value: '*'
                                }]
                            }
                        }
                    }
                };
            };

            this.getFixedSinglePageJson = function (options) {
                return {
                    data: {
                        document_data: {
                            'dataItem-ilnzra4s': {
                                type: 'AppPart',
                                appPartName: options.appPartName,
                                appLogicCustomizations: [{
                                    fieldId: 'vars',
                                    forType: 'Post',
                                    format: options.customizationFormat,
                                    key: 'dateAndAuthorPosition',
                                    view: 'SinglePostMediaTop',
                                    value: 'left'
                                }, {
                                    fieldId: 'vars',
                                    forType: 'Post',
                                    format: options.customizationFormat,
                                    key: 'dateAndAuthorPosition',
                                    view: 'SinglePostMediaTop',
                                    value: 'right'
                                }, {
                                    fieldId: 'vars',
                                    forType: 'Post',
                                    format: options.customizationFormat,
                                    key: 'dateAndAuthorPosition',
                                    view: 'SinglePostMediaBottom',
                                    value: 'left'
                                }, {
                                    fieldId: 'vars',
                                    forType: 'Post',
                                    format: options.customizationFormat,
                                    key: 'dateAndAuthorPosition',
                                    view: 'SinglePostMediaBottom',
                                    value: 'right'
                                }]
                            }
                        }
                    }
                };
            };
        });
    });
});
