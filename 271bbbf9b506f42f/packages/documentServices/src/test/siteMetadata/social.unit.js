define(['lodash', 'definition!documentServices/siteMetadata/social', 'fake!documentServices/siteMetadata/dataManipulation'], function (_, SocialModuleDef, fakeDataManipulation) {
    'use strict';
    describe('social sub module', function() {
        beforeEach(function() {
            fakeDataManipulation.PROPERTY_NAMES = {
                SOCIAL_THUMBNAIL: 'thumbnail_path',
                META_TAGS: 'meta_tags_path'
            };

            this.social = new SocialModuleDef(_, fakeDataManipulation);

            spyOn(fakeDataManipulation, 'setProperty').and.stub();
        });

        describe('facebook thumbnail manipulation', function() {
            it('setting valid thumbnail should succeed', function () {
                var validThumbnail = 'http://thumbnail.com';

                this.social.facebook.setThumbnail(null, validThumbnail);

                expect(fakeDataManipulation.setProperty).toHaveBeenCalledWith(null, fakeDataManipulation.PROPERTY_NAMES.SOCIAL_THUMBNAIL, validThumbnail);
            });

            it('setting a non-string thumbnail should throw error', function () {
                var invalidThumbnails = [{}, {example: true, hello: 5}, [], [4, 3, false], 4, true];

                _.forEach(invalidThumbnails, function (invalidThumbnail) {
                    expect(this.social.facebook.setThumbnail.bind(this.social, null, invalidThumbnail)).toThrowError(this.social.facebook.ERRORS.FB_THUMBNAIL_IS_NOT_STRING);
                }, this);

                expect(fakeDataManipulation.setProperty).not.toHaveBeenCalled();
            });

            it('getting the current facebook thumbnail', function() {
                spyOn(fakeDataManipulation, 'getProperty').and.returnValue('facebook_thumbnail');
                expect(this.social.facebook.getThumbnail(null)).toEqual('facebook_thumbnail');
            });
        });

        describe('facebook name manipulation', function() {
            it('validating and setting a valid facebook user name', function() {
                var validFbUserName = 'example.name';
                spyOn(fakeDataManipulation, 'getProperty').and.returnValue([{name: 'fb_admins_meta_tag', value:''}]);

                var validationResult = this.social.facebook.validateUsername(null, validFbUserName);
                this.social.facebook.setUsername(null, validFbUserName);

                expect(validationResult).toEqual({success: true});
                expect(fakeDataManipulation.setProperty).toHaveBeenCalledWith(null, fakeDataManipulation.PROPERTY_NAMES.META_TAGS, [{name: 'fb_admins_meta_tag', value: validFbUserName}]);
            });

            it('validating and setting a non-string facebook user name should throw error', function() {
                var nonStringFbNames = [[], [1, 3, false, 'sd'], {}, {example: true, hello: 5}, 34, true];

                _.forEach(nonStringFbNames, function(nonStringFbName) {
                    expect(this.social.facebook.validateUsername(null, nonStringFbName)).toEqual({success: false, errorCode: this.social.facebook.ERRORS.FB_USERNAME_IS_NOT_STRING});
                    expect(this.social.facebook.setUsername.bind(this.social, null, nonStringFbName)).toThrowError(this.social.facebook.ERRORS.FB_USERNAME_IS_NOT_STRING);
                }, this);
                expect(fakeDataManipulation.setProperty).not.toHaveBeenCalled();
            });

            it('validating and setting a too long facebook user name should throw error', function() {
                var tooLongFbName = new Array(252).join('a');

                expect(this.social.facebook.validateUsername(null, tooLongFbName)).toEqual({success: false, errorCode: this.social.facebook.ERRORS.FB_USERNAME_TOO_LONG});
                expect(this.social.facebook.setUsername.bind(this.social, null, tooLongFbName)).toThrowError(this.social.facebook.ERRORS.FB_USERNAME_TOO_LONG);
                expect(fakeDataManipulation.setProperty).not.toHaveBeenCalled();
            });

            it('validating and setting a facebook user name with invalid chars should throw error', function() {
                var invalidCharsFbNames = ['cdscs@example', '#', '$', '%fd', '^', '&', '*', '(', ')', '[', ']', '-', '=', '+', '!', '~', '`', '"', "'", '|', '\\', '/', ';', ':', ',', '<', '>'];

                _.forEach(invalidCharsFbNames, function(invalidCharsFbName) {
                    expect(this.social.facebook.validateUsername(null, invalidCharsFbName)).toEqual(jasmine.objectContaining({success: false, errorCode: this.social.facebook.ERRORS.FB_USERNAME_INVALID_CHARS}));
                    expect(this.social.facebook.setUsername.bind(this.social, null, invalidCharsFbName)).toThrowError(this.social.facebook.ERRORS.FB_USERNAME_INVALID_CHARS);
                }, this);
                expect(fakeDataManipulation.setProperty).not.toHaveBeenCalled();
            });

            it('getting the current facebook user name', function() {
                spyOn(fakeDataManipulation, 'getProperty').and.returnValue([{name: 'fb_admins_meta_tag', value:'facebook_username'}]);
                expect(this.social.facebook.getUsername(null)).toEqual('facebook_username');
            });
        });
    });
});
