define(['lodash', 'santa-harness', 'errorUtils', 'apiCoverageUtils'], function (_, santa, errorUtils, apiCoverageUtils) {
    'use strict';

    describe('Document Services -Theme - Fonts', function () {

        var documentServices, _window;

        beforeAll(function (done) {
            santa.start({site: 'fonts-charsets'}).then(function (harness) {
                documentServices = harness.documentServices;
                _window = harness.window;
                console.log('Testing fonts spec');
                done();
            });
        });

        describe('get and getAll', function () {

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.theme.fonts.getAll');
                apiCoverageUtils.checkFunctionAsTested('documentServices.theme.fonts.get');
            });

            it('Should be able to get a dictionary of all available fonts', function () {
                var fonts = documentServices.theme.fonts.getAll();

                expect(fonts).toBeDefined();
                expect(_.size(fonts)).toBeGreaterThan(1);

                _.forEach(fonts, function (value, key) {
                    expect(_.startsWith(key, 'font_')).toBeTruthy();
                });
            });

            describe('get font by id', function () {
                it('Should return the right font value', function () {
                    var allFonts = documentServices.theme.fonts.getAll();

                    _.forEach(allFonts, function (value, key) {
                        var fontById = documentServices.theme.fonts.get(key);
                        expect(value).toEqual(fontById);
                    });
                });

                describe('When getting unknown font id', function () {
                    it('Should return undefined', function () {
                        var nonExistingFont = documentServices.theme.fonts.get('font_9999');
                        expect(nonExistingFont).toBeUndefined();
                    });
                });
            });
        });

        describe('update', function () {

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.theme.fonts.update');
            });


            describe('When updating an unknown font', function () {
                it('Should throw an "Invalid Key" error', function (done) {
                    errorUtils.waitForError(documentServices, done, "Invalid Key font_9999");

                    documentServices.theme.fonts.update({
                        'font_9999': 'normal normal normal 3px/2em Arial {color_4}'
                    });
                });
            });

            describe('When trying to update an invalid font value', function () {
                it('Should throw an error "font format isn\'t correct..."', function (done) {
                    errorUtils.waitForError(documentServices, done, "font format isn't correct please supply following format: font-style font-variant font-weight font-size/line-height font-family color");

                    documentServices.theme.fonts.update({
                        'font_0': 'My font definitions'
                    });
                });
            });

            describe('Update existing font', function () {
                it('should be able to update the font dictionary with existing fonts.', function (done) {
                    documentServices.theme.fonts.update({'font_1': 'normal normal normal 3px/2em Arial {color_4}'});

                    documentServices.waitForChangesApplied(function () {
                        var updatedFont1 = documentServices.theme.fonts.get('font_1');
                        expect(updatedFont1).toBe('normal normal normal 3px/2em Arial {color_4}');
                        done();
                    });
                });

                it('should update the font with color in hex value', function (done) {
                    documentServices.theme.fonts.update({'font_1': 'normal normal normal 3px/2em Arial #ffffff'});

                    documentServices.waitForChangesApplied(function () {
                        var updatedFont1 = documentServices.theme.fonts.get('font_1');
                        expect(updatedFont1).toBe('normal normal normal 3px/2em Arial #ffffff');
                        done();
                    });
                });
            });
        });
        
        describe('characterSet', function () {
            
            
            describe('getCharacterSet', function () {
                
                it('Should contain the all the charsets (they are all added in the test site)', function () {
                    var charSet = documentServices.theme.fonts.getCharacterSet();

                    expect(charSet).toEqual(['latin', 'latin-ext', 'cyrillic', 'japanese', 'korean', 'arabic', 'hebrew']);

                    apiCoverageUtils.checkFunctionAsTested('documentServices.theme.fonts.getCharacterSet');
                });
            });
            
            describe('getLanguageCharacterSet', function () {
                
                afterAll(function () {
                    apiCoverageUtils.checkFunctionAsTested('documentServices.theme.fonts.getLanguageCharacterSet');
                });

                it('Should return undefined if no language symbol provided', function () {
                    expect(documentServices.theme.fonts.getLanguageCharacterSet()).toBeUndefined();
                });
                
                it('Should return undefined if non-existing language symbol provided', function () {
                    expect(documentServices.theme.fonts.getLanguageCharacterSet('some-lang-key')).toBeUndefined();
                });

                it('Should return the charSet array for each existing language symbol provided', function () {
                    // these values are hard-coded in the viewer 
                    var wixLanguageCharacterSet = {
                        'pl': ['latin-ext', 'latin'],
                        'ru': ['cyrillic', 'latin'],
                        'ja': ['japanese', 'latin'],
                        'ko': ['korean', 'latin']
                    };
                    
                    _.forOwn(wixLanguageCharacterSet, function (value, key) {
                        expect(documentServices.theme.fonts.getLanguageCharacterSet(key)).toEqual(value);    
                    });
                    
                });
            });

            describe('getCharacterSetByGeo', function () {

                afterAll(function () {
                    apiCoverageUtils.checkFunctionAsTested('documentServices.theme.fonts.getCharacterSetByGeo');
                });

                function simulateGeo(geo) {
                    var originalGeo = _window.rendererModel.geo;
                    _window.rendererModel.geo = geo;

                    return function restoreOriginalGeo() {
                        _window.rendererModel.geo = originalGeo;
                    };
                }

                
                it('Should return different charsets for different GEOs', function () {
                    var charsetsByGeos = {
                        "ISR": ["hebrew", "arabic", "latin"],
                        "JPN": ["japanese"],
                        "RUS": ["cyrillic"],
                        "PER": []
                    };
                    
                    _.forOwn(charsetsByGeos, function (value, key) {
                        var restoreOriginalGeo = simulateGeo(key);
                        var correctCharset = _(charsetsByGeos[key]).concat(['latin']).uniq().value();
                        
                        expect(documentServices.theme.fonts.getCharacterSetByGeo()).toEqual(correctCharset);
                        restoreOriginalGeo();
                    });
                });
                
                it('Should return latin for non esisting country code', function () {
                    var restoreOriginalGeo = simulateGeo("NO_COUNTRY_FOR_OLD_MEN");
                    expect(documentServices.theme.fonts.getCharacterSetByGeo()).toEqual(['latin']);
                    restoreOriginalGeo();
                });
            });
            
            describe('updateCharacterSet', function () {

                // initializing a default charset every test to avoid re-rendering the site                
                beforeEach(function () {
                    documentServices.theme.fonts.updateCharacterSet(["hebrew", "arabic", "latin"]);
                });

                afterAll(function () {
                    apiCoverageUtils.checkFunctionAsTested('documentServices.theme.fonts.updateCharacterSet');
                });

                it('Should update the charset if given an array', function () {
                    documentServices.theme.fonts.updateCharacterSet(['new-char-set']);
                    expect(documentServices.theme.fonts.getCharacterSet()).toEqual(['new-char-set', 'latin']);
                });
                
                it('Should remove all charsets except latin if given an empty array', function () {
                    documentServices.theme.fonts.updateCharacterSet([]);
                    expect(documentServices.theme.fonts.getCharacterSet()).toEqual(['latin']);
                });
                
                it('Should do nothing if NOT given an array', function () {
                    documentServices.theme.fonts.updateCharacterSet('this is not an array');
                    expect(documentServices.theme.fonts.getCharacterSet()).toEqual(["hebrew", "arabic", "latin"]);
                });
                
                it('Should always keep latin in the charset', function () {
                    documentServices.theme.fonts.updateCharacterSet(["other", "charset"]);
                    expect(documentServices.theme.fonts.getCharacterSet()).toEqual(["other", "charset", "latin"]);
                });
            });
        });
    });
});
