define(['lodash', 'wixappsCore/core/styleTranslator'], function (_, /** wixappsCore.styleTranslator */styleTranslator) {
    'use strict';

    describe("styleTranslator", function () {
        describe("flex", function () {
            it("raw flex value and horizontal orientation", function () {
                var style = {
                    flex: 1
                };

                var translatedStyle = styleTranslator.translate(style, "horizontal");

                var expectedFlex = 1;
                var expected = {
                    'minWidth': 0,
                    'WebkitFlex': expectedFlex,
                    'msFlex': expectedFlex,
                    'flex': expectedFlex
                };

                expect(translatedStyle).toEqual(expected);
            });

            it("raw flex value and vertical orientation", function () {
                var style = {
                    flex: 1
                };

                var translatedStyle = styleTranslator.translate(style, "vertical");

                var expectedFlex = "1 1 auto";
                var expected = {
                    'minWidth': 0,
                    'WebkitFlex': expectedFlex,
                    'msFlex': expectedFlex,
                    'flex': expectedFlex
                };

                expect(translatedStyle).toEqual(expected);
            });

            it("non - raw flex value and vertical orientation", function () {
                _.forEach(["1 1", "1 1 auto", "0 1 auto", "0 0 auto", "0 0"], function (flex) {
                    var style = {
                        flex: flex
                    };

                    var translatedStyle = styleTranslator.translate(style, "vertical");

                    var expectedFlex = flex;
                    var expected = {
                        'minWidth': 0,
                        'WebkitFlex': expectedFlex,
                        'msFlex': expectedFlex,
                        'flex': expectedFlex
                    };

                    expect(translatedStyle).toEqual(expected);
                });
            });

            it("single empty flex value and some orientation", function () {
                _.forEach(["none", 0, "0", ""], function (flex) {
                    var style = {
                        flex: flex
                    };

                    _.forEach(["vertical", "horizontal"], function (orientation) {
                        var translatedStyle = styleTranslator.translate(style, orientation);

                        var expectedFlex = "none";
                        var expected = {
                            'minWidth': 0,
                            'WebkitFlex': expectedFlex,
                            'msFlex': expectedFlex,
                            'flex': expectedFlex
                        };

                        expect(translatedStyle).toEqual(expected);
                    });
                });
            });
        });
    });

});
