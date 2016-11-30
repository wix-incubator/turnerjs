describe('ContactForm', function () {
    testRequire()
        .classes('core.managers.components.ComponentBuilder');


    beforeEach(function () {

        runs(function() {
            this.compLogic = null;
            var dataItem = W.Data.createDataItem({
                type: 'ContactForm',
                toEmailAddress: "to@test.com",
                bccEmailAddress: 'bcc@test.com'
            });

            var builder = new this.ComponentBuilder(document.createElement('div'));

            builder
                .withType('wysiwyg.viewer.components.ContactForm')
                .withSkin('mock.viewer.skins.BasicContactFormSkin')
                .withData(dataItem)
                ._with("htmlId", "mockId")
                .onWixified(function (component) {
                    this.compLogic = component;
                }.bind(this))
                .create();
        });
        waitsFor(function() {
            return this.compLogic;
        }, 'compLogic to be ready', 2000);

    });

//    beforeEach(function () {
//
//        var dataItem = W.Data.createDataItem({
//            type: 'ContactForm',
//            toEmailAddress: "to@test.com",
//            bccEmailAddress: 'bcc@test.com'
//        });
//
//        var builder = new this.ComponentBuilder(document.createElement('div'));
//
//        builder
//            .withType('wysiwyg.viewer.components.ContactForm')
//            .withSkin('mock.viewer.skins.BasicContactFormSkin')
//            .withData(dataItem)
//            ._with("htmlId", "mockId")
//            .onWixified(function (component) {
//                this.compLogic = component;
//            }.bind(this))
//            .create();
//
//    });

    var expectedErrors = {
        CONTACT_FORM_ERROR_NAME_MISSING: 'Please add your name',
        CONTACT_FORM_ERROR_EMAIL_INVALID: 'Please add a valid email',
        CONTACT_FORM_ERROR_MESSAGE_MISSING: 'Please add a message',
        CONTACT_FORM_ERROR_OWNER_NOT_DEFINED: 'Owner email address not set',
        CONTACT_FORM_ERROR_GENERAL: 'Error sending email'
    };

//    it('check _validateForm() with correct input', function () {
//        var logic = this.compLogic;
//        var msg = { name: 'Tester', email: 'test@good.com', subject: 'Good subject', message: 'Good message' };
//
//        // checks that not throwing an exception
//        expect(function () {
//            logic._validateForm(msg);
//        }).not.toThrow();
//    });
//
//    it('check _validateForm(msg) with incorrect input', function () {
//        var logic = this.compLogic;
//        var msg = { name: '', email: 'test@bad', subject: '', message: '' };
//        expect(function () {
//            logic._validateForm(msg);
//        }).toThrow({ type: 'validation-error', message: expectedErrors.CONTACT_FORM_ERROR_NAME_MISSING  });
//        msg = { name: 'Tester', email: 'test@bad', subject: '', message: '' };
//        expect(function () {
//            logic._validateForm(msg);
//        }).toThrow({ type: 'validation-error', message: expectedErrors.CONTACT_FORM_ERROR_EMAIL_INVALID  });
//        msg = { name: 'Tester', email: 'test@bad,com', subject: '', message: '' };
//        expect(function () {
//            logic._validateForm(msg);
//        }).toThrow({ type: 'validation-error', message: expectedErrors.CONTACT_FORM_ERROR_EMAIL_INVALID  });
//        msg = { name: 'Tester', email: '', subject: '', message: '' };
//        expect(function () {
//            logic._validateForm(msg);
//        }).toThrow({ type: 'validation-error', message: expectedErrors.CONTACT_FORM_ERROR_EMAIL_INVALID  });
//        msg = { name: 'Tester', email: 'test@good.com', subject: 'Good subject', message: '' };
//        expect(function () {
//            logic._validateForm(msg);
//        }).toThrow({ type: 'validation-error', message: expectedErrors.CONTACT_FORM_ERROR_MESSAGE_MISSING  });
//        msg = { name: 'Tester', email: 'test@good.com', subject: 'Good subject', message: 'Good message' };
//        logic._data.set('toEmailAddress', '');
//        expect(function () {
//            logic._validateForm(msg);
//        }).toThrow({ type: 'validation-error', message: expectedErrors.CONTACT_FORM_ERROR_OWNER_NOT_DEFINED });
//    });
//
//    it('check _submitForm()', function () {
//        var logic = this.compLogic;
//        var spy = spyOn(logic, 'sendEmail').andReturn();
//        if (logic._skinParts.send && !logic._skinParts.send.disable) {
//            logic._skinParts.send.disable = function () {
//            }
//        }
//
//        var msg = { name: 'Tester is the king', email: 'tester@wix.com', subject: 'Test subject', message: 'Test <b>message</b>' };
//        var metaSiteId = '5c1d9da4-ee9b-4110-9ec2-5ffc49090461';
//        var website = 'http://test.com';
//
//        var expected = {"to": [
//            {"address": "to@test.com", "personal": "to@test.com"}
//        ], "cc": [],
//            "bcc": [
//                {"address": "bcc@test.com", "personal": "bcc@test.com"}
//            ],
//            "from": {"address": "tester@wix.com", "personal": "Tester is the king"},
//            "subject": "New message via your Wix website, from - tester@wix.com",
//            "htmlMessage": "<strong>You have a new message</strong><br/>via: http://test.com<br/><br/><strong>Message details:</strong><br/>From: Tester is the king<br/>Email: tester@wix.com<br/>Date: 03 January 2010<br/>Subject: Test subject<br/><br/><strong>Message:</strong><br/>Test &lt;b&gt;message&lt;/b&gt;<br/><br/><br/>Thank you for using Wix.com!",
//            "plainTextMessage": "You have a new message\nvia: http://test.com\n\nMessage details:\nFrom: Tester is the king\nEmail: tester@wix.com\nDate: 03 January 2010\nSubject: Test subject\n\nMessage:\nTest <b>message</b>\n\n\nThank you for using Wix.com!"};
//
//        // run the submit form
//        var date = new Date();
//        date.setFullYear(2010, 0, 3);
//        logic._submitForm(msg, metaSiteId, website, date);
//
//        // see that the sendEmail was called with the right params
//        expect(spy).toHaveBeenCalledWith(
//            expected.to, expected.cc, expected.bcc, expected.from, expected.subject,
//            expected.htmlMessage, expected.plainTextMessage, metaSiteId, logic._sendEmailCompleted);
//    });

    describe('Decrypt Contact Form Email tests', function () {

        beforeEach(function () {
            this.encMail = '9b07ce7c4ab969ca9b65e71c15f424d355764f9efa39e761f54cc357e48ecd04';
            this.decMail = 'very@good.yes';
        });

        it('isDecryptedEmail should return true for a valid email', function () {
            var logic = this.compLogic;
            var validEmail = this.decMail;

            expect(logic._isDecryptedEmail(validEmail)).toBe(true);
        });

        it('isDecryptedEmail should return false for an encrypted email', function () {
            var logic = this.compLogic;

            expect(logic._isDecryptedEmail(this.encMail)).toBe(false);
        });

        it('should decrypt one email and update the data', function () {
            var logic = this.compLogic;
            var that = this;
            logic._data.set('toEmailAddress', this.encMail);

            var spy = spyOn(logic._restClient, 'get').andCallFake(function (absoluteUrl, params, callbacks) {
                callbacks.onSuccess({ email: that.decMail });
            });

            logic._decryptEmails();
            var actualDecMail = logic._data.get('toEmailAddress');

            expect(spy.callCount).toBe(1);
            expect(actualDecMail).toBe(this.decMail);
        });

        it('should decrypt two emails and update the data', function () {
            var logic = this.compLogic;
            var that = this;
            logic._data.set('toEmailAddress', this.encMail);
            logic._data.set('bccEmailAddress', this.encMail);

            var spy = spyOn(logic._restClient, 'get').andCallFake(function (absoluteUrl, params, callbacks) {
                callbacks.onSuccess({ email: that.decMail });
            });

            logic._decryptEmails();
            var actualDecMail1 = logic._data.get('toEmailAddress');
            var actualDecMail2 = logic._data.get('bccEmailAddress');

            expect(spy.callCount).toBe(2);
            expect(actualDecMail1).toBe(this.decMail);
            expect(actualDecMail2).toBe(this.decMail);
        });

        it('should update the data field with empty string and report error in case of decryption failure', function () {
            var logic = this.compLogic;
            var emptyString = '';
            logic._data.set('toEmailAddress', this.encMail);

            spyOn(logic._restClient, 'get').andCallFake(function (absoluteUrl, params, callbacks) {
                callbacks.onError('Some error message');
            });

            var loggerSpy = spyOn(logic, '_sendError');

            logic._decryptEmails();
            var actualDecMail = logic._data.get('toEmailAddress');

            expect(actualDecMail).toBe(emptyString);
            expect(loggerSpy).toHaveBeenCalled();
        });
    });

    describe('NBC ContactForm Specs', function () {
        testRequire().classes('core.managers.components.ComponentBuilder')
            .components('wysiwyg.viewer.components.ContactForm')
            .resources('W.Data', 'W.Viewer', 'W.ComponentLifecycle');

        var cForm, dataItem;

        beforeEach(function () {
            cForm = null;
            dataItem = this.W.Data.createDataItem({
                "type": "ContactForm",
                "toEmailAddress": "test@test.com",
                "bccEmailAddress": "test@test.com",
                "nameFieldLabel": "name Field Label",
                "emailFieldLabel": "email Field Label",
                "phoneFieldLabel": "phone  Field Label",
                "addressFieldLabel": "address Field Label",
                "subjectFieldLabel": "subj Field Label",
                "messageFieldLabel": "message Field Label",
                "submitButtonLabel": "send",
                "successMessage": "success Message",
                "validationErrorMessage": "validation Error Message",
                "errorMessage": "Error Message",
                "textDirection": "left"
            });

            this.builder = new this.ComponentBuilder(document.createElement('div'));
            this.builder
                .withType('wysiwyg.viewer.components.ContactForm').withSkin('mock.viewer.skins.BasicContactFormSkin')
                .withData(dataItem)
                ._with("htmlId", "mockId")
                .onWixified(function (comp) {
                    cForm = comp;
                }).create();
            waitsFor(function () {
                return cForm !== null;
            }, 'ContactForm component to be ready', 2000);
        });

        describe('setting correct email address', function () {

            it('_onSubmit should not call sendEmail if form is invalid', function () {
                var sendSpy = spyOn(cForm, '_sendMail').andReturn();
                spyOn(cForm, '_isValid').andReturn(false);
                cForm._onSubmit();
                expect(sendSpy).not.toHaveBeenCalled();
            });

            it('_onSubmit should call sendEmail if form is valid and eMail address exist', function () {

                cForm.lingo = {
                    err_404: 'err_404', err_main: 'err_main', err_noOwner: 'err_noOwner', err_timeOut: 'err_timeOut', msg_date: 'msg_date', msg_details: 'msg_details', msg_title: 'msg_title', msg_tnx: 'msg_tnx', msg_subj: 'msg_subj', msg_via: 'msg_via', sending: 'sending'
                };

                var email = 'test@test.com';
                var url = 'www.test.com';
                var data = {'to': email};
                var sendSpy = spyOn(cForm, '_sendMail').andReturn();


                spyOn(cForm, '_isValid').andReturn(true);
                spyOn(cForm, 'getMailServerUrl').andReturn(url);
                spyOn(cForm, '_formatData').andReturn(data);

                cForm._onSubmit();

                expect(sendSpy).toHaveBeenCalledWith(url, data, true);
            });

        });
    });
});

