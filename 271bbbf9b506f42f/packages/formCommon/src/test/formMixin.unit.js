define(['utils', 'testUtils', 'contactForm', 'core'], function (utils, testUtils, contactFormClass, core) {
    'use strict';
    var ajax = utils.ajaxLibrary;

    describe('formMixin', function () {

        function createContactForm(toEmailAddress, isTemplate, bccEmail, externalBaseUrl) {
            spyOn(utils.wixUserApi, 'getLanguage').and.returnValue('en');

            var propOverrides = {
                isTemplate: isTemplate,
                compData: {
                    textDirection: 'rtl',
                    toEmailAddress: toEmailAddress,
                    bccEmailAddress: bccEmail,
                    emailFieldLabel: 'email',
                    onSubmitBehavior: 'message'
                },
                compProp: {
                    hidden_emailFieldLabel: true,
                    required_emailFieldLabel: true,
                    hidden_messageFieldLabel: true
                },
                style: {
                    width: 500,
                    height: 500
                },
                skin: 'wysiwyg.viewer.skins.contactform.BasicContactFormSkin',
                structure: {
                    componentType: 'wysiwyg.viewer.components.ContactForm'
                }
            };
            if (externalBaseUrl) {
                propOverrides.externalBaseUrl = externalBaseUrl;
            }

            var formMixinProps = testUtils.santaTypesBuilder.getComponentProps(contactFormClass, propOverrides);
            return testUtils.getComponentFromDefinition(contactFormClass, formMixinProps);
        }

        describe('Fallback tests', function () {
            var FALLBACK_URL = "https://fallback.wix.com/_api/wix-common-services-webapp/notification/invoke?accept=json&contentType=json&appUrl=https://fallback.wix.com";
            var ajaxSpy, errorSpy, successSpy;
            beforeEach(function () {
                jasmine.clock().install();
                var self = this;
                ajaxSpy = spyOn(ajax, 'ajax').and.callFake(function (settings) {
                    var mockAjaxResult = self.mockAjaxResult;
                    settings.error = errorSpy || settings.error || function () {
                        };
                    errorSpy = errorSpy || spyOn(settings, 'error').and.callThrough();

                    settings.success = settings.success || function () {
                        };
                    successSpy = spyOn(settings, 'success').and.callThrough();
                    setTimeout(function () {
                        var context = settings.context;
                        switch (mockAjaxResult) {
                            case 'error':
                                settings.error.call(context, {}, 'error');
                                break;
                            case 'timeout':
                                settings.error.call(context, {}, 'timeout');
                                break;
                            case 'abort':
                                settings.error.call(context, {}, 'abort');
                                break;
                            case 'success':
                                settings.success.call(context, {}, 'success');
                                break;
                        }
                    }, 5);
                });
            });
            afterEach(function () {
                jasmine.clock().uninstall();
                errorSpy = null;
            });
            it('should execute the fallback on a timeout', function () {
                this.comp = createContactForm('email@email.com');
                this.skinProps = this.comp.getSkinProperties();
                spyOn(this.comp, 'isFormValid').and.returnValue(true);
                this.mockAjaxResult = 'timeout';
                this.skinProps.submit.onClick();
                jasmine.clock().tick(100);
                expect(errorSpy).toHaveBeenCalled();
                expect(ajaxSpy.calls.count()).toBe(2);
                var recentCallSettings = ajaxSpy.calls.mostRecent().args[0];
                expect(recentCallSettings.url).toBe(FALLBACK_URL);
            });
            it('should execute the fallback on an "abort" event ', function () {
                this.comp = createContactForm('email@email.com');
                this.skinProps = this.comp.getSkinProperties();
                spyOn(this.comp, 'isFormValid').and.returnValue(true);
                this.mockAjaxResult = 'abort';
                this.skinProps.submit.onClick();
                jasmine.clock().tick(100);
                expect(errorSpy).toHaveBeenCalled();
                expect(ajaxSpy.calls.count()).toBe(2);
                var recentCallSettings = ajaxSpy.calls.mostRecent().args[0];
                expect(recentCallSettings.url).toBe(FALLBACK_URL);
            });
            it('should execute the fallback on a long timeout (i.e. even after 5s)', function () {
                this.comp = createContactForm('email@email.com');
                this.skinProps = this.comp.getSkinProperties();
                spyOn(this.comp, 'isFormValid').and.returnValue(true);
                this.mockAjaxResult = 'timeout';
                this.skinProps.submit.onClick();
                jasmine.clock().tick(5001);
                expect(errorSpy).toHaveBeenCalled();
                expect(ajaxSpy.calls.count()).toBe(2);
                var recentCallSettings = ajaxSpy.calls.mostRecent().args[0];
                expect(recentCallSettings.url).toBe(FALLBACK_URL);
            });
            it('should NOT execute the fallback if there was an ERROR response', function () {
                this.comp = createContactForm('email@email.com');
                this.skinProps = this.comp.getSkinProperties();
                spyOn(this.comp, 'isFormValid').and.returnValue(true);
                this.mockAjaxResult = 'error';
                this.skinProps.submit.onClick();
                jasmine.clock().tick(100);
                expect(errorSpy).toHaveBeenCalled();
                expect(ajaxSpy.calls.count()).toBe(1);
                var recentCallSettings = ajaxSpy.calls.mostRecent().args[0];
                expect(recentCallSettings.url).not.toBe(FALLBACK_URL);
            });
            it('should NOT execute the fallback if there was a SUCCESS response', function () {
                this.comp = createContactForm('email@email.com');
                this.skinProps = this.comp.getSkinProperties();
                spyOn(this.comp, 'isFormValid').and.returnValue(true);
                this.mockAjaxResult = 'success';
                this.skinProps.submit.onClick();
                jasmine.clock().tick(100);
                expect(successSpy).toHaveBeenCalled();
                expect(ajaxSpy.calls.count()).toBe(2);
                var recentCallSettings = ajaxSpy.calls.mostRecent().args[0];
                expect(recentCallSettings.url).not.toBe(FALLBACK_URL);
            });
            it('should not be able to submit form while a fallback request is in process', function () {
                this.comp = createContactForm('email@email.com');
                this.skinProps = this.comp.getSkinProperties();
                spyOn(this.comp, 'isFormValid').and.returnValue(true);
                this.mockAjaxResult = 'abort';
                //click -> sends our ajax
                this.skinProps.submit.onClick();
                //after fake 5ms, we should have one fake error and send another ajax request
                jasmine.clock().tick(6);
                //should have 2 ajax calls:
                expect(ajaxSpy.calls.count()).toBe(2);
                //but only one will have returned the abort error so far:
                expect(errorSpy.calls.count()).toBe(1);

                //click like crazy
                this.skinProps.submit.onClick();
                this.skinProps.submit.onClick();
                this.skinProps.submit.onClick();

                jasmine.clock().tick(200);
                //now we should have had 2 errors, but still only 2 requests
                expect(errorSpy.calls.count()).toBe(2);
                expect(ajaxSpy.calls.count()).toBe(2);
            });
        });
        describe('Post form', function () {
            it('should call an ajax post request if email is\'t set', function () {
                this.comp = createContactForm();
                this.skinProps = this.comp.getSkinProperties();
                var ajaxSpy = spyOn(ajax, 'ajax').and.callThrough();
                var formValidSpy = spyOn(this.comp, 'isFormValid').and.returnValue(true);
                this.skinProps.submit.onClick();

                expect(formValidSpy).toHaveBeenCalled();
                expect(ajaxSpy).toHaveBeenCalled();
            });

            it('should call an ajax post request if email is a33012eff368a577d48f52f310c92140', function () {
                this.comp = createContactForm('a33012eff368a577d48f52f310c92140');
                this.skinProps = this.comp.getSkinProperties();
                var ajaxSpy = spyOn(ajax, 'ajax');
                var formValidSpy = spyOn(this.comp, 'isFormValid').and.returnValue(true);
                this.skinProps.submit.onClick();

                expect(formValidSpy).toHaveBeenCalled();
                expect(ajaxSpy).toHaveBeenCalled();
            });

            it('should not call an ajax post request if form is not valid', function () {
                this.comp = createContactForm('mock@email.com');
                this.skinProps = this.comp.getSkinProperties();
                var ajaxSpy = spyOn(ajax, 'ajax').and.callThrough();
                spyOn(this.comp, 'isFormValid').and.returnValue(false);
                this.skinProps.submit.onClick();
                expect(ajaxSpy).not.toHaveBeenCalled();
            });

            describe('should call an ajax post request with correct params', function () {
                var someOwnerMail = 'mock@email.com';
                var someFromMail = 'from@mock.com';
                var someMessage = 'Hello Santa!';
                var someSubject = "Some subject";
                var somePhone = "1234567855";
                var someAddress = "Some Address";


                function getMetaSiteId(contactForm) {
                    return contactForm.props.metaSiteId;
                }

                function initializeContactForm(ownerMail, siteUrl, bccEmail) {
                    var contactForm = createContactForm(ownerMail, false, bccEmail, siteUrl);
                    contactForm.setState({
                        message: {value: someMessage},
                        subject: {value: someSubject},
                        phone: {value: somePhone},
                        address: {value: someAddress}
                    });

                    return contactForm;
                }

                function expectSuccessfulSend(ajaxParam, url, payload) {
                    expect(ajaxParam.type).toBe('POST');
                    expect(ajaxParam.dataType).toBe('json');
                    expect(ajaxParam.contentType).toBe('application/json; charset=utf-8');
                    expect(ajaxParam.success).toBeOfType('function');
                    expect(ajaxParam.error).toBeOfType('function');

                    expect(JSON.parse(ajaxParam.data)).toContain(payload);
                    expect(ajaxParam.url).toBe(url);
                }

                function submitContactForm(contactForm, fromMail) {
                    var ajaxParam;

                    spyOn(ajax, 'ajax').and.callFake(function (params) {
                        ajaxParam = params;
                    });

                    spyOn(Date.prototype, 'getDate').and.returnValue(1);
                    spyOn(Date.prototype, 'getMonth').and.returnValue(0);
                    spyOn(Date.prototype, 'getFullYear').and.returnValue(2014);

                    contactForm.setState({email: {value: fromMail}});
                    contactForm.setState({message: {value: someMessage}});

                    contactForm.getSkinProperties().submit.onClick();

                    return ajaxParam;
                }

                describe('for free user site', function () {
                    var contactForm, metaSiteId;

                    beforeEach(function () {
                        contactForm = initializeContactForm(someOwnerMail, 'http://mockFreeUserHostname/mockFreeUserSitename');
                        metaSiteId = getMetaSiteId(contactForm);
                    });

                    it('when sendContactFormEmailsViaPong experiment is closed', function () {
                        var result = submitContactForm(contactForm, someFromMail);

                        var expectedUrl = 'http://mockFreeUserHostname/_api/wix-common-services-webapp/notification/invoke?accept=json&contentType=json&appUrl=http://mockFreeUserHostname';
                        var expectedPayload = {
                            "to": [
                                {"address": someOwnerMail, "personal": someOwnerMail}
                            ],
                            "bcc": [],
                            "cc": [],
                            "from": {"address": someFromMail, "personal": "n/a"},
                            "subject": "New message via your Wix website, from  " + someFromMail,
                            "metaSiteId": metaSiteId,
                            "plainTextMessage": 'n/a',
                            "htmlMessage": "<ul style=\"list-style: none; margin: 0; padding: 0;\"><li style=\"list-style: none; margin: 0 0 5px 0; padding: 0;\"><b>You have a new message: </b></li><li style=\"list-style: none; margin: 0 0 15px 0; padding: 0;\">Via:  http://mockFreeUserHostname/mockFreeUserSitename</li><li style=\"list-style: none; margin: 0 0 5px 0; padding: 0;\"><b>Message Details: </b></li><li style=\"list-style: none; margin: 0 0 25px 0; padding: 0;\"><ul style=\"margin: 0 0 0 20px; padding: 0;\"><li style=\"list-style: none; margin: 0 0 5px 0; padding: 0;\"><b>Message</b> " + someMessage + "</li><li style=\"list-style: none; margin: 0 0 5px 0; padding: 0;\"><b>email</b> " + someFromMail + "</li></ul></li><li style=\"list-style: none; margin: 0 0 15px 0; padding: 0;\"><b>Sent on:</b> 1 January, 2014</li><li style=\"list-style: none; margin: 0; padding: 0;\">Thank you for using Wix.com!</li></ul>"
                        };

                        expectSuccessfulSend(result, expectedUrl, expectedPayload);
                    });

                    it('when sendContactFormEmailsViaPong experiment is open', function () {
                        testUtils.experimentHelper.openExperiments('sendContactFormEmailsViaPong');
                        var result = submitContactForm(contactForm, someFromMail);

                        var expectedUrl = 'http://mockFreeUserHostname/_api/crm-inbox-server/pong/message?accept=json&contentType=json&appUrl=http://mockFreeUserHostname';
                        var expectedPayload = {
                            "to": [
                                {"address": someOwnerMail, "name": someOwnerMail}
                            ],
                            "bcc": null,
                            "from": {"address": someFromMail, "name": null},
                            contactPhone: somePhone,
                            contactAddress: someAddress,
                            "formSubject": someSubject,
                            "metaSiteId": metaSiteId,
                            "formMessage": someMessage,
                            "fields": {"Message": someMessage, "email": someFromMail}
                        };

                        expectSuccessfulSend(result, expectedUrl, expectedPayload);
                    });
                });

                describe('for premium user site with domain', function () {
                    var contactForm, metaSiteId;

                    beforeEach(function () {
                        contactForm = initializeContactForm(someOwnerMail, 'http://mockPremiumUserHostname');
                        metaSiteId = getMetaSiteId(contactForm);
                    });

                    it('when sendContactFormEmailsViaPong experiment is closed', function () {
                        var result = submitContactForm(contactForm, someFromMail);

                        var expectedUrl = 'http://mockPremiumUserHostname/_api/wix-common-services-webapp/notification/invoke?accept=json&contentType=json&appUrl=http://mockPremiumUserHostname';
                        var expectedPayload = {
                            "to": [
                                {"address": someOwnerMail, "personal": someOwnerMail}
                            ],
                            "bcc": [],
                            "cc": [],
                            "from": {"address": someFromMail, "personal": "n/a"},
                            "subject": "New message via your Wix website, from  " + someFromMail,
                            "metaSiteId": metaSiteId,
                            "plainTextMessage": 'n/a',
                            "htmlMessage": "<ul style=\"list-style: none; margin: 0; padding: 0;\"><li style=\"list-style: none; margin: 0 0 5px 0; padding: 0;\"><b>You have a new message: </b></li><li style=\"list-style: none; margin: 0 0 15px 0; padding: 0;\">Via:  http://mockPremiumUserHostname</li><li style=\"list-style: none; margin: 0 0 5px 0; padding: 0;\"><b>Message Details: </b></li><li style=\"list-style: none; margin: 0 0 25px 0; padding: 0;\"><ul style=\"margin: 0 0 0 20px; padding: 0;\"><li style=\"list-style: none; margin: 0 0 5px 0; padding: 0;\"><b>Message</b> " + someMessage + "</li><li style=\"list-style: none; margin: 0 0 5px 0; padding: 0;\"><b>email</b> " + someFromMail + "</li></ul></li><li style=\"list-style: none; margin: 0 0 15px 0; padding: 0;\"><b>Sent on:</b> 1 January, 2014</li><li style=\"list-style: none; margin: 0; padding: 0;\">Thank you for using Wix.com!</li></ul>"
                        };

                        expectSuccessfulSend(result, expectedUrl, expectedPayload);
                    });

                    it('when sendContactFormEmailsViaPong experiment is open', function () {
                        testUtils.experimentHelper.openExperiments('sendContactFormEmailsViaPong');
                        var result = submitContactForm(contactForm, someFromMail);

                        var expectedUrl = 'http://mockPremiumUserHostname/_api/crm-inbox-server/pong/message?accept=json&contentType=json&appUrl=http://mockPremiumUserHostname';
                        var expectedPayload = {
                            "to": [
                                {"address": someOwnerMail, "name": someOwnerMail}
                            ],
                            "bcc": null,
                            "from": {"address": someFromMail, "name": null},
                            contactPhone: somePhone,
                            contactAddress: someAddress,
                            "formSubject": someSubject,
                            "metaSiteId": metaSiteId,
                            "formMessage": someMessage,
                            "fields": {"Message": someMessage, "email": someFromMail}
                        };

                        expectSuccessfulSend(result, expectedUrl, expectedPayload);
                    });
                });

                describe('for Wix Landing pages', function () {
                    var contactForm, metaSiteId;

                    it('when sendContactFormEmailsViaPong experiment is closed', function () {
                        contactForm = initializeContactForm(someOwnerMail, 'http://www.mockWix.com/wixMockCampaign/wixMockLandingPage');
                        metaSiteId = getMetaSiteId(contactForm);
                        var result = submitContactForm(contactForm, someFromMail);

                        var expectedUrl = 'http://www.mockWix.com/_api/wix-common-services-webapp/notification/invoke?accept=json&contentType=json&appUrl=http://www.mockWix.com';
                        var expectedPayload = {
                            "to": [
                                {"address": someOwnerMail, "personal": someOwnerMail}
                            ],
                            "bcc": [],
                            "cc": [],
                            "from": {"address": someFromMail, "personal": "n/a"},
                            "subject": "New message via your Wix website, from  " + someFromMail,
                            "metaSiteId": metaSiteId,
                            "plainTextMessage": 'n/a',
                            "htmlMessage": "<ul style=\"list-style: none; margin: 0; padding: 0;\"><li style=\"list-style: none; margin: 0 0 5px 0; padding: 0;\"><b>You have a new message: </b></li><li style=\"list-style: none; margin: 0 0 15px 0; padding: 0;\">Via:  http://www.mockWix.com/wixMockCampaign/wixMockLandingPage</li><li style=\"list-style: none; margin: 0 0 5px 0; padding: 0;\"><b>Message Details: </b></li><li style=\"list-style: none; margin: 0 0 25px 0; padding: 0;\"><ul style=\"margin: 0 0 0 20px; padding: 0;\"><li style=\"list-style: none; margin: 0 0 5px 0; padding: 0;\"><b>Message</b> " + someMessage + "</li><li style=\"list-style: none; margin: 0 0 5px 0; padding: 0;\"><b>email</b> " + someFromMail + "</li></ul></li><li style=\"list-style: none; margin: 0 0 15px 0; padding: 0;\"><b>Sent on:</b> 1 January, 2014</li><li style=\"list-style: none; margin: 0; padding: 0;\">Thank you for using Wix.com!</li></ul>"
                        };

                        expectSuccessfulSend(result, expectedUrl, expectedPayload);
                    });

                    it('when sendContactFormEmailsViaPong experiment is open', function () {
                        contactForm = initializeContactForm(someOwnerMail, 'http://www.mockWix.com/wixMockCampaign/wixMockLandingPage');
                        metaSiteId = getMetaSiteId(contactForm);
                        testUtils.experimentHelper.openExperiments('sendContactFormEmailsViaPong');
                        var result = submitContactForm(contactForm, someFromMail);

                        var expectedUrl = 'http://www.mockWix.com/_api/crm-inbox-server/pong/message?accept=json&contentType=json&appUrl=http://www.mockWix.com';
                        var expectedPayload = {
                            "to": [
                                {"address": someOwnerMail, "name": someOwnerMail}
                            ],
                            "bcc": null,
                            "from": {"address": someFromMail, "name": null},
                            contactPhone: somePhone,
                            contactAddress: someAddress,
                            "formSubject": someSubject,
                            "metaSiteId": metaSiteId,
                            "formMessage": someMessage,
                            "fields": {"Message": someMessage, "email": someFromMail}
                        };

                        expectSuccessfulSend(result, expectedUrl, expectedPayload);
                    });

                    it('when sendContactFormEmailsViaPong experiment is open and bcc is present', function () {
                        var bccEmail = "myname@mydomain.com";
                        contactForm = initializeContactForm(someOwnerMail, 'http://www.mockWix.com/wixMockCampaign/wixMockLandingPage', bccEmail);
                        metaSiteId = getMetaSiteId(contactForm);
                        testUtils.experimentHelper.openExperiments('sendContactFormEmailsViaPong');
                        var result = submitContactForm(contactForm, someFromMail);

                        var expectedUrl = 'http://www.mockWix.com/_api/crm-inbox-server/pong/message?accept=json&contentType=json&appUrl=http://www.mockWix.com';
                        var expectedPayload = {
                            "to": [
                                {"address": someOwnerMail, "name": someOwnerMail}
                            ],
                            "bcc": {address: bccEmail, name: bccEmail},
                            "from": {"address": someFromMail, "name": null},
                            contactPhone: somePhone,
                            contactAddress: someAddress,
                            "formSubject": someSubject,
                            "metaSiteId": metaSiteId,
                            "formMessage": someMessage,
                            "fields": {"Message": someMessage, "email": someFromMail}
                        };

                        expectSuccessfulSend(result, expectedUrl, expectedPayload);
                    });

                    it('plainTextMessage field should always be n/a', function () {
                        contactForm = initializeContactForm(someOwnerMail, 'http://www.mockWix.com/wixMockCampaign/wixMockLandingPage');
                        metaSiteId = getMetaSiteId(contactForm);
                        var result = submitContactForm(contactForm, someFromMail);

                        var expectedUrl = 'http://www.mockWix.com/_api/wix-common-services-webapp/notification/invoke?accept=json&contentType=json&appUrl=http://www.mockWix.com';
                        var expectedPayload = {
                            "to": [
                                {"address": someOwnerMail, "personal": someOwnerMail}
                            ],
                            "bcc": [],
                            "cc": [],
                            "from": {"address": someFromMail, "personal": "n/a"},
                            "subject": "New message via your Wix website, from  " + someFromMail,
                            "metaSiteId": metaSiteId,
                            "plainTextMessage": 'n/a',
                            "htmlMessage": "<ul style=\"list-style: none; margin: 0; padding: 0;\"><li style=\"list-style: none; margin: 0 0 5px 0; padding: 0;\"><b>You have a new message: </b></li><li style=\"list-style: none; margin: 0 0 15px 0; padding: 0;\">Via:  http://www.mockWix.com/wixMockCampaign/wixMockLandingPage</li><li style=\"list-style: none; margin: 0 0 5px 0; padding: 0;\"><b>Message Details: </b></li><li style=\"list-style: none; margin: 0 0 25px 0; padding: 0;\"><ul style=\"margin: 0 0 0 20px; padding: 0;\"><li style=\"list-style: none; margin: 0 0 5px 0; padding: 0;\"><b>Message</b> " + someMessage + "</li><li style=\"list-style: none; margin: 0 0 5px 0; padding: 0;\"><b>email</b> " + someFromMail + "</li></ul></li><li style=\"list-style: none; margin: 0 0 15px 0; padding: 0;\"><b>Sent on:</b> 1 January, 2014</li><li style=\"list-style: none; margin: 0; padding: 0;\">Thank you for using Wix.com!</li></ul>"
                        };

                        expectSuccessfulSend(result, expectedUrl, expectedPayload);
                    });
                });
            });

            it('should not be able to submit form while another form submission is busy', function () {
                spyOn(ajax, 'ajax').and.returnValue();
                this.comp = createContactForm('mock@email.com');
                this.comp.setState({email: {value: 'from@mock.com'}});
                this.skinProps = this.comp.getSkinProperties();
                this.skinProps.submit.onClick();
                this.skinProps.submit.onClick();
                expect(ajax.ajax.calls.count()).toBe(1);
            });

            describe('form activities', function () {

                beforeEach(function () {
                    spyOn(ajax, 'ajax').and.callFake(function (settings) {
                        var context = settings.context || null;
                        settings.success = settings.success || function () {
                            };
                        settings.success.call(context, {}, 'success');
                    });

                    spyOn(core.activityService, 'reportActivity');
                });
                it('should post an activity when submitting a valid form', function () {
                    this.comp = createContactForm('mock@email.com', false);
                    this.comp.setState({email: {value: 'from@mock.com'}});
                    this.skinProps = this.comp.getSkinProperties();
                    this.skinProps.submit.onClick();
                    expect(core.activityService.reportActivity).toHaveBeenCalled();
                });

                it('should NOT post an activity when submitting a valid form from a template', function () {
                    this.comp = createContactForm('mock@email.com', true);
                    this.comp.setState({email: {value: 'from@mock.com'}});
                    this.skinProps = this.comp.getSkinProperties();
                    this.skinProps.submit.onClick();
                    expect(core.activityService.reportActivity).not.toHaveBeenCalled();
                });
            });
        });

    });
});
