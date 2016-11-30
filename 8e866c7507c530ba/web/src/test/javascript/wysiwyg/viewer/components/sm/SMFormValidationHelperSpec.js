describe("A SiteMembers Form Validation Helper", function() {

    testRequire()
        .classes('wysiwyg.viewer.components.sm.SMFormValidationHelper')
        .resources('W.Utils') ;

    beforeEach(function() {
        this.validator = new this.SMFormValidationHelper() ;
    });

    describe("Password validation tests", function() {
        it("Should return true iff a blank password is passed", function() {
            var undefinedPassword = undefined ;
            var nullPassword    = null ;
            var password        = "" ;

            var isBlank = this.validator.isBlankPassword(password) ;
            var isNullBlank = this.validator.isBlankPassword(nullPassword) ;
            var isUndefinedBlank = this.validator.isBlankPassword(undefinedPassword) ;

            expect(isBlank).toBeTruthy() ;
            expect(isNullBlank).toBeTruthy() ;
            expect(isUndefinedBlank).toBeTruthy() ;
        }) ;

        it("should return true iff the password length is valid", function() {
            var validPassword = "abc!384&$71" ;
            var invalidPassword = "abc" ;
            var invalidPassword2 = "abcdefghijklmnopqrstuvwxyz" ;

            var isvalidLength = this.validator.isPasswordLengthValid(validPassword) ;
            var isInvalidLength = this.validator.isPasswordLengthValid(invalidPassword) ;
            var isInvalidLength2 = this.validator.isPasswordLengthValid(invalidPassword2) ;

            expect(isvalidLength).toBeTruthy() ;
            expect(isInvalidLength).toBeFalsy() ;
            expect(isInvalidLength2).toBeFalsy() ;
        }) ;

        it("should return true iff the password does not contain '#'.", function() {
            var password = "abcd284671" ;
            var rePassword = password + "~" ;

            var nonMatching = this.validator.doPasswordsMatch(password, rePassword) ;
            var matching = this.validator.doPasswordsMatch(password, password) ;

            expect(nonMatching).toBeFalsy() ;
            expect(matching).toBeTruthy() ;
        }) ;
    }) ;

    describe("Email validation tests", function() {
        it("should return true for a validating a blank email", function() {
            var email = "" ;
            var emailUndefined = undefined ;
            var emailNull = null ;
            var nonBlankEmail = "john.doe@wix.com" ;

            var isEmailBlank1 = this.validator.isEmailBlank(email) ;
            var isEmailBlank2 = this.validator.isEmailBlank(emailUndefined) ;
            var isEmailBlank3 = this.validator.isEmailBlank(emailNull) ;
            var isEmailBlank4 = this.validator.isEmailBlank(nonBlankEmail) ;

            expect(isEmailBlank1).toBeTruthy() ;
            expect(isEmailBlank2).toBeTruthy() ;
            expect(isEmailBlank3).toBeTruthy() ;
            expect(isEmailBlank4).toBeFalsy() ;
        }) ;

        it("should return true for a validating a valid email address", function() {
            var validEmail = "john.doe@wix.com" ;
            var invalidEmail1 = "john@doe@wix.com" ;
            var invalidEmail2 = "john-doe@wi.x/com" ;
            var invalidEmail3 = "john-doe@wi.x#com" ;

            var isEmailValid1 = this.validator.isEmailValid(validEmail) ;
            var isEmailValid2 = this.validator.isEmailValid(invalidEmail1) ;
            var isEmailValid3 = this.validator.isEmailValid(invalidEmail2) ;
            var isEmailValid4 = this.validator.isEmailValid(invalidEmail3) ;

            expect(isEmailValid1).toBeTruthy() ;
            expect(isEmailValid2).toBeFalsy() ;
            expect(isEmailValid3).toBeFalsy() ;
            expect(isEmailValid4).toBeFalsy() ;
        }) ;
    }) ;


    describe("Testing the SM Password permitted chars, which tests for characters validity", function(){
        it("should verify that there are only ascii characters used in the input.", function(){
            var validInputs      = [
                "!\"#$%&'",
                "()*+,-./0",
                "123456789:;<=",
                ">?@ABCDEFG",
                "HIJKLMNOPQR",
                "STUVWX",
                "YZ[\\]^_",
                "`abcdefg",
                "hijklmn",
                "opqrstu",
                "vwxyz{|}~"
            ] ;

            for(var k=0; k < validInputs.length; k++){
                var validInput = validInputs[k] ;
                var isValid = this.validator._isAsciiOnlyInput(validInput);
                expect(isValid).toBeTruthy() ;
            }
        }) ;

        it("should verify that non-ascii characters are not an acceptable input.", function() {
            var invalidInput = '';
            invalidInput += String.fromCharCode(0x05D5);
            invalidInput += String.fromCharCode(0x05D5);
            invalidInput += String.fromCharCode(0x05D9);
            invalidInput += String.fromCharCode(0x05E7);
            invalidInput += String.fromCharCode(0x05E1) ;

            var isValid = this.validator._isAsciiOnlyInput(invalidInput);
            expect(isValid).toBeFalsy() ;
        }) ;
    }) ;
}) ;
