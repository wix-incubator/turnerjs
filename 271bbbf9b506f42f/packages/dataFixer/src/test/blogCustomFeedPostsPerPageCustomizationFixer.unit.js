define([
    'dataFixer/plugins/blogCustomFeedPostsPerPageCustomizationFixer',
    'coreUtils'
], function (
    dataFixer,
    coreUtils
) {
    'use strict';

    describe('blogCustomFeedPostsPerPageCustomizationFixer', function () {
        it('should convert component property customizations with format "" to variable customizations with format "*"', function () {
            var pageJson = this.getBrokenPageJson({customizationFormat: ''});
            dataFixer.exec(pageJson);
            expect(pageJson).toEqual(this.getFixedPageJson());
        });

        it('should convert component property customizations with format "*" to variable customizations with format "*"', function () {
            var pageJson = this.getBrokenPageJson({customizationFormat: '*'});
            dataFixer.exec(pageJson);
            expect(pageJson).toEqual(this.getFixedPageJson());
        });

        beforeEach(function () {
            this.getBrokenPageJson = function (options) {
                return {
                    data: {
                        document_data: {
                            'dataItem-ilnzra4s': {
                                type: 'AppPart',
                                appPartName: coreUtils.blogAppPartNames.CUSTOM_FEED,
                                appLogicCustomizations: [{
                                    fieldId: 'paginatedlist',
                                    forType: 'Array',
                                    format: options.customizationFormat,
                                    key: 'comp.itemsPerPage',
                                    view: 'MediaTop'
                                }, {
                                    fieldId: 'paginatedlist',
                                    forType: 'Array',
                                    format: options.customizationFormat,
                                    key: 'comp.itemsPerPage',
                                    view: 'MediaBottom'
                                }, {
                                    fieldId: 'paginatedlist',
                                    forType: 'Array',
                                    format: options.customizationFormat,
                                    key: 'comp.itemsPerPage',
                                    view: 'MediaLeft'
                                }, {
                                    fieldId: 'paginatedlist',
                                    forType: 'Array',
                                    format: options.customizationFormat,
                                    key: 'comp.itemsPerPage',
                                    view: 'MediaRight'
                                }, {
                                    fieldId: 'paginatedlist',
                                    forType: 'Array',
                                    format: options.customizationFormat,
                                    key: 'comp.itemsPerPage',
                                    view: 'MediaZigzag'
                                }, {
                                    fieldId: 'columnBlog',
                                    forType: 'Array',
                                    format: options.customizationFormat,
                                    key: 'comp.itemsPerPage',
                                    view: 'Masonry'
                                }]
                            }
                        }
                    }
                };
            };

            this.getFixedPageJson = function () {
                return {
                    data: {
                        document_data: {
                            'dataItem-ilnzra4s': {
                                type: 'AppPart',
                                appPartName: coreUtils.blogAppPartNames.CUSTOM_FEED,
                                appLogicCustomizations: [{
                                    fieldId: 'vars',
                                    forType: 'Array',
                                    format: '*',
                                    key: 'itemsPerPage',
                                    view: 'MediaTop'
                                }, {
                                    fieldId: 'vars',
                                    forType: 'Array',
                                    format: '*',
                                    key: 'itemsPerPage',
                                    view: 'MediaBottom'
                                }, {
                                    fieldId: 'vars',
                                    forType: 'Array',
                                    format: '*',
                                    key: 'itemsPerPage',
                                    view: 'MediaLeft'
                                }, {
                                    fieldId: 'vars',
                                    forType: 'Array',
                                    format: '*',
                                    key: 'itemsPerPage',
                                    view: 'MediaRight'
                                }, {
                                    fieldId: 'vars',
                                    forType: 'Array',
                                    format: '*',
                                    key: 'itemsPerPage',
                                    view: 'MediaZigzag'
                                }, {
                                    fieldId: 'vars',
                                    forType: 'Array',
                                    format: '*',
                                    key: 'itemsPerPage',
                                    view: 'Masonry'
                                }]
                            }
                        }
                    }
                };
            };
        });
    });
});
