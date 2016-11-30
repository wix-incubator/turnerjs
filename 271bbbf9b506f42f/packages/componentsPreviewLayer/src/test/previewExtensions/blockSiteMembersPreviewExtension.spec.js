define([
    'previewExtensionsCore',
    'componentsPreviewLayer/previewExtensions/blockSiteMembersPreviewExtension'
], function (previewExtensionsCore) {

    'use strict';
    var previewExtensionsRegistrar = previewExtensionsCore.registrar;


    describe('blockSiteMembersPreviewExtension', function () {

        var blockSiteMembersPreviewExtension;


        beforeEach(function getBlockSiteMembersPreviewExtension(done) {
            var BLOCK_SITE_MEMBERS_PREVIEW_EXTENSION_MODULE_ID =
                'componentsPreviewLayer/previewExtensions/blockSiteMembersPreviewExtension';

            require.undef(BLOCK_SITE_MEMBERS_PREVIEW_EXTENSION_MODULE_ID);

            spyOn(previewExtensionsRegistrar, 'registerCompExtension')
                .and.callFake(function (ignoredCompType, extension) {
                    blockSiteMembersPreviewExtension = extension;
                });

            require([BLOCK_SITE_MEMBERS_PREVIEW_EXTENSION_MODULE_ID], done);
        });


        describe('isPasswordProtectedDialog', function () {

            var isPasswordProtectedDialog;


            beforeEach(function () {
                isPasswordProtectedDialog = blockSiteMembersPreviewExtension.isPasswordProtectedDialog;
            });


            it('should be a function', function () {
                expect(isPasswordProtectedDialog).toEqual(jasmine.any(Function));
            });


            it('should call this.props.siteAPI.getSiteAspect', function () {
                var getSiteAspect = jasmine.createSpy('getSiteAspect').and.returnValue({});
                isPasswordProtectedDialog.call({props: {siteAPI: {getSiteAspect: getSiteAspect}}});
                expect(getSiteAspect).toHaveBeenCalled();
            });


            it('should call this.props.siteAPI.getSiteAspect with "siteMembers"', function () {
                var getSiteAspect = jasmine.createSpy('getSiteAspect').and.returnValue({});
                isPasswordProtectedDialog.call({props: {siteAPI: {getSiteAspect: getSiteAspect}}});
                expect(getSiteAspect).toHaveBeenCalledWith('siteMembers');
            });


            it('should return true if this.props.siteAPI.getSiteAspect returns {dialogToDisplay: "enterPassword"}', function () {
                var returnValue = isPasswordProtectedDialog.call({
                    props: {
                        siteAPI: {
                            getSiteAspect: function () {
                                return {dialogToDisplay: "enterPassword"};
                            }
                        }
                    }
                });
                expect(returnValue).toBe(true);
            });


            it('should return false if this.props.siteAPI.getSiteAspect returns {dialogToDisplay: "otherDialog"}', function () {
                var returnValue = isPasswordProtectedDialog.call({
                    props: {
                        siteAPI: {
                            getSiteAspect: function () {
                                return {dialogToDisplay: "otherDialog"};
                            }
                        }
                    }
                });
                expect(returnValue).toBe(false);
            });

        });


        describe('shouldBlockSubmit', function () {

            var shouldBlockSubmit;


            beforeEach(function () {
                shouldBlockSubmit = blockSiteMembersPreviewExtension.shouldBlockSubmit;
            });


            it('should call this.isPasswordProtectedDialog if this.props.siteData.renderFlags.isExternalNavigationAllowed is false', function () {
                var isPasswordProtectedDialog = jasmine.createSpy('isPasswordProtectedDialog');
                shouldBlockSubmit.call({
                    props: {siteData: {renderFlags: {isExternalNavigationAllowed: false}}},
                    isPasswordProtectedDialog: isPasswordProtectedDialog
                });
                expect(isPasswordProtectedDialog).toHaveBeenCalled();
            });


            it('should not call this.isPasswordProtectedDialog if this.props.siteData.renderFlags.isExternalNavigationAllowed is true', function () {
                var isPasswordProtectedDialog = jasmine.createSpy('isPasswordProtectedDialog');
                shouldBlockSubmit.call({
                    props: {siteData: {renderFlags: {isExternalNavigationAllowed: true}}},
                    isPasswordProtectedDialog: isPasswordProtectedDialog
                });
                expect(isPasswordProtectedDialog).not.toHaveBeenCalled();
            });


            it('should return false if this.props.siteData.renderFlags.isExternalNavigationAllowed is false and this.isPasswordProtectedDialog returns true', function () {
                var returnValue = shouldBlockSubmit.call({
                    props: {siteData: {renderFlags: {isExternalNavigationAllowed: false}}},
                    isPasswordProtectedDialog: function () {
                        return true;
                    }
                });
                expect(returnValue).toBe(false);
            });


            it('should return false if this.props.siteData.renderFlags.isExternalNavigationAllowed is false and this.isPasswordProtectedDialog returns false', function () {
                var returnValue = shouldBlockSubmit.call({
                    props: {siteData: {renderFlags: {isExternalNavigationAllowed: false}}},
                    isPasswordProtectedDialog: function () {
                        return false;
                    }
                });
                expect(returnValue).toBe(true);
            });

        });

    });

});
