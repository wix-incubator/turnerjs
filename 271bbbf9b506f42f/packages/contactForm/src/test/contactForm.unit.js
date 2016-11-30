define(['testUtils', 'utils', 'lodash', 'contactForm'], function (testUtils, utils, _, contactFormClass) {
    'use strict';

    describe('Contact Form', function(){

        function createContactForm() {
            spyOn(utils.wixUserApi, 'getLanguage').and.returnValue('en');

            var formMixinProps = testUtils.santaTypesBuilder.getComponentProps(contactFormClass, {
                compData: {
                    addressFieldLabel: "Address",
                    bccEmailAddress: "",
                    emailFieldLabel: "Email",
                    errorMessage: "specify a real email",
                    messageFieldLabel: "Message",
                    nameFieldLabel: "Name",
                    phoneFieldLabel: "Phone",
                    subjectFieldLabel: "Subject",
                    submitButtonLabel: "Send it over",
                    successMessage: "Your details were sent successfully!",
                    textDirection: "left",
                    toEmailAddress: "e2453cb8a12eab1ee80b35bc4d57b492",
                    validationErrorMessage: "Please fill in all required fields."
                },
                compProp: {
                    "hidden_emailFieldLabel": true,
                    "hidden_nameFieldLabel": true,
                    "hidden_phoneFieldLabel": true,
                    "hidden_addressFieldLabel": false,
                    "hidden_subjectFieldLabel": true,
                    "hidden_messageFieldLabel": true,
                    "required_emailFieldLabel": true,
                    "required_nameFieldLabel": true,
                    "required_phoneFieldLabel": false,
                    "required_addressFieldLabel": false,
                    "required_subjectFieldLabel": false,
                    "required_messageFieldLabel": false
                },
                style: {
                    width: 500,
                    height: 500
                },
                skin: 'wysiwyg.viewer.skins.contactform.BasicContactFormSkin',
                structure: {
                    styleId: 'mockId',
                    componentType: 'wysiwyg.viewer.components.ContactForm'
                }
            });

            return testUtils.getComponentFromDefinition(contactFormClass, formMixinProps);
        }

        beforeEach(function () {
            this.comp = createContactForm();
        });

        it('getFormInitialState', function () {
            var initialState = {
                mailSent: false,
                name: {error: false, hidden: false, required: true},
                subject: {error: false, hidden: false, required: false},
                message: {error: false, hidden: false, required: false},
                phone: {error: false, hidden: false, required: false},
                email: {error: false, hidden: false, required: true},
                address: {error: false, hidden: true, required: false},
                notifications: {error: false, hidden: true, required: false, message: ''},
                $name: '',
                $subject: '',
                $message: '',
                $phone: '',
                $email: '',
                $address: 'addressHidden'};

            expect(this.comp.getFormInitialState()).toEqual(initialState);
        });

        it('getFormInputs', function () {
            expect(this.comp.getFormInputs()).toEqual(['name', 'subject', 'message', 'phone', 'email', 'address']);
        });

        it('getActivityName', function () {
            expect(this.comp.getActivityName()).toBe('ContactFormActivity');
        });

        it('getFormFields', function () {
            this.comp.setState({
                email: {
                    value: 'mockEmail'
                },
                message: {
                    value: 'mockMessage'
                },
                subject: {
                    value: 'mockSubject'
                },
                name: {
                    value: 'mockName'
                }
            });

            expect(this.comp.getFormFields()).toEqual({Name: 'mockName', Subject: 'mockSubject', Message: 'mockMessage', Email: 'mockEmail', Phone: ''});
        });

        describe('isFormValid', function(){

            it('should be valid if all required fields are set and valid', function(){
                this.comp.setState({email: {value: 'mock@email.com'}, name: {value: 'mockName'}});
                expect(this.comp.isFormValid()).toBeTruthy();

            });

            it('should not be valid if not all required fields are set', function(){
                this.comp.setState({email: {value: 'mock@email.com'}, name: {value: ''}});
                expect(this.comp.isFormValid()).toBeFalsy();
            });

            it('should not be valid if email is not valid', function(){
                this.comp.setState({email: {value: 'non valid email address'}, name: {value: 'mockName'}});
                expect(this.comp.isFormValid()).toBeFalsy();
            });

        });

        describe('getInputName', function(){

            it('should return mock name if name field is set', function(){
                this.comp.setState({name: {value: 'mockName'}});
                expect(this.comp.getInputName()).toBe('mockName');
            });

            it('should return n/a if name field is not set if experiment sendContactFormEmailsViaPong is closed', function(){
                this.comp.setState({name: {value: ''}});
                expect(this.comp.getInputName()).toBe('n/a');
            });

            it('should return Someone if name field is not set if experiment sendContactFormEmailsViaPong is open', function(){
                testUtils.experimentHelper.openExperiments('sendContactFormEmailsViaPong');

                this.comp.setState({name: {value: ''}});
                expect(this.comp.getInputName()).toBe(null);
            });

        });

        xit('getLangKeys should contain all the language keys', function () {
            expect(this.comp.getLangKeys('en')).toContain({
                "error": "an error has occurred",
                "errorMessage" : "Please provide a valid email",
                "validationErrorMessage": "Please fill in all required fields.",
                "successMessage": "Success! Message received.",
                "noOwner": "Owner email address not set",
                "sentOn": "Sent on:",
                "details": "Message Details: ",
                "title": "You have a new message: ",
                "thanks": "Thank you for using Wix.com!",
                "via": "Via: ",
                "thanks_premium": 'Thank you!',
                "subject": "New message via your Wix website, from ",
                "subject_premium": "New message via your website, from ",
                "nameFieldLabel": "Name",
                "emailFieldLabel": "Email",
                "phoneFieldLabel": "Phone",
                "subjectFieldLabel": "Subject",
                "messageFieldLabel": "Message",
                "addressFieldLabel": "Address"
            });
        });

        it("getLangKeys should also contain a 'submitting' key", function(){
            expect(this.comp.getLangKeys('en')).toContain({submitting: '…'});
        });

        it('getFormSkinProperties', function(){

            this.comp.setState({
                email: {value: 'mock@email.com'},
                name: {value: 'mockName'},
                message: {value: 'mockMessage'},
                subject: {value: 'mockSubject'},
                phone: {value: 'mockPhone'},
                address: {value: 'mockAddress'}
            });

            var skinProperties = this.comp.getFormSkinProperties({
                "default_label_name": "Name",
                "default_label_email": "Email",
                "default_label_phone": "Phone",
                "default_label_subject": "Subject",
                "default_label_message": "Message",
                "default_label_address": "Address"
            });

            expect(skinProperties.label_address).toEqual({className: 'mockId_hidden', children: ['Address']});
            expect(skinProperties.label_email).toEqual({className: '', children: ['Email']});
            expect(skinProperties.label_message).toEqual({className: '', children: ['Message']});
            expect(skinProperties.label_phone).toEqual({className: '', children: ['Phone']});
            expect(skinProperties.label_name).toEqual({className: '', children: ['Name']});
            expect(skinProperties.label_subject).toEqual({className: '', children: ['Subject']});
            expect(skinProperties.addressField).toEqual(jasmine.objectContaining({name: 'Address', value: 'mockAddress', className: 'mockId_value mockId_hidden', placeholder: 'Address'}));
            expect(skinProperties.emailField).toEqual(jasmine.objectContaining({name: 'Email', value: 'mock@email.com', className: 'mockId_value mockId_required', placeholder: 'Email'}));
            expect(skinProperties.messageField).toEqual(jasmine.objectContaining({name: 'Message', value: 'mockMessage', className: 'mockId_value', placeholder: 'Message'}));
            expect(skinProperties.phoneField).toEqual(jasmine.objectContaining({name: 'Phone', value: 'mockPhone', className: 'mockId_value', placeholder: 'Phone'}));
            expect(skinProperties.nameField).toEqual(jasmine.objectContaining({name: 'Name', value: 'mockName', className: 'mockId_value mockId_required', placeholder: 'Name'}));
            expect(skinProperties.subjectField).toEqual(jasmine.objectContaining({name: 'Subject', value: 'mockSubject', className: 'mockId_value', placeholder: 'Subject'}));
            expect(skinProperties.notifications).toEqual({className: 'mockId_success', children: ['']});
        });

    });
});
