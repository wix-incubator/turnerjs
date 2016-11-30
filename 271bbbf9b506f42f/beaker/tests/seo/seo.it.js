define(['santa-harness', 'apiCoverageUtils'], function (santa, apiCoverageUtils) {
    'use strict';

    describe("Document Services - SEO ", function () {

        var documentServices;
        var seo;


        describe('Initial State', function () {

            beforeAll(function (done) {
                santa.start().then(function (harness) {
                    documentServices = harness.documentServices;
                    seo = documentServices.seo;
                    console.log('Testing seo spec 1');
                    done();
                });
            });

            it('should be undefined', function () {
                var title = seo.title.get();
                expect(title).toBeUndefined();
                apiCoverageUtils.checkFunctionAsTested('documentServices.seo.title.get');
            });

            it('should get empty string as default seo description', function () {
                var result = seo.description.get();
                if (result) {
                    expect(result).toEqual('');
                }
                apiCoverageUtils.checkFunctionAsTested('documentServices.seo.description.get');
            });

            it('should get empty string as seo keywords', function () {
                var result = seo.keywords.get();
                if (result) {
                    expect(result).toEqual('');
                }
                apiCoverageUtils.checkFunctionAsTested('documentServices.seo.keywords.get');
            });

            it('should check default value of indexing', function () {
                expect(seo.indexing.isEnabled()).toEqual(true);
                apiCoverageUtils.checkFunctionAsTested('documentServices.seo.indexing.isEnabled');
            });
        });

        describe('General', function () {

            beforeAll(function (done) {
                santa.start().then(function (harness) {
                    documentServices = harness.documentServices;
                    seo = documentServices.seo;
                    console.log('Testing seo spec 2');
                    done();
                });
            });

            function testSuccessfullySetNewValue(newValue) {
                this.setFunction(newValue);
                var result = this.getFunction();
                expect(result).toEqual(newValue);
            }

            function testSettingNewInvalidValue(invalidValue, errorString) {
                var originalValue = this.getFunction();
                expect(
                    this.setFunction.bind(this, invalidValue)
                ).toThrowError(errorString);
                var newValue = this.getFunction();
                expect(newValue).toEqual(originalValue);
            }

            function testFailValidation(valueToTest, errorString) {
                var result = this.validateFunction(valueToTest);
                expect(result.success).toBe(false);
                expect(result.errorCode).toBe(errorString);
            }

            function testSuccessfulValidation(valueToTest) {
                var result = this.validateFunction(valueToTest);
                expect(result.success).toBe(true);
            }

            describe('title', function () {

                beforeEach(function () {
                    this.invalidChars = ['<', '>'];
                    this.getFunction = documentServices.seo.title.get;
                    this.setFunction = documentServices.seo.title.set;
                    this.validateFunction = documentServices.seo.title.validate;
                });

                describe('set', function () {

                    afterAll(function () {
                        apiCoverageUtils.checkFunctionAsTested('documentServices.seo.title.set');
                    });

                    it('should successfully set a new title', function () {
                        testSuccessfullySetNewValue.call(this, 'newTitle');
                    });

                    it('should fail to set a new title that is not a string', function () {
                        testSettingNewInvalidValue.call(this, {}, 'TEXT_IS_NOT_STRING');
                    });

                    it('should fail to set a new title that contains invalid characters', function () {
                        var newInvalidTitle = 'This title has invalid chars : ' + this.invalidChars.join(' ');
                        testSettingNewInvalidValue.call(this, newInvalidTitle, 'TEXT_INVALID_CHARS');
                    });

                    it('should fail to set a new title that is too long', function () {
                        var newInvalidTitle = 'This title is too long'.repeat(20);
                        testSettingNewInvalidValue.call(this, newInvalidTitle, 'TEXT_TOO_LONG');
                    });
                });

                describe('validate', function () {

                    afterAll(function () {
                        apiCoverageUtils.checkFunctionAsTested('documentServices.seo.title.validate');
                    });

                    it('should reject everything but strings', function () {
                        testFailValidation.call(this, {}, 'TEXT_IS_NOT_STRING');
                    });

                    it('should reject invalid chars', function () {
                        var newInvalidTitle = 'This description contains invalid characters' + this.invalidChars.join(' ');
                        testFailValidation.call(this, newInvalidTitle, 'TEXT_INVALID_CHARS');
                    });

                    it('should reject very long string', function () {
                        var veryLongString = 'This is very long string.'.repeat(20);
                        testFailValidation.call(this, veryLongString, 'TEXT_TOO_LONG');
                    });
                });
            });

            describe('description', function () {

                beforeEach(function () {
                    this.invalidChars = ['<', '>'];
                    this.getFunction = documentServices.seo.description.get;
                    this.setFunction = documentServices.seo.description.set;
                    this.validateFunction = documentServices.seo.description.validate;
                });

                describe('set', function () {

                    afterAll(function () {
                        apiCoverageUtils.checkFunctionAsTested('documentServices.seo.description.set');
                    });

                    it('should successfully set a new description', function () {
                        testSuccessfullySetNewValue.call(this, 'newDescription');
                    });

                    it('should fail to set new description that is not a string', function () {
                        testSettingNewInvalidValue.call(this, {}, 'TEXT_IS_NOT_STRING');
                    });

                    it('should fail to set new description that contains invalid characters', function () {
                        var newInvalidKeywords = 'This description contains invalid characters' + this.invalidChars.join(' ');
                        testSettingNewInvalidValue.call(this, newInvalidKeywords, 'TEXT_INVALID_CHARS');
                    });

                    it('should fail to set new description that is too long', function () {
                        var newInvalidKeywords = 'This description is too long'.repeat(20);
                        testSettingNewInvalidValue.call(this, newInvalidKeywords, 'TEXT_TOO_LONG');
                    });
                });

                describe('validate', function () {

                    afterAll(function () {
                        apiCoverageUtils.checkFunctionAsTested('documentServices.seo.description.validate');
                    });

                    it('should check successful validation (empty string)', function () {
                        testSuccessfulValidation.call(this, '');
                    });

                    it('should check description validation of regular string', function () {
                        testSuccessfulValidation.call(this, 'This is regular string');
                    });

                    it('should reject everything but strings', function () {
                        testFailValidation.call(this, {}, 'TEXT_IS_NOT_STRING');
                    });

                    it('should reject invalid chars', function () {
                        var newInvalidTitle = 'This description contains invalid characters' + this.invalidChars.join(' ');
                        testFailValidation.call(this, newInvalidTitle, 'TEXT_INVALID_CHARS');
                    });

                    it('should reject very long string', function () {
                        var veryLongString = 'This is very long string.'.repeat(20);
                        testFailValidation.call(this, veryLongString, 'TEXT_TOO_LONG');
                    });
                });

            });

            describe('keywords', function () {

                beforeEach(function () {
                    this.invalidChars = [':', '/', '=', '!', '#', '$', '%', '^', '&', '(', ')'];
                    this.getFunction = documentServices.seo.keywords.get;
                    this.setFunction = documentServices.seo.keywords.set;
                    this.validateFunction = documentServices.seo.keywords.validate;
                });

                describe('set', function () {

                    afterAll(function () {
                        apiCoverageUtils.checkFunctionAsTested('documentServices.seo.keywords.set');
                    });

                    it('should fail to set new keywords that is not a string', function () {
                        testSettingNewInvalidValue.call(this, {}, 'TEXT_IS_NOT_STRING');
                    });

                    it('should fail to set new keywords that contains invalid characters', function () {
                        var newInvalidKeywords = 'ThisKeywordsContainInvalidCharacters' + this.invalidChars.join(' ');
                        testSettingNewInvalidValue.call(this, newInvalidKeywords, 'KEYWORDS_INVALID_CHARS');
                    });

                    it('should fail to set new keywords that is too long', function () {
                        var newInvalidKeywords = 'ThisKeywordsAreTooLong'.repeat(20);
                        testSettingNewInvalidValue.call(this, newInvalidKeywords, 'TEXT_TOO_LONG');
                    });

                    it('should successfully set new keywords', function () {
                        var newKeywordsArray = ['keyword1', 'keyword2', 'keyword3'];
                        var str = newKeywordsArray.join();
                        testSuccessfullySetNewValue.call(this, str);
                    });

                });

                describe('validate', function () {

                    afterAll(function () {
                        apiCoverageUtils.checkFunctionAsTested('documentServices.seo.keywords.validate');
                    });

                    it('should accept valid keywords', function () {
                        var newKeywordsArray = ['keyword1', 'keyword2', 'keyword3'];
                        var str = newKeywordsArray.join();
                        testSuccessfulValidation.call(this, str);
                    });

                    it('should reject everything but strings', function () {
                        testFailValidation.call(this, {}, 'TEXT_IS_NOT_STRING');
                    });

                    it('should reject invalid chars', function () {
                        var newInvalidTitle = 'This description contains invalid characters' + this.invalidChars.join(' ');
                        testFailValidation.call(this, newInvalidTitle, 'KEYWORDS_INVALID_CHARS');
                    });

                    it('should reject very long string', function () {
                        var veryLongString = 'ThisKeywordsAreTooLong.'.repeat(20);
                        testFailValidation.call(this, veryLongString, 'TEXT_TOO_LONG');
                    });
                });
            });

            describe('indexing', function () {

                afterAll(function () {
                    apiCoverageUtils.checkFunctionAsTested('documentServices.seo.indexing.enable');
                });

                it('verify enable function should get only a boolean', function () {
                    var str = 'someString';

                    expect(function () {
                        seo.indexing.enable(str);
                    }).toThrow(new Error('SE_ENABLE_INDEX_PARAM_IS_NOT_BOOLEN'));
                });

                it('should toggle the legal modes and verify isEnabled() return the correct mode', function () {
                    var legalModesArray = [true, false];
                    legalModesArray.forEach(function (mode) {
                        seo.indexing.enable(mode);
                        var result = seo.indexing.isEnabled();
                        expect(result).toBe(mode);
                    });

                });

            });

        });
    });
});
