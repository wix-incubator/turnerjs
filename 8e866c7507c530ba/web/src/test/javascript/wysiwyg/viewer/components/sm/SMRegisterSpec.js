describe("SiteMembers Password characters containing non-ascii chars fix.", function(){

    testRequire()
        .classes('wysiwyg.viewer.components.sm.SMFormValidationHelper')
        .components('wysiwyg.viewer.components.sm.SMRegister','wysiwyg.viewer.components.sm.SMContainer')
        .resources('W.SiteMembers', 'W.Utils');

    beforeEach(function(){
        this.smCont = new this.SMContainer("testId", new Element('div'),{dialogsLanguage:"en"});
        this.smRegisterComp = new this.SMRegister("testId", new Element("div"), {container:this.smCont});
    });

    describe("SiteMember Register for signing up a new member.", function() {
        it("Should accept passwords containing all ascii characters.", function() {
            var VALID_EMAIL         = "tester@wix.com" ;
            var validPasswords      = [
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

            for(var k=0; k < validPasswords.length; k++){
                var validPassword = validPasswords[k] ;
                var isValid = this.smRegisterComp._validateFields(VALID_EMAIL, validPassword, validPassword);
                expect(isValid).toBeTruthy() ;
            }
        }) ;
    }) ;
});