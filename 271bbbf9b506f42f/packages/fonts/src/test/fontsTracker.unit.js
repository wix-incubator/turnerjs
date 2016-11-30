define(['lodash', 'fonts/utils/fontsTracker', 'testUtils'], function (_, fontsTracker, testUtils) {
    'use strict';

    var mockFactory = testUtils.mockFactory;
    describe('Fonts tracking', function () {
        var mockedSiteData;

        var FONT_THAT_REQUIRES_REPORTING = "fbplum";
        var FONTS_THAT_DONT_REQUIRE_REPORTING = ["arial", "amiri"];

        beforeAll(function () {
            mockedSiteData = mockFactory
              .mockSiteData()
              .addPage({
                  'id': 'page_without_monotype',
                  'data': {
                      'document_data': {
                          'test_rich_text': {
                              "type": "StyledText",
                              "id": "c1bk0",
                              "text": "<p class='font_1'><span style='font-family:" + FONTS_THAT_DONT_REQUIRE_REPORTING[0] + ",fantasy;>Some text</span></p>" +
                              "<p class='font_1'><span style='font-family:" + FONTS_THAT_DONT_REQUIRE_REPORTING[1] + ",fantasy;'>Some other text</span></p>"
                          }
                      }
                  }
              })
              .addPage({
                  'id': 'page_with_monotype',
                  'data': {
                      'document_data': {
                          'test_rich_text': {
                              "type": "StyledText",
                              "id": "c1bk0",
                              "text": "<h2 class='font_1'><span style='font-family:" + FONT_THAT_REQUIRES_REPORTING + ",fantasy;>Some text</span></h2>"
                          }
                      }
                  }
              });
        });

        it('should return TRUE if any of used fonts in page are from provider:"monotype" and have permissions:"all"', function () {
            expect(fontsTracker.shouldTrackFonts(mockedSiteData, 'page_with_monotype')).toBe(true);
        });

        it('should return FALSE if none of used fonts in page match the identifier (provider:"monotype" and permissions:"all")', function () {
            expect(fontsTracker.shouldTrackFonts(mockedSiteData, 'page_without_monotype')).toBe(false);
        });
    });
});
