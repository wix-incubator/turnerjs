/** @class wysiwyg.common.behaviors.utilities.SplitHtmlText */
define.experiment.newClass('wysiwyg.common.behaviors.utilities.SplitHtmlText.AnimationText', function(classDefinition) {

    /** @type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.statics({
        _matchTagsAndText: /(<[^>]*>)|([^<>]+)/g,
        _matchWordsSpaces: /(\S+)|(\s+)/g,
        _matchStartTag: /(<[^\/][^>]*>)/,
        _matchCloseTag: /(<\/[^>]*>)/,
        _matchTagName: /<\/?(\w+)/,
        _matchSpace: /\s+/g,
        _matchSpaceLeft: /^\s+/,
        _matchSpaceOnly: /^\s+$/,
        _matchCarriageReturns: /[\n\r\f]+/g,
        _matchEntityOrChar: /(&#?[\w\d]+;)|./g,
        _tags: {
            space: 'space',
            word: 'word',
            letter: 'letter'
        },
        _parseTypes: {
            defaultType: 'letters',
            letters: 'letters',
            words: 'words',
            paragraphs: 'paragraphs'
        },
        _isInSpace: false,
        _isInWord: false,
        _inlines: ['a', 'abbr', 'acronym', 'applet', 'b', 'basefont', 'bdo', 'big', 'br', 'button', 'cite', 'code', 'del', 'dfn', 'em', 'font', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'label', 'map', 'object', 'q', 's', 'samp', 'script', 'select', 'small', 'span', 'strike', 'strong', 'sub', 'sup', 'textarea', 'tt', 'u', 'var'],
        _blocks: ['address', 'article', 'applet', 'aside', 'audio', 'blockquote', 'button', 'canvas', 'center', 'dd', 'del', 'dir', 'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'iframe', 'ins', 'isindex', 'li', 'map', 'menu', 'noframes', 'noscript', 'object', 'ol', 'output', 'p', 'pre', 'section', 'script', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul', 'video'],
        _empties: ['area', 'base', 'basefont', 'br', 'col', 'frame', 'hr', 'img', 'input', 'isindex', 'link', 'meta', 'param', 'embed'],

    });

    def.methods({

        /**
         * Create an instance of the SplitHtmlText class.
         */
        initialize: function() {

            //TODO: these should be static
            this._word = {
                openTag: '<' + this._tags.word + '>',
                closeTag: '</' + this._tags.word + '>',
                openSpaceTag: '<' + this._tags.word + ' class="' + this._tags.space + '">'
            };
            this._letter = {
                openTag: '<' + this._tags.letter + '>',
                closeTag: '</' + this._tags.letter + '>',
                openSpaceTag: '<' + this._tags.letter + ' class="' + this._tags.space + '">'
            };
        },


        isReady: function() {
            return true;
        },

        /**
         * The main function of this class, parse an innerHTML string and return an innerHTML string
         * split into words and letters
         * @param {string} htmlText
         * @param {string} [type='letters'] 'letters', 'words'
         * @returns {string}
         * @private
         */

        split: function(htmlText, type) {
            var htmlTextList = htmlText.match(this._matchTagsAndText);//this._arrayFromHtmlTextWordsAndTags(htmlText);
            var tagName, parsedText = '';
            this._openingTags = [];
            this._closingTags = [];
            this._isInWord = false;
            this._isStartOfBlock = false;
            var i, value;

            for (i = 0; i < htmlTextList.length; i++) {
                value = htmlTextList[i];

                // If value is an opening tag
                if (this._matchStartTag.test(value)) {
                    parsedText += this._handleStartTag(value);
                    tagName = value.match(this._matchTagName)[1];
                    this._isStartOfBlock = (this._blocks.indexOf(tagName) >= 0);
                }

                // If value is a closing tag
                else if (this._matchCloseTag.test(value)) {
                    parsedText += this._handleCloseTag(value);
                }

                //If value is a space
                else if (this._matchSpaceOnly.test(value)) {
                    continue;
                }

                //If value is text
                else if (value !== '') {
                    parsedText += this._handleText(value, type);
                }
            }

            //If parsing is done but we haven't closed the last word
            if (this._isInWord) {
                parsedText += this._word.closeTag;
            }

            delete this._openingTags;
            delete this._closingTags;
            delete this._isInWord;
            delete this._isStartOfBlock;

            return parsedText;
        },

        /**
         * Helper for _getParsedHtml, handle start tag
         * @param {string} value
         * @returns {string}
         * @private
         */
        _handleStartTag: function(value) {
            var tagName = value.match(this._matchTagName)[1];
            var parsedValue = '';
            // If block tag
            if (this._blocks.indexOf(tagName) > -1) {
                parsedValue = value;
            }

            // If empty tag
            else if (this._empties.indexOf(tagName) > -1) {
                if (this._isInWord) {
                    parsedValue = this._word.closeTag + value;
                    this._isInWord = false;
                }
                parsedValue += value;

            }

            // else if inline tag
            else {
                this._openingTags.push(value);
                this._closingTags.unshift('</' + tagName + '>');
            }

            return parsedValue;
        },

        /**
         *  Helper for _getParsedHtml, handle closing tag
         * @param {string} value
         * @returns {string}
         * @private
         */
        _handleCloseTag: function(value) {
            var tagName = value.match(this._matchTagName)[1];
            var parsedValue = '';

            // If block tag
            if (this._blocks.indexOf(tagName) > -1) {
                if (this._isInWord) {
                    parsedValue = this._word.closeTag + value;
                    this._isInWord = false;
                }
                parsedValue += value;

            }

            // Else if inline tag
            else if (value === this._closingTags[0]) {
                this._openingTags.pop();
                this._closingTags.shift();
            }

            return parsedValue;
        },

        /**
         *  Helper for _getParsedHtml, handle text
         * @param value
         * @param {string} [type='letters']
         * @returns {string}
         * @private
         */
        _handleText: function(value, type) {
            var i, text;
            var parsedValue = '';
            value = this._trimRedundantSpaces(value);
            value = value.match(this._matchWordsSpaces);
            for (i = 0; i < value.length; i++) {
                text = value[i];
                if (this._matchSpaceOnly.test(text)) {
                    parsedValue += this._handleSpace(text, type);
                }
                else {
                    parsedValue += this._handleWord(text, type);
                }
            }
            return parsedValue;
        },

        /**
         * Helper for _getParsedHtml, handle spaces
         * @param {string} value
         * @param {string} [type='letters']
         * @returns {string}
         * @private
         */
        _handleSpace: function(value, type) {
            var parsedValue = '';

            if (this._isInWord) {
                parsedValue = this._word.closeTag;
                this._isInWord = false;
            }

            if (type === this._parseTypes.letters) {
                parsedValue += [].concat(this._letter.openSpaceTag, this._openingTags, [value], this._closingTags, this._letter.closeTag).join('');
            }

            else if (type === this._parseTypes.words) {
                parsedValue += [].concat(this._word.openSpaceTag, this._openingTags, [value], this._closingTags, this._word.closeTag).join('');
            }

            return parsedValue;
        },

        /**
         *  Helper for _getParsedHtml, handle words & non-spaces
         * @param value
         * @param {string} [type='letters']
         * @returns {string}
         * @private
         */
        _handleWord: function(value, type) {
            var letter, i;
            var parsedValue = '';

            if (!this._isInWord) {
                parsedValue = this._word.openTag;
                this._isInWord = true;
            }

            if (type === this._parseTypes.letters) {
                value = value.match(this._matchEntityOrChar);
                for (i = 0; i < value.length; i++) {
                    letter = value[i];
                    parsedValue += [].concat(this._letter.openTag, this._openingTags, [letter], this._closingTags, this._letter.closeTag).join('');
                }
            }
            else {
                parsedValue += [].concat(this._openingTags, [value], this._closingTags).join('');
            }

            return parsedValue;
        },

        /**
         * Helper for _getParsedHtml to remove spaces and new-lines which are ignored in html layout
         * @param {string} htmlText
         * @returns {string}
         * @private
         */
        _trimRedundantSpaces: function(htmlText) {
            if(this._isStartOfBlock){
                htmlText = htmlText.replace(this._matchSpaceLeft, '');
            }
            htmlText = htmlText.replace(this._matchCarriageReturns, '');
            htmlText = htmlText.replace(this._matchSpace, ' ');
            return htmlText;
        }
    });
});