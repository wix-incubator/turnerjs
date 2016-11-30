define(['dataFixer/plugins/pageDataFixer'], function (pageDataFixer) {
    'use strict';

    describe('pageDataFixer', function () {
        var mockPage;
        beforeEach(function () {
            mockPage = {
                data: {
                    document_data: {
                        mockPageId2: {
                            id: "mockPageId2",
                            type: "Page"
                        }
                    }
                },
                structure: {
                    id: "mockPageId",
                    type: "Page"
                }
            };
        });

        it('should remove Page data items from pages', function () {
            pageDataFixer.exec(mockPage);
            expect(mockPage.data.document_data.mockPageId2).toBeUndefined();
        });
        it('should NOT remove Page data items from masterPage', function () {
            mockPage.structure.type = "Document";

            pageDataFixer.exec(mockPage);
            expect(mockPage.data.document_data.mockPageId2).not.toBeUndefined();
        });
        it('should update links pageId from "#SITE_STRUCTURE" to "#masterPage"', function () {
            mockPage.data.document_data.someLink = {
                type: 'AnchorLink',
                pageId: "#SITE_STRUCTURE",
                id: 'someLink'
            };

            pageDataFixer.exec(mockPage);

            expect(mockPage.data.document_data.someLink.pageId).toEqual('#masterPage');
        });
    });
});
