define.Class('wysiwyg.editor.utils.InputValidators',  function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.binds(['headerTagsValidator', 'charactersValidator', 'htmlCharactersValidator', 'numKeywordValidator', 'alphanumericAndPeriodValidator', 'pageNameCharactersValidator', 'pageNameValidator', 'simpleTextValidator', 'zeroWidthSpacesRemover']);

    def.resources(['W.Resources']);

    def.methods({

        headerTagsValidator : function (text) {
            var match = text.match("[^<>a-zA-Z0-9_@.:+'/ \"\n=-]");
            if(match !== null) {
                return this.resources.W.Resources.get('EDITOR_LANGUAGE', 'HEADER_TAGS_INVALID_CHARS_ERROR') + " (" + match.join() + ")";
            }
            match = text.match(/^ *(<[a-zA-Z0-9_@.:+'/ \"\n=-]*>*[ \n]*)*$/);
            if (match === null) {
                return this.resources.W.Resources.get('EDITOR_LANGUAGE', 'HEADER_TAGS_SHOULD_START_WITH_TAG_BRACKET');
            }
        },

        _generalCharactersValidator : function (text, invalidChars) {
            var re = new RegExp("[" + invalidChars + "]");
            var match = text.match(re);
            if(match !== null) {
                return this.resources.W.Resources.get('EDITOR_LANGUAGE', 'INPUT_INVALID_CHARACTERS') + " (" + match.join() + ")";
            }
        },

        charactersValidator : function (text) {
            return this._generalCharactersValidator(text, Constants.Page.INVALID_CHARACTERS);
        },

        simpleTextValidator : function (text) {
            var re = new RegExp("<.*>");
            var match = text.match(re);
            if(match !== null) {
                return this.resources.W.Resources.get('EDITOR_LANGUAGE', 'INPUT_INVALID_CHARACTERS') + " (" + match.join() + ")";
            }
        },

        alphanumericAndPeriodValidator : function (text) {
            var re = new RegExp("[^a-zA-Z0-9\.]");
            var match = text.match(re);
            if(match !== null) {
                return this.resources.W.Resources.get('EDITOR_LANGUAGE', 'INPUT_INVALID_CHARACTERS') + " (" + match.join() + ")";
            }
        },

        htmlCharactersValidator : function (text) {
            return this._generalCharactersValidator(text, "><");
        },

        numKeywordValidator : function (text) {
            var wordList = text.split(/\W+/);
            if(wordList.length > Constants.Page.KEYWORD_SEO_MAX_WORDS) {
                return this.resources.W.Resources.get('EDITOR_LANGUAGE', 'PAGE_SETTINGS_TOO_MANY_KEYWORDS');
            }
        },

        pageNameCharactersValidator : function (text) {
            var re = new RegExp("[" + Constants.Page.INVALID_PAGE_NAME_CHARACTERS + "]");
            var match = text.match(re);
            if(match !== null) {
                return this.resources.W.Resources.get('EDITOR_LANGUAGE', 'INPUT_INVALID_CHARACTERS') + " (" + match.join() + ")";
            }

            re = new RegExp("[^\x00-\x7F]"); // non ascii
            match = text.match(re);
            if(match !== null) {
                return this.resources.W.Resources.get('EDITOR_LANGUAGE', 'INPUT_INVALID_CHARACTERS') + " (" + match.join() + ")";
            }

        },
        pageNameValidator: function(text) {
            if (text.length==0) {
                return this.resources.W.Resources.get('EDITOR_LANGUAGE', 'PAGE_NAME_TOO_SHORT');
            }
            return this.pageNameCharactersValidator(text);
        },
        zeroWidthSpacesRemover: function (text) {
            var re = new RegExp('\u2028|\u2029|\u200B', 'g');
            return text.replace(re, '');
        }
    });
});
