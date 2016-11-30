define(['lodash', 'fonts/utils/fontUtils'], function (_, fontUtils) {
  "use strict";

  var FONTS_TO_TRACK_IDENTIFIER = {
    permissions: 'all',
    provider: 'monotype'
  };

  var usedFontsOnPage = Object.create(null);

  function shouldTrackFonts(siteData, pageId) {
    if (!_.isObject(siteData)) {
      return false;
    }

    usedFontsOnPage.masterPage = usedFontsOnPage.masterPage || getUsedFontsInPage(siteData, 'masterPage');
    usedFontsOnPage[pageId] = usedFontsOnPage[pageId] || getUsedFontsInPage(siteData, pageId);


    var usedFontsInView = _.union(
      usedFontsOnPage.masterPage,
      usedFontsOnPage[pageId]
    );

    var usedFontsMetaData = fontUtils.getMetadata(usedFontsInView);

    return _.some(usedFontsMetaData, {permissions: FONTS_TO_TRACK_IDENTIFIER.permissions, provider: FONTS_TO_TRACK_IDENTIFIER.provider});
  }

  function getUsedFontsInPage(siteData, pageId) {
    return fontUtils.getPageUsedFontsList(siteData, pageId);
  }

  return {
    shouldTrackFonts: shouldTrackFonts
  };
});
