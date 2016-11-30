
describe('InputValidators', function() {
    beforeEach(function(){

        this.inputValidators = null;
        W.Classes.getClass('wysiwyg.editor.utils.InputValidators', function(Class){
           this.inputValidators  = new Class();
        }.bind(this));
    });

    describe('charactersValidator', function(){
        it('should return undefined with valid input ', function(){
            expect(this.inputValidators.charactersValidator("abcde")).toBe(undefined);
        });

        it('should return an error msg with the first illegal character', function(){
            expect(this.inputValidators.charactersValidator("abcd#e%")).toBe(W.Resources.get('EDITOR_LANGUAGE', 'INPUT_INVALID_CHARACTERS') + " (#)");
            expect(this.inputValidators.charactersValidator("asa<asa")).toBe(W.Resources.get('EDITOR_LANGUAGE', 'INPUT_INVALID_CHARACTERS') + " (<)");
            expect(this.inputValidators.charactersValidator("asa>ss")).toBe(W.Resources.get('EDITOR_LANGUAGE', 'INPUT_INVALID_CHARACTERS') + " (>)");
            expect(this.inputValidators.charactersValidator("asa&sasa")).toBe(W.Resources.get('EDITOR_LANGUAGE', 'INPUT_INVALID_CHARACTERS') + " (&)");
        });
    });

    describe('htmlCharactersValidator', function(){
        it('should return undefined with valid input ', function(){
            expect(this.inputValidators.htmlCharactersValidator("abcde")).toBe(undefined);
            expect(this.inputValidators.htmlCharactersValidator("asa&sasa")).toBe(undefined);
            expect(this.inputValidators.htmlCharactersValidator("abcd#e%")).toBe(undefined);
        });

        it('should return an error msg with the first illegal character', function(){
            expect(this.inputValidators.htmlCharactersValidator("asa<asa")).toBe(W.Resources.get('EDITOR_LANGUAGE', 'INPUT_INVALID_CHARACTERS') + " (<)");
            expect(this.inputValidators.htmlCharactersValidator("asa>ss")).toBe(W.Resources.get('EDITOR_LANGUAGE', 'INPUT_INVALID_CHARACTERS') + " (>)");
        });
    });

    describe('simpleTextValidator', function(){
        it('should return undefined with valid input ', function(){
            expect(this.inputValidators.simpleTextValidator("abcde")).toBe(undefined);
            expect(this.inputValidators.simpleTextValidator("asa&sasa")).toBe(undefined);
            expect(this.inputValidators.simpleTextValidator("abcd#e%")).toBe(undefined);
            expect(this.inputValidators.simpleTextValidator("abcd#e%>")).toBe(undefined);
            expect(this.inputValidators.simpleTextValidator("<abcd#e%")).toBe(undefined);
        });

        it('should return an error msg with the first illegal character', function(){
            expect(this.inputValidators.simpleTextValidator("asa<asa></asa>")).toBe(W.Resources.get('EDITOR_LANGUAGE', 'INPUT_INVALID_CHARACTERS') + " (<asa></asa>)");
            expect(this.inputValidators.simpleTextValidator("asa<>ss")).toBe(W.Resources.get('EDITOR_LANGUAGE', 'INPUT_INVALID_CHARACTERS') + " (<>)");
        });
    });


    describe('alphanumericAndPeriodValidator', function(){
        it('should return undefined with valid input ', function(){
            expect(this.inputValidators.alphanumericAndPeriodValidator("abcde")).toBe(undefined);
            expect(this.inputValidators.alphanumericAndPeriodValidator("asa.sasa")).toBe(undefined);
            expect(this.inputValidators.alphanumericAndPeriodValidator("ab.cd.efgh")).toBe(undefined);
            expect(this.inputValidators.alphanumericAndPeriodValidator("ab1cd2efgh")).toBe(undefined);
            expect(this.inputValidators.alphanumericAndPeriodValidator("1abcd2")).toBe(undefined);
            expect(this.inputValidators.alphanumericAndPeriodValidator("1234abcd")).toBe(undefined);
        });

        it('should return an error msg with the first illegal character', function(){
            expect(this.inputValidators.alphanumericAndPeriodValidator("asa<asa")).toBe(W.Resources.get('EDITOR_LANGUAGE', 'INPUT_INVALID_CHARACTERS') + " (<)");
            expect(this.inputValidators.alphanumericAndPeriodValidator("asa>ss")).toBe(W.Resources.get('EDITOR_LANGUAGE', 'INPUT_INVALID_CHARACTERS') + " (>)");
            expect(this.inputValidators.alphanumericAndPeriodValidator("abcd#ef")).toBe(W.Resources.get('EDITOR_LANGUAGE', 'INPUT_INVALID_CHARACTERS') + " (#)");
            expect(this.inputValidators.alphanumericAndPeriodValidator("asa&sasa")).toBe(W.Resources.get('EDITOR_LANGUAGE', 'INPUT_INVALID_CHARACTERS') + " (&)");
            expect(this.inputValidators.alphanumericAndPeriodValidator("abcdжf")).toBe(W.Resources.get('EDITOR_LANGUAGE', 'INPUT_INVALID_CHARACTERS') + " (ж)");
            expect(this.inputValidators.alphanumericAndPeriodValidator("asa_sasa")).toBe(W.Resources.get('EDITOR_LANGUAGE', 'INPUT_INVALID_CHARACTERS') + " (_)");
        });
    });


    describe('numKeywordValidator', function(){
        it('should return undefined if num of words less than Constants.Page.KEYWORD_SEO_MAX_WORDS', function(){
            expect(this.inputValidators.numKeywordValidator("1 2 3 4 5 6")).toBe(undefined);
        });

        it ('should return an error when num words more than Constants.Page.KEYWORD_SEO_MAX_WORDS', function(){
            expect(this.inputValidators.numKeywordValidator("1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17")).toBe(W.Resources.get('EDITOR_LANGUAGE', 'PAGE_SETTINGS_TOO_MANY_KEYWORDS'));
        });
    });

    describe('pageNameValidator', function(){
        it('should return undefined if length>0 and it doesnt start with &lt', function(){
            expect(this.inputValidators.pageNameValidator("123<456")).not.toBe(undefined);
        });

        it('should return an error if length=0', function(){
            expect(this.inputValidators.pageNameValidator("")).toBe(W.Resources.get('EDITOR_LANGUAGE', 'PAGE_NAME_TOO_SHORT'));
        });

        it('should return an error if it starts with &lt', function(){
            expect(this.inputValidators.pageNameValidator("<54545")).not.toBe(undefined);
        });

        it('should fail for illegal characters', function(){
            // \|\!\#\%\&/\>\<\?
            expect(this.inputValidators.pageNameValidator("abc|def")).not.toBe(undefined);
            expect(this.inputValidators.pageNameValidator("abc#def")).not.toBe(undefined);
            expect(this.inputValidators.pageNameValidator("abc%def")).not.toBe(undefined);
            expect(this.inputValidators.pageNameValidator("abc&def")).not.toBe(undefined);
            expect(this.inputValidators.pageNameValidator("abc/def")).not.toBe(undefined);
            expect(this.inputValidators.pageNameValidator("abc<def")).not.toBe(undefined);
            expect(this.inputValidators.pageNameValidator("abc>def")).not.toBe(undefined);
        });

        it('should be ok for legal characters', function(){
            // \|\!\#\%\&/\>\<\?
            expect(this.inputValidators.pageNameValidator("Hapoel Imperya")).toBe(undefined);
        });

    });

    describe('zeroWidthSpacesRemover', function(){
        it('should return the same string without any changes', function() {
            expect(this.inputValidators.zeroWidthSpacesRemover('abcABC')).toBe('abcABC');
            expect(this.inputValidators.zeroWidthSpacesRemover('!@#$%^&*()')).toBe('!@#$%^&*()');
            expect(this.inputValidators.zeroWidthSpacesRemover('\n\r\t')).toBe('\n\r\t');
        });

        it('should remove zero width space characters and return a shorter string', function() {
            var str = '\u2029abc\u2028d\u200B';
            var actual = this.inputValidators.zeroWidthSpacesRemover(str);
            expect(actual).toEqual('abcd');
        });

        it('should remove only zero width space characters and leave other unicode characters in place', function() {
            var str = '\u201Dabc\u2028';
            var actual = this.inputValidators.zeroWidthSpacesRemover(str);
            expect(actual).toEqual('\u201Dabc');
            expect(actual).toEqual('”abc');
        });
    });

});


describeExperiment({'HeaderTagsValidation': 'New'}, "HeaderTagsValidationSpec", function () {
    beforeEach(function(){

        this.inputValidators = null;
        W.Classes.getClass('wysiwyg.editor.utils.InputValidators', function(Class){
            this.inputValidators  = new Class();
        }.bind(this));
    });

    describe('_headerTagsValidator', function(){
        it('should return undefined with valid input ', function(){
            expect(this.inputValidators._headerTagsValidator('<abcde>')).toBe(undefined);
            expect(this.inputValidators._headerTagsValidator('  <  abcde  >  ')).toBe(undefined);
            expect(this.inputValidators._headerTagsValidator('<')).toBe(undefined);
            expect(this.inputValidators._headerTagsValidator('<<')).toBe(undefined);
            expect(this.inputValidators._headerTagsValidator('   ')).toBe(undefined);
            expect(this.inputValidators._headerTagsValidator('<\n')).toBe(undefined);
            expect(this.inputValidators._headerTagsValidator('<\n fdgfg')).toBe(undefined);
            expect(this.inputValidators._headerTagsValidator('<meta desc="gaga"')).toBe(undefined);
        });

        it('should return an error msg with the first illegal character', function(){
            expect(this.inputValidators._headerTagsValidator('<!asdf')).toBe(W.Resources.get('EDITOR_LANGUAGE', 'HEADER_TAGS_INVALID_CHARS_ERROR') + " (!)");
            expect(this.inputValidators._headerTagsValidator('<?asdf')).toBe(W.Resources.get('EDITOR_LANGUAGE', 'HEADER_TAGS_INVALID_CHARS_ERROR') + " (?)");
            expect(this.inputValidators._headerTagsValidator('dsfgsdgf')).toBe(W.Resources.get('EDITOR_LANGUAGE', 'HEADER_TAGS_SHOULD_START_WITH_TAG_BRACKET'));
            expect(this.inputValidators._headerTagsValidator('<dsfgsdgf>dsfgsdgf')).toBe(W.Resources.get('EDITOR_LANGUAGE', 'HEADER_TAGS_SHOULD_START_WITH_TAG_BRACKET'));
        });
    });


});