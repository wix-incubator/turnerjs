define(['lodash', 'utils', 'testUtils',
        'documentServices/mockPrivateServices/privateServicesHelper',
        'definition!documentServices/siteMetadata/seo',
        'documentServices/siteMetadata/dataManipulation'], function (_, utils, testUtils, privateServicesHelper, SeoDef, dataManipulation) {
    'use strict';

    describe('siteMetadata seo sub module', function() {
        beforeEach(function() {
            var isCustomSiteModel = false;
            var isDocumentServices = true;
            var mockSiteData = testUtils.mockFactory.mockSiteData(isCustomSiteModel, isDocumentServices);
            this.mockPS = privateServicesHelper.mockPrivateServicesWithRealDAL(mockSiteData);

            this.seo = new SeoDef(_, utils, dataManipulation);
        });

        describe('enabling/disabling indexing', function() {
            it('enableIndexing with boolean param should succeed', function() {
                this.seo.indexing.enable(this.mockPS, true);
                expect(this.seo.indexing.isEnabled(this.mockPS)).toBe(true);

                this.seo.indexing.enable(this.mockPS, false);
                expect(this.seo.indexing.isEnabled(this.mockPS)).toBe(false);
            });

            it('enableIndexing with a non-boolean param should throw an error', function() {
                expect(this.seo.indexing.enable.bind(this.seo, null, 'sdf')).toThrowError(this.seo.ERRORS.SE_ENABLE_INDEX_PARAM_IS_NOT_BOOLEN);
            });

            it('getting the isIndexingEnabled should return the seo indexing status of the site', function() {
                spyOn(dataManipulation, 'getProperty').and.returnValue(true);
                expect(this.seo.indexing.isEnabled(null)).toEqual(true);
            });
        });

        describe('seo site title', function() {

            describe('valid title', function() {
                it('validating and setting the seo title with a valid string should pass', function() {
                    var validSeoTitle = 'site_title';

                    expect(this.seo.title.validate(null, validSeoTitle)).toEqual({success: true});
                    this.seo.title.set(this.mockPS, validSeoTitle);

                    expect(this.seo.title.get(this.mockPS)).toEqual(validSeoTitle);
                });

                it('getting a title should return the site seo title', function () {
                    spyOn(dataManipulation, 'getProperty').and.returnValue('site_title');
                    expect(this.seo.title.get(null)).toEqual('site_title');
                });
            });

            describe('invalid title', function() {
                beforeEach(function() {
                    spyOn(dataManipulation, 'setProperty');
                });

                it('validating and setting the seo title with non-string should fail', function() {
                    var nonStringSiteNames = [null, {}, {example: true, hello: 5}, [], [1, 2, 3], 7];

                    _.forEach(nonStringSiteNames, function(invalidSiteName) {
                        expect(this.seo.title.validate(this.mockPS, invalidSiteName)).toEqual({success: false, errorCode: this.seo.ERRORS.TEXT_IS_NOT_STRING});
                        expect(this.seo.title.set.bind(this.seo, this.mockPS, invalidSiteName)).toThrowError(this.seo.ERRORS.TEXT_IS_NOT_STRING);
                    }, this);
                    expect(dataManipulation.setProperty).not.toHaveBeenCalled();
                });

                it('validating and setting the seo title with a too long string should fail', function() {
                    var tooLongSiteName = new Array(72).join('a');

                    expect(this.seo.title.validate(null, tooLongSiteName)).toEqual({success: false, errorCode: this.seo.ERRORS.TEXT_TOO_LONG});
                    expect(this.seo.title.set.bind(this.seo, null, tooLongSiteName)).toThrowError(this.seo.ERRORS.TEXT_TOO_LONG);
                    expect(dataManipulation.setProperty).not.toHaveBeenCalled();
                });

                it('validating and setting the seo title with a string containing invalid characters should fail', function() {
                    var invalidCharsSiteNames = ['sdfsdf<', '>sdfsdfsd', 'sdf>sdfsd', '<sdf>', '>Sdfsd<we   wefwe>'];

                    _.forEach(invalidCharsSiteNames, function(invalidCharsSiteName) {
                        expect(this.seo.title.validate(null, invalidCharsSiteName)).toEqual(jasmine.objectContaining({success: false, errorCode: this.seo.ERRORS.TEXT_INVALID_CHARS}));
                        expect(this.seo.title.set.bind(this.seo, null, invalidCharsSiteName)).toThrowError(this.seo.ERRORS.TEXT_INVALID_CHARS);
                    }, this);
                    expect(dataManipulation.setProperty).not.toHaveBeenCalled();
                });
            });
        });

        describe('seo site description', function() {

            describe('when is a valid input', function() {

                it('getting a description should return the site seo description', function () {
                    this.seo.description.set(this.mockPS, 'initial_site_desc');
                    expect(this.seo.description.get(this.mockPS)).toEqual('initial_site_desc');

                    this.seo.description.set(this.mockPS, 'final site desc');
                    expect(this.seo.description.get(this.mockPS)).toEqual('final site desc');
                });

                it('validating and setting the seo description with a valid string should pass', function() {
                    var validSeoDescription = 'site_description';
                    expect(this.seo.description.validate(this.mockPS, validSeoDescription)).toEqual({success: true});

                    this.seo.description.set(this.mockPS, validSeoDescription);

                    expect(this.seo.description.get(this.mockPS)).toEqual(validSeoDescription);
                });
            });

            describe('when is NOT a valid input', function() {

                beforeEach(function() {
                    spyOn(dataManipulation, 'setProperty');
                });

                it('validating and setting the seo description with non-string should fail', function() {
                    var nonStringSiteDescriptions = [null, {}, {example: true, hello: 5}, [], [1, 2, 3], 7];

                    _.forEach(nonStringSiteDescriptions, function(invalidSiteDescription) {
                        expect(this.seo.description.validate(null, invalidSiteDescription)).toEqual({success: false, errorCode: this.seo.ERRORS.TEXT_IS_NOT_STRING});
                        expect(this.seo.description.set.bind(this.seo, null, invalidSiteDescription)).toThrowError(this.seo.ERRORS.TEXT_IS_NOT_STRING);
                    }, this);
                    expect(dataManipulation.setProperty).not.toHaveBeenCalled();
                });

                it('validating and setting the seo description with a too long string should fail', function() {
                    var tooLongSiteDescription = new Array(162).join('a');

                    expect(this.seo.description.validate(null, tooLongSiteDescription)).toEqual({success: false, errorCode: this.seo.ERRORS.TEXT_TOO_LONG});
                    expect(this.seo.description.set.bind(this.seo, null, tooLongSiteDescription)).toThrowError(this.seo.ERRORS.TEXT_TOO_LONG);
                    expect(dataManipulation.setProperty).not.toHaveBeenCalled();
                });

                it('validating and setting the seo description with a string containing invalid characters should fail', function() {
                    var invalidCharsSiteDescriptions = ['sdfsdf<', '>sdfsdfsd', 'sdf>sdfsd', '<sdf>', '>Sdfsd<we   wefwe>'];

                    _.forEach(invalidCharsSiteDescriptions, function(invalidCharsSiteDescription) {
                        expect(this.seo.description.validate(null, invalidCharsSiteDescription)).toEqual(jasmine.objectContaining({success: false, errorCode: this.seo.ERRORS.TEXT_INVALID_CHARS}));
                        expect(this.seo.description.set.bind(this.seo, null, invalidCharsSiteDescription)).toThrowError(this.seo.ERRORS.TEXT_INVALID_CHARS);
                    }, this);
                    expect(dataManipulation.setProperty).not.toHaveBeenCalled();
                });
            });
        });

        describe('seo site keywords', function() {

            describe('when input is valid', function() {
                it('getting default keywords should return an empty site seo keywords', function () {
                    expect(this.seo.keywords.get(this.mockPS)).toEqual('');
                });

                it('should add a keywords tag when trying to set one if one does not exist in the site', function(){
                    var keywordsToSet = 'some site keywords';
                    this.seo.keywords.set(this.mockPS, keywordsToSet);

                    expect(this.seo.keywords.get(this.mockPS)).toEqual(keywordsToSet);
                });

                it('validating and setting the seo keywords with a valid string should pass', function() {
                    var validSeoKeywords = 'site_keywords';

                    expect(this.seo.keywords.validate(this.mockPS, validSeoKeywords)).toEqual({success: true});
                    this.seo.keywords.set(this.mockPS, validSeoKeywords);

                    expect(this.seo.keywords.get(this.mockPS)).toEqual(validSeoKeywords);
                });
            });

            describe('when input is NOT valid', function() {

                beforeEach(function() {
                    spyOn(dataManipulation, 'setProperty');
                });

                it('validating and setting the seo keywords with non-string should fail', function() {
                    var nonStringSeoKeywordsSet = [null, {}, {example: true, hello: 5}, [], [1, 2, 3], 7];

                    _.forEach(nonStringSeoKeywordsSet, function(invalidSeoKeywords) {
                        expect(this.seo.keywords.validate(null, invalidSeoKeywords)).toEqual({success: false, errorCode: this.seo.ERRORS.TEXT_IS_NOT_STRING});
                        expect(this.seo.keywords.set.bind(this.seo, null, invalidSeoKeywords)).toThrowError(this.seo.ERRORS.TEXT_IS_NOT_STRING);
                    }, this);
                    expect(dataManipulation.setProperty).not.toHaveBeenCalled();
                });

                it('validating and setting the seo keywords with a too long string should fail', function() {
                    var tooLongSeoKeywords = new Array(252).join('a');

                    expect(this.seo.keywords.validate(null, tooLongSeoKeywords)).toEqual({success: false, errorCode: this.seo.ERRORS.TEXT_TOO_LONG});
                    expect(this.seo.keywords.set.bind(this.seo, null, tooLongSeoKeywords)).toThrowError(this.seo.ERRORS.TEXT_TOO_LONG);
                    expect(dataManipulation.setProperty).not.toHaveBeenCalled();
                });

                it('validating and setting the seo keywords with a string containing invalid characters should fail', function() {
                    var invalidCharsSeoKeywordsSet = ['!dsd  ', 'ds#F', 'f$', '___ %---', '^r jh^', '&', '(', ')', '+', '=', '[', ']', '}', '{', '"', ';', ':', '/', '<', '>', '~'];

                    _.forEach(invalidCharsSeoKeywordsSet, function(invalidCharsSeoKeywords) {
                        expect(this.seo.keywords.validate(this.mockPS, invalidCharsSeoKeywords)).toEqual(jasmine.objectContaining({success: false, errorCode: this.seo.ERRORS.KEYWORDS_INVALID_CHARS}));
                        expect(this.seo.keywords.set.bind(this.seo, this.mockPS, invalidCharsSeoKeywords)).toThrowError(this.seo.ERRORS.KEYWORDS_INVALID_CHARS);
                    }, this);
                    expect(dataManipulation.setProperty).not.toHaveBeenCalled();
                });
            });
        });

        describe('seo site header tags', function() {
            var spyOnAjax;
            var onSuccess, onError;
            var SUCCESS_OBJECT = {"errorCode": 0, "errorDescription": "OK", "success": true};
            var FAIL_OBJECT_INVALID_CODE = {
                "errorCode": -10130,
                "errorDescription": "[runtime][ERROR][ValidateHeadTags] c.w.h.e.v.h.HeadTagsValidationFailedException - Head tags validation failed due to the following violations: One (or more) of the tags is broken, '#text' tags are not allowed. Original request was: < meta",
                "success": false
            };
            var FAIL_OBJECT_INVALID_TAG = {
                "errorCode": -10130,
                "errorDescription": "[runtime][ERROR][ValidateHeadTags] c.w.h.e.v.h.HeadTagsValidationFailedException - Head tags validation failed due to the following violations: One (or more) of the tags is broken, 'meta<' tags are not allowed. Original request was: <meta",
                "success": false
            };
            var FAIL_OBJECT_INVALID_VALUE = {
                "errorCode": -10130,
                "errorDescription": "[business][ERROR][ValidateHeadTags] c.w.h.e.v.h.HeadTagsValidationFailedException - Head tags validation failed due to the following violations: Meta tags with attribute name and value robots are not allowed. Original request was: <meta",
                "success": false
            };
            var INVALID_TAG = 'meta<';

            beforeEach(function() {
                spyOnAjax = function(isSuccess, resultObject) {
                    spyOn(utils.ajaxLibrary, 'ajax').and.callFake(function(requestObject) {
                        var onServerValidationSuccess = requestObject.success;
                        var onServerValidationError = requestObject.success;

                        if (isSuccess) {
                            onServerValidationSuccess(resultObject);
                        } else {
                            onServerValidationError(resultObject);
                        }
                    });
                };

                onSuccess = jasmine.createSpy();
                onError = jasmine.createSpy();
            });

            describe('when input is valid', function() {
                it('validating and setting the seo meta tags with a valid string should pass', function() {
                    var validSeoHeadTags = '<meta tags> ' +
                                            '<link rel="apple-touch" sizes=114x114 href="https://static.server.com/media/1234.jpg?db=icon.png" /> ' +
                                            '<!-- This is a comment which should be valid in the HTML Header Tags -->';
                    spyOnAjax(true, SUCCESS_OBJECT);

                    this.seo.headTags.set(this.mockPS, validSeoHeadTags, onSuccess, onError);
                    expect(onSuccess).toHaveBeenCalled();
                    expect(this.seo.headTags.get(this.mockPS)).toEqual(validSeoHeadTags);
                    onError.calls.reset();
                });

                it('validating and setting the seo meta tags with "robots" value meta tag should fail', function() {
                    var invalidSeoHeadTags = '<meta name="robots" content="noindex">';
                    spyOnAjax(false, FAIL_OBJECT_INVALID_VALUE);

                    this.seo.headTags.set(this.mockPS, invalidSeoHeadTags, onSuccess, onError);

                    expect(onError).toHaveBeenCalled();
                });

                it('should set a meta tag containing "~" and "-" chars successfully (CLNT-6076)', function() {
                    spyOnAjax(true, SUCCESS_OBJECT);

                    var metaTagToSet = '<Meta property="og:image" ' +
                        'content="https://static.wixstatic.com/media/726e3c_98227c7df36d4041a7f9d678942bdaf5~mv1.jpg/' +
                        'v1/fit/w_1200,h_803/726e3c_98227c7df36d4041a7f9d678942bdaf5~mv-1.jpg" />';

                    this.seo.headTags.set(this.mockPS, metaTagToSet, onSuccess, onError);
                    expect(onSuccess).toHaveBeenCalled();
                    expect(onError).not.toHaveBeenCalled();

                    expect(this.seo.headTags.get(this.mockPS)).toContain(metaTagToSet);
                });

                it('should set a valid meta tag with special chars successfully (SE-11198)', function() {
                    spyOnAjax(true, SUCCESS_OBJECT);
                    var specialChars = '&!?;';
                    var validMetaTag = '<MeTa name="abc" content="start-' + specialChars + '-end">';

                    this.seo.headTags.set(this.mockPS, validMetaTag, onSuccess, onError);

                    expect(this.seo.headTags.get(this.mockPS)).toEqual(validMetaTag);
                    expect(onSuccess).toHaveBeenCalled();
                    expect(onError).not.toHaveBeenCalled();
                });
            });

            describe('when input is NOT valid', function() {

                beforeEach(function() {
                    spyOn(dataManipulation, 'setProperty');
                });

                it('validating and setting the seo meta tags with non-string should fail', function() {
                    spyOnAjax(true, SUCCESS_OBJECT);
                    var nonStringSeoHeadTagsSet = [null, {}, {example: true, hello: 5}, [], [1, 2, 3], 7];

                    _.forEach(nonStringSeoHeadTagsSet, function(invalidSeoHeadTags) {
                        this.seo.headTags.set(null, invalidSeoHeadTags, onSuccess, onError);
                        expect(onError).toHaveBeenCalledWith(this.seo.ERRORS.TEXT_IS_NOT_STRING);
                        expect(dataManipulation.setProperty).not.toHaveBeenCalled();
                        onError.calls.reset();
                    }, this);
                });

                it('should fail when SEO Meta Tags are an empty string', function() {
                    spyOnAjax(true, SUCCESS_OBJECT);
                    var emptyHeaderTags = '';

                    this.seo.headTags.set(null, emptyHeaderTags, onSuccess, onError);

                    expect(dataManipulation.setProperty).toHaveBeenCalled();
                    expect(onError).toHaveBeenCalledWith(this.seo.ERRORS.METATAGS_INVALID_FORMAT);
                    expect(utils.ajaxLibrary.ajax).not.toHaveBeenCalled();
                });

                it('validating and setting the seo meta tags with a too long string should fail', function() {
                    spyOnAjax(true, SUCCESS_OBJECT);
                    var tooLongSeoHeadTags = new Array(2002).join('a');

                    this.seo.headTags.set(null, tooLongSeoHeadTags, onSuccess, onError);
                    expect(onError).toHaveBeenCalledWith(this.seo.ERRORS.TEXT_TOO_LONG);
                    expect(dataManipulation.setProperty).not.toHaveBeenCalled();
                });

                it('validating and setting the seo meta tags with a string containing invalid format should fail', function() {
                    spyOnAjax(true, SUCCESS_OBJECT);
                    var invalidCharsSeoHeadTagsSet = ['rggtrg', 'sfsdf>', ' dfgfg', '>meta>'];

                    _.forEach(invalidCharsSeoHeadTagsSet, function(invalidCharsSeoHeadTags) {
                        this.seo.headTags.set(null, invalidCharsSeoHeadTags, onSuccess, onError);
                        expect(onError).toHaveBeenCalledWith(this.seo.ERRORS.METATAGS_INVALID_FORMAT);
                        expect(dataManipulation.setProperty).not.toHaveBeenCalled();
                        onError.calls.reset();
                    }, this);
                });

                it('validating and setting the seo meta tags with a string that fails the server CODE validation should fail', function() {
                    spyOnAjax(false, FAIL_OBJECT_INVALID_CODE);
                    var invalidServerHeadTags = '<meta key="server-content-to-fail-validation?/">';

                    this.seo.headTags.set(null, invalidServerHeadTags, onSuccess, onError);
                    expect(onError).toHaveBeenCalledWith(this.seo.ERRORS.METATAGS_SERVER_INVALID_CODE);
                    expect(dataManipulation.setProperty).not.toHaveBeenCalled();
                });

                it('validating and setting the seo meta tags with a string that fails the server TAG validation should fail', function() {
                    spyOnAjax(false, FAIL_OBJECT_INVALID_TAG);
                    var invalidServerHeadTags = '<meta key="server-content-to-fail-validation?/">';

                    this.seo.headTags.validate(null, invalidServerHeadTags, onSuccess, onError);
                    expect(onError).toHaveBeenCalledWith({success: false, errorCode: this.seo.ERRORS.METATAGS_SERVER_INVALID_TAG, errorContent: INVALID_TAG});

                    this.seo.headTags.set(null, invalidServerHeadTags, onSuccess, onError);
                    expect(onError).toHaveBeenCalledWith(this.seo.ERRORS.METATAGS_SERVER_INVALID_TAG);
                    expect(dataManipulation.setProperty).not.toHaveBeenCalled();
                });
            });

            it('getting a meta tags should return the site seo meta tags', function () {
                spyOn(dataManipulation, 'getProperty').and.returnValue('site_meta_tags');
                expect(this.seo.headTags.get(null)).toEqual('site_meta_tags');
            });
        });

        describe('seo redirect urls', function() {
            it('validating and updating the redirect urls with valid ones merges the new with the old', function () {
                spyOn(dataManipulation, 'setProperty');
                var existingRedirectUrls = [
                    {fromExternalUri: 'from_url_different_key', toWixUri: 'old_to_url'},
                    {fromExternalUri: 'from_url_same_key_should_override', toWixUri: 'old_to_url'}
                ];
                var validRedirectUrls = {
                    'from_url_same_key_should_override': 'new_to_url',
                    'from_url_new_key': 'new_to_url'
                };
                var expectedResultRedirectUrls = [
                    {fromExternalUri: 'from_url_different_key', toWixUri: 'old_to_url'},
                    {fromExternalUri: 'from_url_same_key_should_override', toWixUri: 'new_to_url'},
                    {fromExternalUri: 'from_url_new_key', toWixUri: 'new_to_url'}
                ];
                spyOn(dataManipulation, 'getProperty').and.returnValue(existingRedirectUrls);

                expect(this.seo.redirectUrls.validate(this.mockPS, validRedirectUrls)).toEqual({success: true});
                this.seo.redirectUrls.update(this.mockPS, validRedirectUrls);

                expect(dataManipulation.setProperty.calls.count()).toEqual(1);
                expect(dataManipulation.setProperty.calls.argsFor(0)[2]).toEqual(expectedResultRedirectUrls);
            });

            describe('when input is NOT valid', function() {
                beforeEach(function() {
                    spyOn(dataManipulation, 'setProperty');
                });

                it('validating and setting the redirect urls with non-object should fail', function () {
                    var nonObjectRedirectUrlsSet = [null, '', 7, undefined];

                    _.forEach(nonObjectRedirectUrlsSet, function (invalidRedirectUrls) {
                        expect(this.seo.redirectUrls.validate(null, invalidRedirectUrls)).toEqual({success: false, errorCode: this.seo.ERRORS.REDIRECT_URI_MAPPING_IS_NOT_OBJECT});
                        expect(this.seo.redirectUrls.update.bind(this.seo, null, invalidRedirectUrls)).toThrowError(this.seo.ERRORS.REDIRECT_URI_MAPPING_IS_NOT_OBJECT);
                    }, this);
                    expect(dataManipulation.setProperty).not.toHaveBeenCalled();
                });

                it('validating and setting the redirect urls with an object of non-string keys + values should fail', function () {
                    var nonStringRedirectUrls = {'kel': 4};
                    expect(this.seo.redirectUrls.validate(null, nonStringRedirectUrls)).toEqual({success: false, errorCode: this.seo.ERRORS.REDIRECT_MAPPING_URIS_NOT_STRING});
                    expect(this.seo.redirectUrls.update.bind(this.seo, null, nonStringRedirectUrls)).toThrowError(this.seo.ERRORS.REDIRECT_MAPPING_URIS_NOT_STRING);
                    expect(dataManipulation.setProperty).not.toHaveBeenCalled();
                });

                it('validating and setting the redirect urls with too long from-urls should fail', function () {
                    var nonStringRedirectUrls = {};
                    nonStringRedirectUrls[new Array(151).join('a')] = 'to-url';
                    expect(this.seo.redirectUrls.validate(null, nonStringRedirectUrls)).toEqual({success: false, errorCode: this.seo.ERRORS.TEXT_TOO_LONG});
                    expect(this.seo.redirectUrls.update.bind(this.seo, null, nonStringRedirectUrls)).toThrowError(this.seo.ERRORS.TEXT_TOO_LONG);
                    expect(dataManipulation.setProperty).not.toHaveBeenCalled();
                });

                it('validating and setting redirect urls containing invalid characters should fail', function() {
                    var invalidRedirectUrlsSet = [{'`': 'to-url'}, {'|': 'to-url'}, {'<': 'to-url'}, {'>': 'to-url'}];

                    _.forEach(invalidRedirectUrlsSet, function(invalidRedirectUrls) {
                        expect(this.seo.redirectUrls.validate(null, invalidRedirectUrls)).toEqual(jasmine.objectContaining({success: false, errorCode: this.seo.ERRORS.REDIRECT_INVALID_CHARS}));
                        expect(this.seo.redirectUrls.update.bind(this.seo, null, invalidRedirectUrls)).toThrowError(this.seo.ERRORS.REDIRECT_INVALID_CHARS);
                    }, this);
                    expect(dataManipulation.setProperty).not.toHaveBeenCalled();
                });

                it('removing non-object redirect urls should throw error', function () {
                    var nonArrayFromUrisSet = [{}, {'hello': true, 'example': 5}, 'sdfsd', 4, arguments];
                    _.forEach(nonArrayFromUrisSet, function(nonArrayFromUris) {
                        expect(this.seo.redirectUrls.remove.bind(this.seo, null, nonArrayFromUris)).toThrowError(this.seo.ERRORS.REDIRECT_FROM_URIS_IS_NOT_ARRAY);

                    }, this);
                    expect(dataManipulation.setProperty).not.toHaveBeenCalled();
                });
            });

            it('removing valid redirect urls should succeed', function () {
                spyOn(dataManipulation, 'setProperty');
                spyOn(dataManipulation, 'getProperty').and.returnValue([
                    {fromExternalUri: 'from-uri1', toWixUri: 'to-uri1'},
                    {fromExternalUri: 'from-uri2', toWixUri: 'to-uri2'},
                    {fromExternalUri: 'from-uri3', toWixUri: 'to-uri3'},
                    {fromExternalUri: 'from-uri4', toWixUri: 'to-uri4'}
                ]);

                var validRedirectFromUris = ['from-uri2', 'from-uri4'];
                this.seo.redirectUrls.remove(this.mockPS, validRedirectFromUris);
                expect(dataManipulation.setProperty).toHaveBeenCalledWith(this.mockPS, dataManipulation.PROPERTY_NAMES.EXTERNAL_URI_MAPPINGS, [
                    {fromExternalUri: 'from-uri1', toWixUri: 'to-uri1'},
                    {fromExternalUri: 'from-uri3', toWixUri: 'to-uri3'}
                ]);
            });

            it('getting the redirect urls should return the site redirect urls', function () {
                spyOn(dataManipulation, 'getProperty').and.returnValue([{fromExternalUri: 'from_url', toWixUri: 'to_url'}]);
                expect(this.seo.redirectUrls.get(null)).toEqual({'from_url': 'to_url'});
            });
        });
    });
});
