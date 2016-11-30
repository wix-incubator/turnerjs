define([
    'lodash',
    'dataFixer/plugins/blogDateFormatCustomizationFormatFixer',
    'coreUtils'
], function (
    _,
    blogDateFormatCustomizationFormatFixer,
    coreUtils
) {
    'use strict';

    describe('blogDateFormatCustomizationFormatFixer', function () {
        it('should set format of date format customizations of feed to "*"', function () {
            var pageJson = {
                data: {
                    document_data: {
                        appPart: {
                            appLogicCustomizations: [{
                                fieldId: 'date',
                                forType: 'Post',
                                key: 'comp.format',
                                type: 'AppPartCustomization',
                                view: 'MediaBottomPage'
                            }, {
                                fieldId: 'date',
                                forType: 'Post',
                                key: 'comp.format',
                                type: 'AppPartCustomization',
                                view: 'MediaLeftPage'
                            }, {
                                fieldId: 'date',
                                forType: 'Post',
                                key: 'comp.format',
                                type: 'AppPartCustomization',
                                view: 'MediaRightPage'
                            }, {
                                fieldId: 'date',
                                forType: 'Post',
                                key: 'comp.format',
                                type: 'AppPartCustomization',
                                view: 'MediaTopPage'
                            }, {
                                fieldId: 'date',
                                forType: 'Post',
                                key: 'comp.format',
                                type: 'AppPartCustomization',
                                view: 'MediaZigzagPage'
                            }],
                            appPartName: coreUtils.blogAppPartNames.FEED,
                            type: 'AppPart'
                        }
                    }
                }
            };

            blogDateFormatCustomizationFormatFixer.exec(pageJson);

            expect(pageJson).toEqual({
                data: {
                    document_data: {
                        appPart: {
                            appLogicCustomizations: [{
                                fieldId: 'date',
                                forType: 'Post',
                                format: '*',
                                key: 'comp.format',
                                type: 'AppPartCustomization',
                                view: 'MediaBottomPage'
                            }, {
                                fieldId: 'date',
                                forType: 'Post',
                                format: '*',
                                key: 'comp.format',
                                type: 'AppPartCustomization',
                                view: 'MediaLeftPage'
                            }, {
                                fieldId: 'date',
                                forType: 'Post',
                                format: '*',
                                key: 'comp.format',
                                type: 'AppPartCustomization',
                                view: 'MediaRightPage'
                            }, {
                                fieldId: 'date',
                                forType: 'Post',
                                format: '*',
                                key: 'comp.format',
                                type: 'AppPartCustomization',
                                view: 'MediaTopPage'
                            }, {
                                fieldId: 'date',
                                forType: 'Post',
                                format: '*',
                                key: 'comp.format',
                                type: 'AppPartCustomization',
                                view: 'MediaZigzagPage'
                            }],
                            appPartName: coreUtils.blogAppPartNames.FEED,
                            type: 'AppPart'
                        }
                    }
                }
            });
        });

        it('should set format of date format customizations of ticker to "*"', function () {
            var pageJson = {
                data: {
                    document_data: {
                        appPart: {
                            appLogicCustomizations: [{
                                fieldId: 'date',
                                forType: 'Post',
                                key: 'comp.format',
                                type: 'AppPartCustomization',
                                view: 'TickerMediaBottom'
                            }, {
                                fieldId: 'date',
                                forType: 'Post',
                                key: 'comp.format',
                                type: 'AppPartCustomization',
                                view: 'TickerMediaTop'
                            }],
                            appPartName: coreUtils.blogAppPartNames.TICKER,
                            type: 'AppPart'
                        }
                    }
                }
            };

            blogDateFormatCustomizationFormatFixer.exec(pageJson);

            expect(pageJson).toEqual({
                data: {
                    document_data: {
                        appPart: {
                            appLogicCustomizations: [{
                                fieldId: 'date',
                                forType: 'Post',
                                format: '*',
                                key: 'comp.format',
                                type: 'AppPartCustomization',
                                view: 'TickerMediaBottom'
                            }, {
                                fieldId: 'date',
                                forType: 'Post',
                                format: '*',
                                key: 'comp.format',
                                type: 'AppPartCustomization',
                                view: 'TickerMediaTop'
                            }],
                            appPartName: coreUtils.blogAppPartNames.TICKER,
                            type: 'AppPart'
                        }
                    }
                }
            });
        });

        it('should set format of date format customizations of posts list to "*"', function () {
            var pageJson = {
                data: {
                    document_data: {
                        appPart: {
                            appLogicCustomizations: [{
                                fieldId: 'date',
                                forType: 'Post',
                                key: 'comp.format',
                                type: 'AppPartCustomization',
                                view: 'PostsList'
                            }, {
                                fieldId: 'date',
                                forType: 'Post',
                                key: 'comp.format',
                                type: 'AppPartCustomization',
                                view: 'PostsListMediaLeft'
                            }],
                            appPartName: coreUtils.blogAppPartNames.POSTS_LIST,
                            type: 'AppPart'
                        }
                    }
                }
            };

            blogDateFormatCustomizationFormatFixer.exec(pageJson);

            expect(pageJson).toEqual({
                data: {
                    document_data: {
                        appPart: {
                            appLogicCustomizations: [{
                                fieldId: 'date',
                                forType: 'Post',
                                format: '*',
                                key: 'comp.format',
                                type: 'AppPartCustomization',
                                view: 'PostsList'
                            }, {
                                fieldId: 'date',
                                forType: 'Post',
                                format: '*',
                                key: 'comp.format',
                                type: 'AppPartCustomization',
                                view: 'PostsListMediaLeft'
                            }],
                            appPartName: coreUtils.blogAppPartNames.POSTS_LIST,
                            type: 'AppPart'
                        }
                    }
                }
            });
        });
    });
});
