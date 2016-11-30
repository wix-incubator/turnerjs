define(['lodash', 'wixappsCore/core/linksConverter'], function (_, linksConverter) {
    'use strict';

    describe('linksConverter', function () {
        function getExpectedData(linkData, pageId) {
            return {
                type: 'AnchorLink',
                id: undefined,
                anchorName: linkData.anchorName,
                anchorDataId: {
                    id: linkData.anchorDataId,
                    pageId: pageId
                },
                pageId: {
                    id: linkData.pageId,
                    pageId: 'masterPage'
                }
            };
        }
        describe('dynamicPageLink', function () {
            it('should convert dynamic page link fro, wixApps type to editor type', function () {
                var linkData = {
                    _type: 'wix:DynamicPageLink',
                    anchorDataId: 'mock-anchor-id',
                    routerId: '5',
                    innerRoute: 'mockInnerRoute'
                };
                var expectedLink = {
                    type: 'DynamicPageLink',
                    id: undefined,
                    anchorDataId: 'mock-anchor-id',
                    routerId: '5',
                    innerRoute: 'mockInnerRoute'
                };
                var actual = linksConverter(linkData);
                expect(actual).toEqual(expectedLink);
            });
        });

        describe('anchorLink', function () {
            it('should use masterPage if the pageId is masterPage', function () {
                function getDataById(id, pageId) {
                    return {
                        id: id,
                        pageId: pageId
                    };
                }

                var linkData = {
                    _type: 'wix:AnchorLink',
                    anchorName: 'test-anchor',
                    anchorDataId: 'data-id',
                    pageId: 'masterPage'
                };

                var actual = linksConverter(linkData, getDataById);
                var expected = getExpectedData(linkData, 'masterPage');
                expect(actual).toEqual(expected);
            });

            it('should use masterPage if the pageId is #masterPage', function () {
                function getDataById(id, pageId) {
                    return {
                        id: id,
                        pageId: pageId
                    };
                }

                var linkData = {
                    _type: 'wix:AnchorLink',
                    anchorName: 'test-anchor',
                    anchorDataId: 'data-id',
                    pageId: '#masterPage'
                };

                var actual = linksConverter(linkData, getDataById);
                var expected = getExpectedData(linkData, 'masterPage');
                expect(actual).toEqual(expected);
            });

            it('should use the pageId if the pageId is neither masterPage nor #masterPage', function () {
                function getDataById(id, pageId) {
                    return {
                        id: id,
                        pageId: pageId
                    };
                }

                var linkData = {
                    _type: 'wix:AnchorLink',
                    anchorName: 'test-anchor',
                    anchorDataId: 'data-id',
                    pageId: 'pageId'
                };

                var actual = linksConverter(linkData, getDataById);
                var expected = getExpectedData(linkData, 'pageId');
                expect(actual).toEqual(expected);
            });

            it('should use the anchorDataId as string if getDataById return empty object (i.e. page data is not loaded)', function () {
                function getDataById(id, pageId) {
                    if (id === 'data-id') {
                        return {};
                    }

                    return {
                        id: id,
                        pageId: pageId
                    };
                }

                var linkData = {
                    _type: 'wix:AnchorLink',
                    anchorName: 'test-anchor',
                    anchorDataId: 'data-id',
                    pageId: 'pageId'
                };

                var actual = linksConverter(linkData, getDataById);
                var expected = getExpectedData(linkData, 'pageId');
                expected.anchorDataId = linkData.anchorDataId;
                expect(actual).toEqual(expected);
            });

            it('should call the getDataById with empty string as the pageId if the pageId does not exist', function () {
                function getDataById(id, pageId) {
                    return {
                        id: id,
                        pageId: pageId
                    };
                }

                var linkData = {
                    _type: 'wix:AnchorLink',
                    anchorName: 'test-anchor',
                    anchorDataId: 'data-id'
                };

                var actual = linksConverter(linkData, getDataById);
                var expected = getExpectedData(linkData, '');
                expect(actual).toEqual(expected);
            });
        });
    });
});
