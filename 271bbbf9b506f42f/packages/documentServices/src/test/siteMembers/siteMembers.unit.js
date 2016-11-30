define([
    'documentServices/siteMembers/siteMembers',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'testUtils',
    'utils'
], function (siteMembers, privateServicesHelper, testUtils, utils) {
    'use strict';

    describe('Site Members - Units', function () {

        var ps;
        var ajaxSpy;
        var metaSiteId = 'MOCK-META-SITE-ID';

        beforeEach(function () {
            ajaxSpy = spyOn(utils.ajaxLibrary, 'ajax');
            var siteModel = {
                rendererModel: {
                    metaSiteId: metaSiteId,
                    clientSpecMap: {
                        13: {
                            type: 'sitemembers',
                            applicationId: 13,
                            collectionType: 'ApplyForMembership',
                            collectionFormFace: 'Register',
                            smcollectionId: '59003ee0-78b0-4a3e-ba1a-21c8ea12dac3'
                        }
                    }
                }
            };
            ps = privateServicesHelper.mockPrivateServicesWithRealDAL(testUtils.mockFactory.mockSiteData(siteModel));
        });

        describe('Auto Approval', function () {

            function getLatsAjaxOptions() {
                return ajaxSpy.calls.mostRecent().args[0];
            }

            it('should use contact settings endpoint', function () {
                siteMembers.setAutoApproval(ps, true);

                var latsAjaxOptions = getLatsAjaxOptions();
                expect(latsAjaxOptions.url).toEqual('/_api/wix-contacts-webapp/dashboard/metasites/' + metaSiteId + '/settings');
            });

            it('should send autoApproval value to endpoint', function () {
                siteMembers.setAutoApproval(ps, true);

                var latsAjaxOptions = getLatsAjaxOptions();
                expect(latsAjaxOptions.data).toEqual({autoApprove: true});
            });

            it('should call onSuccess', function () {
                ajaxSpy.and.callFake(function (options) {
                    options.success();
                });

                var onSuccess = jasmine.createSpy('onSuccess');

                siteMembers.setAutoApproval(ps, true, onSuccess);

                expect(onSuccess).toHaveBeenCalled();
            });

            it('should call onError', function () {
                ajaxSpy.and.callFake(function (options) {
                    options.error();
                });

                var onError = jasmine.createSpy('onError');

                siteMembers.setAutoApproval(ps, true, null, onError);

                expect(onError).toHaveBeenCalled();
            });

            it('should get the autoApproval value', function () {
                expect(siteMembers.isAutoApproval(ps)).toBe(false);
            });

        });

        describe('First Dialog', function () {

            it('should get the default info from masterPage', function () {
                expect(siteMembers.isLoginDialogFirst(ps)).toBe(false);
            });

            it('should set smFirstDialogLogin property in masterPage', function () {
                siteMembers.setLoginDialogFirst(ps, true);

                expect(siteMembers.isLoginDialogFirst(ps)).toBe(true);
            });

        });

        describe('Social Login', function () {

            var enabled = true, disabled = false;

            function isGoogleEnabled() {
                return siteMembers.isSocialLoginEnabled(ps, 'google');
            }

            function isFacebookEnabled() {
                return siteMembers.isSocialLoginEnabled(ps, 'facebook');
            }

            it('should show disabled if no value was set', function () {
                expect(isGoogleEnabled()).toBe(disabled);
                expect(isFacebookEnabled()).toBe(disabled);
            });

            it('should properly enable/disable vendors', function () {

                siteMembers.setSocialLoginVendorStatus(ps, 'google', enabled);
                expect(isGoogleEnabled()).toBe(enabled);

                siteMembers.setSocialLoginVendorStatus(ps, 'google', disabled);
                expect(isGoogleEnabled()).toBe(disabled);

                siteMembers.setSocialLoginVendorStatus(ps, 'facebook', enabled);
                expect(isFacebookEnabled()).toBe(enabled);

                siteMembers.setSocialLoginVendorStatus(ps, 'facebook', disabled);
                expect(isFacebookEnabled()).toBe(disabled);
            });

        });

    });
});
