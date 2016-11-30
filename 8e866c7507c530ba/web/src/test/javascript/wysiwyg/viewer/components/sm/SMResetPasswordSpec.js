describe("SMResetPassword", function(){

    testRequire()
        .classes('core.managers.components.ComponentBuilder')
        .components('wysiwyg.viewer.components.sm.SMResetPassword','wysiwyg.viewer.components.sm.SMContainer')
        .resources('W.SiteMembers');

    beforeEach(function(){
        this.smCont = new this.SMContainer("testId", new Element('div'),{dialogsLanguage:"en"});
        this.smResetPassComp = new this.SMResetPassword("fake-id", new Element('div'), {container:this.smCont});
        this.smResetPassComp._onFormError = function(errorObject, fieldOfError){} ;
    });

    describe("SMResetPassword form", function() {
        it("should validate that the new password is not empty.", function () {
            var blankPassword = "" ;
            var nullPassword = null ;
            var undefinedPassword = undefined ;

            var isBlankValid = this.smResetPassComp._validatePasswordAndReportError(blankPassword) ;
            var isNullValid = this.smResetPassComp._validatePasswordAndReportError(nullPassword) ;
            var isUndefinedValid = this.smResetPassComp._validatePasswordAndReportError(undefinedPassword) ;

            expect(isBlankValid).toBeFalsy() ;
            expect(isNullValid).toBeFalsy() ;
            expect(isUndefinedValid).toBeFalsy() ;
        }) ;

        it("should validate that short passwords are invalid.", function() {
            var shortPassword = "abc" ;

            var isShortValid = this.smResetPassComp._validatePasswordAndReportError(shortPassword) ;

            expect(isShortValid).toBeFalsy() ;
        }) ;

        it("should validate passwords that are 4-15 characters.", function() {
            var validPassword   = "abcd" ;
            var validPassword2  = "AbcdeAbcdeAbcde" ;

            var isValid1 = this.smResetPassComp._validatePasswordAndReportError(validPassword) ;
            var isValid2 = this.smResetPassComp._validatePasswordAndReportError(validPassword2) ;

            expect(isValid1).toBeTruthy() ;
            expect(isValid2).toBeTruthy() ;
        });

        it("should validate passwords that are at most 15 characters.", function() {
            var validPassword = "AbcdeAbcdeAbcde" + "1" ;

            var isValid = this.smResetPassComp._validatePasswordAndReportError(validPassword) ;

            expect(isValid).toBeFalsy() ;
        }) ;

        it("should expect that new password containing retyped password dont match.", function() {
            spyOn(this.smResetPassComp, "_getPasswordText").andReturn("password1") ;
            spyOn(this.smResetPassComp, "_getRetypedPasswordText").andReturn("password2") ;

            var doPasswordsMatch = this.smResetPassComp._doPasswordsMatch() ;

            expect(doPasswordsMatch).toBeFalsy() ;
        }) ;

        it("should expect that new password contained by retyped password dont match.", function() {
            spyOn(this.smResetPassComp, "_getPasswordText").andReturn("Secret") ;
            spyOn(this.smResetPassComp, "_getRetypedPasswordText").andReturn("Secret2") ;

            var doPasswordsMatch = this.smResetPassComp._doPasswordsMatch() ;

            expect(doPasswordsMatch).toBeFalsy() ;
        }) ;

        it("should expect that new password that is equal to retyped password match.", function() {
            spyOn(this.smResetPassComp, "_getPasswordText").andReturn("Secret") ;
            spyOn(this.smResetPassComp, "_getRetypedPasswordText").andReturn("Secret") ;

            var doPasswordsMatch = this.smResetPassComp._doPasswordsMatch() ;

            expect(doPasswordsMatch).toBeTruthy() ;
        }) ;

        it("should redirect the user to a 'success' dialog in case password was changed.", function() {
            var userPassword = "Secret";
            spyOn(this.smResetPassComp, "_getPasswordText").andReturn(userPassword) ;
            spyOn(this.smResetPassComp, "_getRetypedPasswordText").andReturn(userPassword) ;
            this.smResetPassComp._password          = {setValidationState: function(state){}};
            this.smResetPassComp._passwordRetype    = {setValidationState: function(state){}};

            spyOn(W.SiteMembers, "resetPassword") ;

            this.smResetPassComp.onSubmit() ;

            expect(W.SiteMembers.resetPassword).toHaveBeenCalledWith(userPassword,
                                                                    this.smResetPassComp._onSuccessfulReset,
                                                                    this.smResetPassComp._onFailedReset) ;
        }) ;

    });
});
