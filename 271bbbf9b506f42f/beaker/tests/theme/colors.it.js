define(['lodash', 'santa-harness', 'errorUtils', 'apiCoverageUtils'], function (_, santa, errorUtils, apiCoverageUtils) {

    "use strict";
    describe('Document Services - Theme - Colors', function () {
        
        var documentServices;

        beforeAll(function (done) {
            santa.start().then(function (harness) {
                documentServices = harness.documentServices;
                console.log('Testing colors spec');
                done();
            });
        });

        beforeEach(function () {
            var matchers = {
                toBeValidCSSColor: function () {
                    return {
                        compare: function (actual) {
                            var res = {};
                            res.pass = /^#([0-9|A-F|a-f]{3}|[0-9|A-F|a-f]{6})$/.test(actual);
                            if (!res.pass) {
                                res.pass = true;
                                var rgba = actual.split(',');
                                for (var i = 0; i < 3; i++) {
                                    res.pass &= rgba[i] >= 0 && rgba[i] <= 255;
                                }
                                res.pass &= !rgba[3] || (rgba[3] && rgba[3] >= 0 && rgba[3] <= 1);
                            }
                            if (!res.pass) {
                                res.message = actual + ' is not a valid color';
                            }
                            return res;
                        }
                    };
                }
            };
            jasmine.addMatchers(matchers);
        });

        describe('get and getAll', function () {

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.theme.colors.getAll');
                apiCoverageUtils.checkFunctionAsTested('documentServices.theme.colors.get');
            });

            it('Should be a map between "color_#" to valid css color', function () {
                var allThemeColors = documentServices.theme.colors.getAll();

                expect(allThemeColors).toBeDefined();
                expect(_.size(allThemeColors)).toBeGreaterThan(1);

                _.forEach(allThemeColors, function (value, key) {
                    expect(_.startsWith(key, 'color_')).toBeTruthy();
                    expect(value).toBeValidCSSColor();
                });
            });

            it('Should return the right color value', function () {
                var allColors = documentServices.theme.colors.getAll();

                _.forEach(allColors, function (value, key) {
                    var colorById = documentServices.theme.colors.get(key);
                    expect(value).toEqual(colorById);
                });
            });

            it('should return undefined when getting unknown color id', function () {
                var colorById = documentServices.theme.colors.get('color_9999');
                expect(colorById).toBeUndefined();
            });
        });

        describe('update', function () {

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.theme.colors.update');
            });

            it('should not be able to update non existing colors', function (done) {
                errorUtils.waitForError(documentServices, function () {
                    var nonExistingColor = documentServices.theme.colors.get('color_987');
                    var updatedColor0 = documentServices.theme.colors.get('color_0');

                    expect(nonExistingColor).toBeUndefined();
                    expect(updatedColor0).not.toBe('#ABCDEF');
                    done();
                }, 'Invalid Key color_987');

                documentServices.theme.colors.update({color_0: '#ABCDEF', color_987: '#FEDCBA'});
            });

            it('should be able to update colors to the theme', function (done) {
                documentServices.theme.colors.update({color_1: '#1BCDEF'});

                documentServices.waitForChangesApplied(function () {
                    var updatedColor1 = documentServices.theme.colors.get('color_1');
                    expect(updatedColor1).toBe('#1BCDEF');
                    done();
                });
            });

            describe('When trying to update an invalid color value', function () {
                it('should not update the current color value', function (done) {
                    var currentValue = documentServices.theme.colors.get('color_1');

                    errorUtils.waitForError(documentServices, function () {
                        var updatedColor1 = documentServices.theme.colors.get('color_1');
                        expect(updatedColor1).toBe(currentValue);
                        done();
                    }, "color value isn't valid #ZZZZZZ .Please supply or hex/rgb string");

                    documentServices.theme.colors.update({color_1: '#ZZZZZZ'});
                });
            });
        });
    });
});
