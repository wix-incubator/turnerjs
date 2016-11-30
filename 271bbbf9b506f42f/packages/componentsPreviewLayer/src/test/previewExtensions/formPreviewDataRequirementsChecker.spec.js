define([
    'lodash',
    'testUtils',
    'utils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'componentsPreviewLayer/bi/errors',
    'componentsPreviewLayer/previewExtensions/formPreviewDataRequirementsChecker'
], function (_, testUtils, utils, privateServicesHelper, biErrors, formPreviewDataRequirementsChecker) {
    'use strict';

    describe('formPreviewDataRequirementsChecker', function () {

        beforeEach(function () {
            this.mockSiteData = testUtils.mockFactory.mockSiteData();
            this.currentPageId = this.mockSiteData.getCurrentUrlPageId();
            this.CFStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.ContactForm', this.mockSiteData, this.currentPageId);
            this.SFStructure = testUtils.mockFactory.mockComponent('wysiwyg.common.components.subscribeform.viewer.SubscribeForm', this.mockSiteData, this.currentPageId);
            this.siteId = 'bac442c8-b7fd-4bd1-ac7e-096fec2fc800';
            this.host = 'editor.wix.com';
            this.mockSiteData.setSiteId(this.siteId).updateCurrentUrl({host: this.host});
            this.ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
            this.encryptedEmail = '58e43dcf0e53bb87cc32a2025362a88a';
        });

        describe('contact form', function () {
            it('should return one request descriptor if only one field is encrypted', function () {
                var dataItem = testUtils.mockFactory.dataMocks.contactFormData({toEmailAddress: this.encryptedEmail});
                var compInfo = {
                    id: this.CFStructure.id,
                    data: dataItem,
                    properties: {},
                    skin: '',
                    pageId: this.currentPageId
                };
                var destPath = ['contactforms_metadata', dataItem.id];

                var actualResult = formPreviewDataRequirementsChecker.formRequestGetter(this.mockSiteData, compInfo);

                var expectedRequest = {
                    url: '//' + this.host + '/html/email/decrypt/' + this.encryptedEmail + '/' + this.siteId,
                    destination: destPath,
                    force: true,
                    transformFunc: jasmine.any(Function),
                    error: jasmine.any(Function),
                    timeout: 1
                };

                expect(_.isArray(actualResult)).toBe(true);
                expect(actualResult.length).toEqual(1);
                expect(_.first(actualResult)).toEqual(expectedRequest);
            });

            it('should return 2 requests in case 2 fields are encrypted', function(){
                var dataItem = testUtils.mockFactory.dataMocks.contactFormData({toEmailAddress: this.encryptedEmail, bccEmailAddress: this.encryptedEmail});
                var compInfo = {
                    id: this.CFStructure.id,
                    data: dataItem,
                    properties: {},
                    skin: '',
                    pageId: this.currentPageId
                };
                var toEmailDestPath = ['contactforms_metadata', dataItem.id];
                var bccEmailDestPath = ['contactforms_metadata', dataItem.id];

                var actualResult = formPreviewDataRequirementsChecker.formRequestGetter(this.mockSiteData, compInfo);

                var expectedRequest = {
                    url: '//' + this.host + '/html/email/decrypt/' + this.encryptedEmail + '/' + this.siteId,
                    force: true,
                    transformFunc: jasmine.any(Function),
                    error: jasmine.any(Function),
                    timeout: 1
                };

                expect(_.isArray(actualResult)).toBe(true);
                expect(actualResult.length).toEqual(2);
                expect(actualResult).toEqual([_.assign({destination: toEmailDestPath}, expectedRequest),
                                              _.assign({destination: bccEmailDestPath}, expectedRequest)]);

            });

            it('transform func should extract email from payload', function(){
                var dataItem = testUtils.mockFactory.dataMocks.contactFormData({toEmailAddress: this.encryptedEmail});
                var compInfo = {
                    id: this.CFStructure.id,
                    data: dataItem,
                    properties: {},
                    skin: '',
                    pageId: this.currentPageId
                };
                var actualResult = formPreviewDataRequirementsChecker.formRequestGetter(this.mockSiteData, compInfo);

                var payloadObj = {payload: {email: 'shraga@wix.com'}};
                expect(_.first(actualResult).transformFunc(payloadObj)).toEqual({toEmailAddress: payloadObj.payload.email});
            });

            it('should return an empty array if email is already encrypted', function () {
                var dataItem = testUtils.mockFactory.dataMocks.contactFormData({toEmailAddress: 'shraga@wix.com'});
                var compInfo = {
                    id: this.SFStructure.id,
                    data: dataItem,
                    properties: {},
                    skin: '',
                    pageId: this.currentPageId
                };

                var actualResult = formPreviewDataRequirementsChecker.formRequestGetter(this.mockSiteData, compInfo);

                expect(actualResult).toEqual([]);
            });

            it('should return an empty array if email contain special characters and is already encrypted', function () {
                var dataItem = testUtils.mockFactory.dataMocks.contactFormData({toEmailAddress: 'bmh.manutenção@gmail.com'});
                var compInfo = {
                    id: this.SFStructure.id,
                    data: dataItem,
                    properties: {},
                    skin: '',
                    pageId: this.currentPageId
                };

                var actualResult = formPreviewDataRequirementsChecker.formRequestGetter(this.mockSiteData, compInfo);

                expect(actualResult).toEqual([]);
            });

            it('should return an empty array if email is an empty string', function(){
                var dataItem = testUtils.mockFactory.dataMocks.contactFormData({toEmailAddress: ''});
                var compInfo = {
                    id: this.SFStructure.id,
                    data: dataItem,
                    properties: {},
                    skin: '',
                    pageId: this.currentPageId
                };

                var actualResult = formPreviewDataRequirementsChecker.formRequestGetter(this.mockSiteData, compInfo);

                expect(actualResult).toEqual([]);
            });

            it('should return an empty array if this email already returned an error', function(){
                var dataItem = testUtils.mockFactory.dataMocks.contactFormData({toEmailAddress: 'notValidEncryptedEmail'});
                var compInfo = {
                    id: this.SFStructure.id,
                    data: dataItem,
                    properties: {},
                    skin: '',
                    pageId: this.currentPageId
                };

                var firstRequest = formPreviewDataRequirementsChecker.formRequestGetter(this.mockSiteData, compInfo);
                _.first(firstRequest).error(null, {'errorCode': -12, 'errorDescription': 'Session has expired'});
                var secondRequest = formPreviewDataRequirementsChecker.formRequestGetter(this.mockSiteData, compInfo);

                expect(secondRequest).toEqual([]);
            });

            it('should report BI in case an error occurred', function(){
                var fieldValue = 'notValidEncryptedEmail';
                var dataItem = testUtils.mockFactory.dataMocks.contactFormData({toEmailAddress: fieldValue});
                var compInfo = {
                    id: this.SFStructure.id,
                    data: dataItem,
                    properties: {},
                    skin: '',
                    pageId: this.currentPageId
                };
                spyOn(utils.logger, 'reportBI').and.callThrough();

                var firstRequest = formPreviewDataRequirementsChecker.formRequestGetter(this.mockSiteData, compInfo);
                _.first(firstRequest).error(null, {'errorCode': -12, 'errorDescription': 'Session has expired'});

                expect(utils.logger.reportBI).toHaveBeenCalledWith(this.mockSiteData, biErrors.CONTACT_FORM_EMAIL_DECRYPT_FAILURE, {
                    dataFieldName: 'toEmailAddress',
                    originalMail: fieldValue,
                    errorMsg: 'Server could not decrypt user email'
                });
            });

        });

        describe('subscribe form', function () {

            it('should return request descriptor', function () {
                var dataItem = testUtils.mockFactory.dataMocks.subscribeFormData({toEmailAddress: this.encryptedEmail});
                var compInfo = {
                    id: this.SFStructure.id,
                    data: dataItem,
                    properties: {},
                    skin: '',
                    pageId: this.currentPageId
                };
                var destPath = ['contactforms_metadata', dataItem.id];

                var actualResult = formPreviewDataRequirementsChecker.formRequestGetter(this.mockSiteData, compInfo);

                var expectedResult = {
                    url: '//' + this.host + '/html/email/decrypt/' + this.encryptedEmail + '/' + this.siteId,
                    destination: destPath,
                    force: true,
                    transformFunc: jasmine.any(Function),
                    error: jasmine.any(Function),
                    timeout: 1
                };

                expect(_.isArray(actualResult)).toBe(true);
                expect(actualResult.length).toEqual(1);
                expect(_.first(actualResult)).toEqual(expectedResult);
            });

            it('transform func should extract email from payload', function(){
                var dataItem = testUtils.mockFactory.dataMocks.subscribeFormData({toEmailAddress: this.encryptedEmail});
                var compInfo = {
                    id: this.SFStructure.id,
                    data: dataItem,
                    properties: {},
                    skin: '',
                    pageId: this.currentPageId
                };
                var actualResult = formPreviewDataRequirementsChecker.formRequestGetter(this.mockSiteData, compInfo);

                var payloadObj = {payload: {email: 'shraga@wix.com'}};
                expect(_.first(actualResult).transformFunc(payloadObj)).toEqual({toEmailAddress: payloadObj.payload.email});
            });

            it('should return an empty array if email is already encrypted', function () {
                var dataItem = testUtils.mockFactory.dataMocks.subscribeFormData({toEmailAddress: 'shraga@wix.com'});
                var compInfo = {
                    id: this.SFStructure.id,
                    data: dataItem,
                    properties: {},
                    skin: '',
                    pageId: this.currentPageId
                };

                var actualResult = formPreviewDataRequirementsChecker.formRequestGetter(this.mockSiteData, compInfo, {pageId: this.currentPageId});

                expect(actualResult).toEqual([]);
            });
        });

    });

});


