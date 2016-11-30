describe("SMResetPasswordEmail", function(){

    testRequire()
        .components('wysiwyg.viewer.components.sm.SMResetPasswordEmail','wysiwyg.viewer.components.sm.SMContainer')
        .resources('W.SiteMembers');

    beforeEach(function(){
        var formContainer = new Element("div") ;
        this.smCont = new this.SMContainer("testId", new Element('div'),{dialogsLanguage:"en"});
        this.smResetPassEmailComp = new this.SMResetPasswordEmail("testId", new Element("div"), {container: this.smCont});
        this.smResetPassEmailComp._email = {setValidationState: function stubFunc(value){}} ;
    });

    describe("SMResetPasswordEmail component", function() {
        describe("Sending password reset request", function() {
            it("should send a request to the Site Members manager to ask for password reset with valid email.", function () {
                var email = "john.smith@wix.com" ;
                spyOn(this.smResetPassEmailComp, "_getEmailInput").andReturn(email) ;
                spyOn(this.smResetPassEmailComp, "_isEmailFieldValid").andReturn(true) ;
                spyOn(this.SiteMembers, "sendUserPasswordResetEmail") ;

                this.smResetPassEmailComp.onSubmit() ;

                expect(this.SiteMembers.sendUserPasswordResetEmail).toHaveBeenCalledWith(email,
                                                                                this.smResetPassEmailComp._onFormSuccess,
                                                                                this.smResetPassEmailComp._onFormError) ;
            }) ;

            it("should NOT send a request to ask for password reset with an invalid email.", function () {
                var email = "john.smith@wix.com" ;
                spyOn(this.smResetPassEmailComp, "_getEmailInput").andReturn(email) ;
                spyOn(this.smResetPassEmailComp, "_isEmailFieldValid").andReturn(false) ;
                spyOn(this.SiteMembers, "sendUserPasswordResetEmail") ;

                this.smResetPassEmailComp.onSubmit() ;

                expect(this.SiteMembers.sendUserPasswordResetEmail).not.toHaveBeenCalled() ;
            }) ;
        }) ;

        describe("Email validation", function() {
            it("should validate the given email is not blank before delegating request.", function() {
                spyOn(this.smResetPassEmailComp, "_onFormError") ;
                var blankEmail = "" ;

                var isEmailValid = this.smResetPassEmailComp._isEmailFieldValid(blankEmail) ;

                expect(isEmailValid).toBeFalsy();
            }) ;

            it("should validate that the given email conforms to an email pattern, before delegating request.", function() {
                spyOn(this.smResetPassEmailComp, "_onFormError") ;
                var invalidEmail1 = "i am an invalid email address 1" ;
                var invalidEmail2 = "i am invalid@wix.com2" ;
                var invalidEmail3 = "i@am.also@invalid.com" ;

                var isEmailValid1 = this.smResetPassEmailComp._isEmailFieldValid(invalidEmail1) ;
                var isEmailValid2 = this.smResetPassEmailComp._isEmailFieldValid(invalidEmail2) ;
                var isEmailValid3 = this.smResetPassEmailComp._isEmailFieldValid(invalidEmail3) ;

                expect(isEmailValid1).toBeFalsy();
                expect(isEmailValid2).toBeFalsy();
                expect(isEmailValid3).toBeFalsy();
            }) ;

            it("should confirm that a valid given email conforms to an email pattern, before delegating request.", function() {
                var validEmail = "john.smith@wix.com" ;

                var isEmailValid = this.smResetPassEmailComp._isEmailFieldValid(validEmail) ;

                expect(isEmailValid).toBeTruthy();
            }) ;
        }) ;
    });
});
