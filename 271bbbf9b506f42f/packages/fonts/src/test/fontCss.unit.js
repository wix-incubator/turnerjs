define(['fonts/utils/fontCss'], function (fontCss) {
    'use strict';

    describe('fontCss', function () {

        it('should convert fontToCSS with # color', function () {
            var themData = {
                color: ['#FAFAFA']
            };
            expect(fontCss.fontToCSSWithColor("aa bb cc {color_0} almoni-dl-aaa-700", themData.color, true)).toEqual("aa bb cc  almoni-dl-aaa-700,sans-serif;color:#FAFAFA;");
        });

        it('should convert fontToCSS with rgba color', function () {
            var themData = {
                color: ['255, 255, 255, 0.4']
            };
            expect(fontCss.fontToCSSWithColor("aa bb cc {color_0} almoni-dl-aaa-700", themData.color, true)).toEqual("aa bb cc  almoni-dl-aaa-700,sans-serif;color:rgba(255, 255, 255, 0.4);");
        });

        it('should convert fontToCSSWithoutColor', function () {
            var themData = {
                color: ['#FAFAFA']
            };
            expect(fontCss.fontToCSSWithoutColor("aa bb cc {color_0} almoni-dl-aaa-700", themData, true)).toEqual("aa bb cc  almoni-dl-aaa-700,sans-serif;");
        });

        it('should convert fontToCSSWithoutColor that contain - font_', function () {
            var themData = {
                font: ['lala', 'normal normal normal 23px/1.4em arial+black {color_0}'],
                color: ['#FAFAFA']
            };
            expect(fontCss.fontToCSSWithoutColor("font_1", themData, true)).toEqual("normal normal normal 23px/1.4em 'arial black',arial-w01-black,arial-w02-black,'arial-w10 black',sans-serif ;");
        });

        it('should work for font with spaces or non-latin chars', function () {
            var themData = {
                color: ['#FAFAFA']
            };
            expect(fontCss.fontToCSSWithoutColor('normal normal normal 23px/1.4em ｍｓ+ｐゴシック {color_0}', themData, true))
                .toEqual("normal normal normal 23px/1.4em 'ｍｓ ｐゴシック','ms pgothic','ヒラギノ角ゴ pro w3','hiragino kaku gothic pro',osaka,sans-serif ;");
        });

        it('should getColorCSSFromFontString when color comes with #', function () {
            var themData = {
                color: []
            };
            expect(fontCss.fontToCSSWithColor('normal normal normal 22px/1.4em marck+script #FD51C0', themData.color, true))
                .toEqual("normal normal normal 22px/1.4em 'marck script',cursive ;color:#FD51C0;");
        });

        it('should return a string of themeFonts css styles with colors', function () {
            var themeData = {
                color: ['#C4E7B6', '#A0CF8E', '#64B743', '#437A2D', '#213D16'],
                font: ['normal normal normal 45px/1.4em Lobster {color_0}', 'normal normal normal 13px/1.4em Lobster {color_1}']
            };

            var expected =
                '.font_0 {font: normal normal normal 45px/1.4em Lobster,cursive ;color:#C4E7B6;} \n' +
                '.font_1 {font: normal normal normal 13px/1.4em Lobster,cursive ;color:#A0CF8E;} \n';

            expect(fontCss.getThemeFontsCss(themeData.font, themeData.color)).toEqual(expected);
        });

        it('should return a string of themeFonts css styles with colors for font without fallbacks', function () {
            var themeData = {
                color: ['#C4E7B6'],
                font: ['normal normal normal 45px/1.4em TestFont {color_0}']
            };

            var expected = '.font_0 {font: normal normal normal 45px/1.4em TestFont ;color:#C4E7B6;} \n';

            expect(fontCss.getThemeFontsCss(themeData.font, themeData.color)).toEqual(expected);
        });
    });
});
