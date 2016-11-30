define(['lodash', 'coreUtils', 'definition!dataFixer/plugins/contactFormDataFixer', 'testUtils'], function (_, coreUtils, contactFormDataFixerDefinition, testUtils) {
    'use strict';

    describe('contactFormDataFixer spec', function () {
        var mockPageJson;
        var contactFormDataFixer;
        var siteDataMock;
        var mockTranslations = {
            contactFormTranslations: {
                de: {
                    phoneFieldLabel: 'Telefon'
                }
            }
        };

        function setDocumentType(type) {
            _.merge(window, {rendererModel: {siteInfo: {documentType: type}}});
        }

        beforeEach(function () {
            mockPageJson = {
                data: {
                    document_data: {
                        contactFormData: {
                            type: 'ContactForm',
                            phoneFieldLabel: 'phone',
                            foo: 'bar'
                        },
                        otherDataType: {
                            type: 'foo'
                        }
                    }
                }
            };
        });


        beforeEach(function () {
            contactFormDataFixer = contactFormDataFixerDefinition(_, coreUtils, mockTranslations);
            siteDataMock = testUtils.mockFactory.mockSiteData();
        });

        afterEach(function () {
            setDocumentType('');
        });

        it('should do nothing if site is not a template', function () {
            setDocumentType('not Template');
            spyOn(coreUtils.wixUserApi, 'getLanguage').and.returnValue('de');
            contactFormDataFixer.exec(mockPageJson, [], siteDataMock.requestModel, siteDataMock.currentUrl);

            expect(mockPageJson.data.document_data.contactFormData.phoneFieldLabel).toBe('phone');
            expect(mockPageJson.data.document_data.contactFormData.foo).toBe('bar');
        });

        it('should do nothing if site is a template but language is not legal', function () {
            setDocumentType('Template');
            spyOn(coreUtils.wixUserApi, 'getLanguage').and.returnValue('illegal language');
            contactFormDataFixer.exec(mockPageJson, [], siteDataMock.requestModel, siteDataMock.currentUrl);

            expect(mockPageJson.data.document_data.contactFormData.phoneFieldLabel).toBe('phone');
            expect(mockPageJson.data.document_data.contactFormData.foo).toBe('bar');
        });

        it("should translate fields from list if site is template and language is legal", function () {
            setDocumentType('Template');
            spyOn(coreUtils.wixUserApi, 'getLanguage').and.returnValue('de');
            contactFormDataFixer.exec(mockPageJson, [], siteDataMock.requestModel, siteDataMock.currentUrl);

            expect(mockPageJson.data.document_data.contactFormData.phoneFieldLabel).toBe('Telefon');
            expect(mockPageJson.data.document_data.contactFormData.foo).toBe('bar');
        });
    });
});
