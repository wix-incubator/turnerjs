define(['lodash', 'utils/fonts/fontsParser', 'utils/fonts/renderedFontsList', 'utils/fonts/constants'], function (_, fontsParser, renderedFontsList, CONSTANTS) {
    'use strict';

    function doesDataContainNewUploadedFonts(updatedData) {
        var fontsInNewData = fontsParser.collectFontsFromTextDataArray([updatedData]);
        var renderedFonts = renderedFontsList.get();

        return _(fontsInNewData).difference(renderedFonts).some(isUploadedFontFamily);
    }

    function isUploadedFontFamily(fontFamilyStr) {
        return fontFamilyStr && _.startsWith(fontFamilyStr, CONSTANTS.LONG_UPLOADED_FONT_PREFIX);
    }

    function getUploadedId(uploadedFonStr) {
        if (uploadedFonStr) {
            uploadedFonStr = uploadedFonStr.split(',');
            var uploadedFontFamily = _.find(uploadedFonStr, function (font) {
                return isUploadedFontFamily(font);
            });
            if (uploadedFontFamily) {
                uploadedFontFamily = uploadedFontFamily.replace(CONSTANTS.LONG_UPLOADED_FONT_PREFIX, '');
                uploadedFontFamily = uploadedFontFamily.trim();
                return uploadedFontFamily;
            }
        }
        return '';
    }

    function getUploadedFontFaceStyles(uploadedFontsArr, mediaRootUrl) {
        var result = "";
        _.forEach(uploadedFontsArr, function (uploadedFont) {
            result += getUploadFontFace(getUploadedId(uploadedFont), mediaRootUrl);
        });
        return result;
    }

    function getShortUploadedFontFamily(fontGUID) {
        var res = fontGUID.split('_')[1];
        res = res.substr(0, 25);
        return res;
    }

    function getUploadedFontValue(fontGUID) {
        return CONSTANTS.LONG_UPLOADED_FONT_PREFIX + fontGUID + ',' + CONSTANTS.UPLOADED_FONT_PREFIX + getShortUploadedFontFamily(fontGUID);
    }

    function getUploadFontFace(fontGUID, mediaRootUrl) {

        var shortFontName = getShortUploadedFontFamily(fontGUID);

        var fontFaceString = '@font-face {\n' +
          'font-family: ' + CONSTANTS.UPLOADED_FONT_PREFIX + shortFontName + ';\n' +
          'src: url("' + mediaRootUrl + 'ufonts/' + fontGUID + '/woff/file.woff") format("woff"),\n' +
          'url("' + mediaRootUrl + 'ufonts/' + fontGUID + '/woff2/file.woff2") format("woff2"),\n' +
          'url("' + mediaRootUrl + 'ufonts/' + fontGUID + '/ttf/file.ttf") format("ttf");\n' +
          '}\n';

        return fontFaceString;
    }

    return {
        doesDataContainNewUploadedFonts: doesDataContainNewUploadedFonts,
        isUploadedFontFamily: isUploadedFontFamily,
        getUploadedFontValue: getUploadedFontValue,
        getUploadedId: getUploadedId,
        getUploadedFontFaceStyles: getUploadedFontFaceStyles
    };
});
