testRequire().classes('wysiwyg.deployment.it.editor.ComponentsDriver');

describe("EditorAcceptance:", function () {
    beforeEach(function () {
        window.editor = window.editor || new this.ComponentsDriver();
    });
    describe("Contact Form Refactor:", function () {
        var cform, logic, exterminate = false;
        beforeEach(function () {
            editor
                .createComponent('addContactForm', 'wysiwyg.viewer.components.ContactForm')
                .then(function (component) {
                    cform = component;
                });

            waitsFor(function () {
                return editor.isComponentReady(cform);
            }, 'cform to be ready', 1000);

            runs(function () {
                logic = cform.$logic;
            });
        });

        describe("Placeholder Polyfill: ", function () {
            var flag;
            beforeEach(function() {
                flag = false;
                spyOn(logic, 'needsPoly').andCallFake(function() { return true });

                logic._renderForm();

                runs(function () {
                    setTimeout(function () {
                        flag = true
                    }, 100);
                });

                waitsFor(function () {
                    return flag;
                });

            });

            it("should call needsPoly", function () {
                expect(logic.needsPoly).toHaveBeenCalled();
            });

            it("should clear value on focus", function () {
                logic._skinParts.email.focus();
                expect(logic._skinParts.email.value).toEqual('');
            });

            it("should set isPlaceholder class to input", function () {
                expect(logic._skinParts.email.classList.contains('isPlaceholder')).toBe(true);
            });

            it("should remove isPlaceholder class from input", function () {
                logic._skinParts.email.focus();
                logic._skinParts.email.value = 'dssdfsd';
                logic._skinParts.name.focus();
                expect(logic._skinParts.email.classList.contains('isPlaceholder')).toBe(false);
            });

            it("should leave old value if user delete it", function () {
                logic._skinParts.email.focus();
                logic._skinParts.email.value = '';
                logic._skinParts.name.focus();
                expect(logic._skinParts.email.classList.contains('isPlaceholder')).toBe(true);
            });

            it("should validate form", function () {
                spyOn(logic, '_sendMail').andCallThrough();

                logic._skinParts.email.focus();
                logic._skinParts.email.value = 'some@mail.com';
                logic._skinParts.name.focus();
                logic._skinParts.name.value = '';

                logic._skinParts.submit.focus();
                logic._skinParts.submit.click();
                expect(logic._sendMail).not.toHaveBeenCalled();
            });
        });

        describe('DecryptContactFormEmail experiment tests', function () {
            var encMail, decMail;
            beforeEach(function(){
                encMail = '9b07ce7c4ab969ca9b65e71c15f424d355764f9efa39e761f54cc357e48ecd04';
                decMail = 'very@good.yes';
            });

            it('isDecryptedEmail should return true for a valid email', function () {

                expect(logic._isDecryptedEmail(decMail)).toBe(true);
            });

            it('isDecryptedEmail should return false for an encrypted email', function () {
                expect(logic._isDecryptedEmail(encMail)).toBe(false);
            });

            it('should decrypt one email and update the data', function () {
                logic._data.set('toEmailAddress', encMail);

                var spy = spyOn(logic._restClient, 'get').andCallFake(function (absoluteUrl, params, callbacks){
                    callbacks.onSuccess({ email: decMail });
                });

                logic._decryptEmails();
                var actualDecMail = logic._data.get('toEmailAddress');

                expect(spy.callCount).toBe(1);
                expect(actualDecMail).toBe(decMail);
            });

            it('should decrypt two emails and update the data', function () {

                logic._data.set('toEmailAddress', encMail);
                logic._data.set('bccEmailAddress', encMail);

                var spy = spyOn(logic._restClient, 'get').andCallFake(function (absoluteUrl, params, callbacks){
                    callbacks.onSuccess({ email: decMail });
                });

                logic._decryptEmails();
                var actualDecMail1 = logic._data.get('toEmailAddress');
                var actualDecMail2 = logic._data.get('bccEmailAddress');

                expect(spy.callCount).toBe(2);
                expect(actualDecMail1).toBe(decMail);
                expect(actualDecMail2).toBe(decMail);
            });

            it('should update the data field with empty string and report error in case of decryption failure', function () {
                var emptyString = '';
                logic._data.set('toEmailAddress', encMail);

                spyOn(logic._restClient, 'get').andCallFake(function (absoluteUrl, params, callbacks){
                    callbacks.onError('Some error message');
                });

                var loggerSpy = spyOn(logic, '_sendError');

                logic._decryptEmails();
                var actualDecMail = logic._data.get('toEmailAddress');

                expect(actualDecMail).toBe(emptyString);
                expect(loggerSpy).toHaveBeenCalled();
            });
        });

        describe("handle no user email address case", function () {

            var mail = 'keke@ololo.com', cookieMail = 'cookie@monster.com';

            beforeEach(function() {
                spyOn(logic, '_findCookie').andReturn(cookieMail);
            });

            it('_setMailIfNeeded should set email from cookie', function () {
                logic._data.set('toEmailAddress', mail);
                logic._properties.set('useCookie', true);
                logic._setMailIfNeeded();
                expect(logic._data.get('toEmailAddress')).toBe(cookieMail);
            });

            it('_setMailIfNeeded should do nothing if useCookie is toggled off', function () {
                logic._data.set('toEmailAddress', mail);
                logic._properties.set('useCookie', false);
                logic._setMailIfNeeded();
                expect(logic._data.get('toEmailAddress')).toBe(mail);
            });
        });

        describe("sending email", function () {
            var url, data, retry, flag;
            beforeEach(function() {
                url = data = retry = null;
                flag = false;

                spyOn(logic, '_sendMail').andCallFake(function( u, d, r ){
                    url = u; data = d; retry = r || undefined;
                });
                _.each( logic._skinParts, function( part, key ) {
                    if(!/(textarea|input)/.test(part.nodeName.toLowerCase())) return;
                    part.value = (key !== 'email')? 'dummy' : 'test@dummy.com';
                });

                logic._skinParts.submit.click();

                runs(function () { setTimeout(function () { flag = true }, 200)});
                waitsFor(function () { return flag });
            });

            it('submit valid form should call _sendMail', function () {
                expect(logic._sendMail).toHaveBeenCalled();
            });
            it('should call _sendMail with valid url', function () {
                expect(url).toBeValidUrl();
            });
            it('should call _sendMail with valid data', function () {
                expect(data).toBeOfType('object')
            });
            it('should call _sendMail without retry parameter for first time', function () {
                expect(retry).toBeFalsy()
            });
        });

        describe("Validations: ", function () {
            var mailSent;
            beforeEach(function() {

                mailSent = false;
                spyOn(logic, '_sendMail').andCallFake(function() {
                    mailSent = true;
                });
                spyOn(logic, '_isValid').andCallThrough();

                _.each(logic._properties._data, function(value,key) {
                    if(!/(hidden|required)/.test(key)) return;
                    logic._properties.set(key, true);
                });
                _.each( logic._skinParts, function( part, key ) {
                    if(!/(textarea|input)/.test(part.nodeName.toLowerCase())) return;
                    part.value = (key !== 'email')? key + ' dummy' : 'test@dummy.com';
                });
            });

            it("sendEmail should not be called if form isn't valid", function () {

                logic._skinParts.name.value = '';
                logic._skinParts.submit.click();
                logic._skinParts.name.value = 'ololok';
                logic._skinParts.email.value = '@kekeke';

                logic._skinParts.submit.click();

                var flag = false;
                runs(function () { setTimeout(function () { flag = true }, 100)});
                waitsFor(function () { return flag });

                runs(function () {
                    expect(logic._sendMail).not.toHaveBeenCalled();
                });

            });

            it("should send email if form is valid", function () {

                logic._skinParts.address.value = '';
                logic._skinParts.submit.click();
                logic._skinParts.address.value = 'ololok';
                logic._skinParts.email.value = 'kekeke';
                logic._skinParts.submit.click();
                logic._skinParts.email.value = 'kekeke@keke.com';
                logic._skinParts.submit.click();

                expect(logic._sendMail).toHaveBeenCalled();
                expect(mailSent).toBe(true);
            });
        });

        describe("error messages", function () {
            beforeEach(function() {
                _.each( logic._skinParts, function( part, key ) {
                    if(!/(textarea|input)/.test(part.nodeName.toLowerCase())) return;
                    part.value = (key !== 'email')? 'dummy' : 'test@dummy.com';
                });
            });

            it("should trow no owner mail", function () {
                var expectedMessage = 'Owner email address not set';
                logic._data.set('toEmailAddress', '');
                logic._skinParts.submit.click();
                expect(logic._skinParts.notifications.innerText).toEqual(expectedMessage);
            });

            it("should show empty field error message", function () {
                var expectedMessage = logic._data.get('validationErrorMessage');

                logic._data.set('toEmailAddress', 'test@wix.com');
                logic._skinParts.name.value = '';
                logic._skinParts.submit.click();

                expect(logic._skinParts.notifications.innerText).toEqual(expectedMessage);
            });

            it("should show bad mail error message", function () {
                var expectedMessage = logic._data.get('errorMessage');
                logic._data.set('toEmailAddress', 'test@wix.com');
                logic._skinParts.email.value = '.sdsd@ @@##';
                logic._skinParts.submit.click();
                expect(logic._skinParts.notifications.innerText).toEqual(expectedMessage);
            });

            it("hidden field cannot be required (what has been seen cannot be unseen)", function () {
                var callMe = false;

                spyOn(logic, '_sendMail').andCallFake(function(){
                    callMe = true
                });

                logic._data.set('toEmailAddress', 'kekekeke@kekekeke.com');
                logic._properties.set('required_nameFieldLabel', true);
                logic._properties.set('hidden_nameFieldLabel', false);
                logic._doUpdateInput('name');
                logic._skinParts.submit.click();

                expect(callMe).toBe(true);

            });
        });
    });
});
