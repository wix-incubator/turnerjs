define(["lodash", "definition!wixappsCore/core/styleData"], function (_, StyleDataDefinition) {
    "use strict";
    var styleMap = {
        hasStyleNS: {
            'default': {
                'skin': 'hasStyleNS.default.Skin',
                'style': 'hasStyleNS.default.Style'
            },
            'stupidStyle': {
                'skin': 'hasStyleNS.stupidStyle.Skin',
                'style': 'hasStyleNS.stupidStyle.Style'
            },
            noStyleInAllTheme: {
                'skin': 'noStyleInAllTheme.noStyleInAllTheme.Skin',
                'style': 'noStyleInAllTheme.noStyleInAllTheme.Style'
            }
        },
        hasOnlyDefaultSkinAndStyle: {
            'default': {
                'skin': 'hasOnlyDefaultSkinAndStyle.default.Skin',
                'style': 'hasOnlyDefaultSkinAndStyle.default.Style'
            }
        },
        hasOnlySkin: {
            'default': {
                'skin': 'hasOnlySkin.default.Skin'
            },
            'noStyle': {
                'skin': 'hasOnlySkin.noStyle.Skin'
            }
        },
        notExistInAllTheme: {
            'default': {
                'skin': 'notExistInAllTheme.default.Skin',
                'style': 'notExistInAllTheme.default.Style'
            }
        }
    };

    var allTheme = {
        'hasStyleNS.default.Style': {skin: 'hasStyleNSDefault.Style.Skin'},
        'hasStyleNS.stupidStyle.Style': {skin: 'hasStyleNSStupidStyle.Style.Skin'},
        'hasOnlyDefaultSkinAndStyle.default.Style': {skin: 'hasOnlyDefaultSkinAndStyle.Style.Skin'},
        'tomStyle': {skin: 'tomSkin'}
    };

    var styleData = new StyleDataDefinition(styleMap);

    describe("styleData", function () {

        describe("getSkinAndStyle", function () {

            describe("getSkinAndStyle", function () {
                it("should return only skin when skin parameter is defined and styleId is undefined", function () {
                    var skinName = "someSkin";

                    _.forEach(styleMap, function (styles, proxyName) {
                        _.forEach(styles, function (styleId, styleNS) {
                            var actual = styleData.getSkinAndStyle(allTheme, proxyName, styleNS, undefined, skinName);
                            expect(actual).toEqual({skin: skinName});

                            actual = styleData.getSkinAndStyle(allTheme, proxyName, undefined, undefined, skinName);
                            expect(actual).toEqual({skin: skinName});
                        });
                    });
                });

                describe("skin is undefined", function () {
                    it('should return skin from styleId when allTheme has style definition for the styleId', function () {
                        var actual = styleData.getSkinAndStyle(allTheme, "hasStyleNS", "stupidStyle", "tomStyle", undefined);
                        expect(actual).toEqual({styleId: 'tomStyle', skin: allTheme.tomStyle.skin});

                        actual = styleData.getSkinAndStyle(allTheme, "hasStyleNS", undefined, "tomStyle", undefined);
                        expect(actual).toEqual({styleId: 'tomStyle', skin: allTheme.tomStyle.skin});
                    });

                    it("should return skin and style from styleNS when allTheme doesn't contain the style definition for the styleId", function () {
                        var styleId = "dassiStyle";
                        var actual = styleData.getSkinAndStyle(allTheme, "hasStyleNS", "stupidStyle", styleId, undefined);
                        expect(actual).toEqual({styleId: styleMap.hasStyleNS.stupidStyle.style, skin: styleMap.hasStyleNS.stupidStyle.skin});
                    });

                    it("should return skin and style from default style when no styleNS defined and allTheme doesn't contain the style definition for the styleId", function () {
                        var styleId = "dassiStyle";
                        var actual = styleData.getSkinAndStyle(allTheme, "hasStyleNS", undefined, styleId, undefined);
                        expect(actual).toEqual({styleId: styleMap.hasStyleNS.default.style, skin: styleMap.hasStyleNS.default.skin});
                    });

                    it("should return both skin and styleId from styleNS definition", function () {
                        var actual = styleData.getSkinAndStyle(allTheme, "hasStyleNS", "stupidStyle", undefined, undefined);
                        expect(actual).toEqual({styleId: styleMap.hasStyleNS.stupidStyle.style, skin: allTheme[styleMap.hasStyleNS.stupidStyle.style].skin});

                        actual = styleData.getSkinAndStyle(allTheme, "hasStyleNS", undefined, undefined, undefined);
                        expect(actual).toEqual({styleId: styleMap.hasStyleNS.default.style, skin: allTheme[styleMap.hasStyleNS.default.style].skin});
                    });

                    it('should return skin and style from styleNS definition when style does not exist in allTheme', function () {
                        var actual = styleData.getSkinAndStyle(allTheme, "hasStyleNS", "noStyleInAllTheme", undefined, undefined);
                        expect(actual).toEqual({styleId: styleMap.hasStyleNS.noStyleInAllTheme.style, skin: styleMap.hasStyleNS.noStyleInAllTheme.skin});
                    });

                    it("should return skin & style when no style defined in styleNS nor styleId was defined", function () {
                        var actual = styleData.getSkinAndStyle(allTheme, "hasOnlySkin", undefined, undefined, undefined);
                        expect(actual).toEqual({styleId: styleMap.hasOnlySkin.default.style, skin: styleMap.hasOnlySkin.default.skin});

                        actual = styleData.getSkinAndStyle(allTheme, "hasOnlySkin", "noStyle", undefined, undefined);
                        expect(actual).toEqual({styleId: styleMap.hasOnlySkin.noStyle.style, skin: styleMap.hasOnlySkin.noStyle.skin});
                    });

                    it("should use default skin and style if a styleNS defined with a undefined style definition", function () {
                        var actual = styleData.getSkinAndStyle(allTheme, "hasOnlySkin", "xxx", undefined, undefined);
                        expect(actual).toEqual({styleId: styleMap.hasOnlySkin.default.style, skin: styleMap.hasOnlySkin.default.skin});

                        actual = styleData.getSkinAndStyle(allTheme, "hasStyleNS", "xxx", undefined, undefined);
                        expect(actual).toEqual({styleId: styleMap.hasStyleNS.default.style, skin: allTheme[styleMap.hasStyleNS.default.style].skin});
                    });

                    it("should use default skin & style if a styleNS defined but doesn't exist in allTheme", function () {
                        var actual = styleData.getSkinAndStyle(allTheme, "notExistInAllTheme", "xxx", undefined, undefined);
                        expect(actual).toEqual({styleId: styleMap.notExistInAllTheme.default.style, skin: styleMap.notExistInAllTheme.default.skin});

                    });
                });
            });
        });
    });
});
