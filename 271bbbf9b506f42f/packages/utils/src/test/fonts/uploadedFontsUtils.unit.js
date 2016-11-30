define(['utils/fonts/uploadedFontsUtils'], function (uploadedFontsUtils) {
    'use strict';

    describe('uploadedFontsUtils', function () {
        it('should return a fontface for given uploaded fonts', function () {
            var fontsArr = ['wfont_6789_12345, wf_12345 ,daniel-bold', 'wfont_999_123456, wf_123456, fallback'];
            var baseUrl = 'http://localhost/';
            var expected =
              '@font-face {\n' +
              'font-family: wf_12345;\n' +
              'src: url("' + baseUrl + 'ufonts/6789_12345/woff/file.woff") format("woff"),\n' +
              'url("' + baseUrl + 'ufonts/6789_12345/woff2/file.woff2") format("woff2"),\n' +
              'url("' + baseUrl + 'ufonts/6789_12345/ttf/file.ttf") format("ttf");\n' +
              '}\n' +
              '@font-face {\n' +
              'font-family: wf_123456;\n' +
              'src: url("' + baseUrl + 'ufonts/999_123456/woff/file.woff") format("woff"),\n' +
              'url("' + baseUrl + 'ufonts/999_123456/woff2/file.woff2") format("woff2"),\n' +
              'url("' + baseUrl + 'ufonts/999_123456/ttf/file.ttf") format("ttf");\n' +
              '}\n';
            expect(uploadedFontsUtils.getUploadedFontFaceStyles(fontsArr, baseUrl)).toEqual(expected);
        });

        it('should return uploaded font id from fontFamily value', function () {
            var fontFamily = "wfont_5432, wf_1234, fallback";
            var expected = '5432';
            expect(uploadedFontsUtils.getUploadedId(fontFamily)).toEqual(expected);
        });

        it('should return uploaded font id from fontFamily value', function () {
            var fontFamily = "testFontFamily";
            var expected = '';
            expect(uploadedFontsUtils.getUploadedId(fontFamily)).toEqual(expected);
        });

        it('should return true if a font family value is an uploaded font', function () {
            var fontFamily = "wfont_5432, wf_1234, fallback";
            expect(uploadedFontsUtils.isUploadedFontFamily(fontFamily)).toBeTruthy();
        });
        it('should return false if a font family value is not an uploaded font', function () {
            var fontFamily = "testFontFamily";
            expect(uploadedFontsUtils.isUploadedFontFamily(fontFamily)).toBeFalsy();
        });
    });
});
