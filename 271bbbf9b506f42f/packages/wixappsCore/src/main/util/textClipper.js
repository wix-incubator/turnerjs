define(['lodash', 'utils'], function (_, utils) {
    'use strict';

    var htmlParser = utils.htmlParser;
    var HTML_ENTITIES = ['&nbsp;', '&lt;', '&gt;', '&amp;', '&cent;', '&pound;', '&yen;', '&euro;', '&copy;', '&reg;'];

    function getEscapedLength(text) {
        return _.reduce(HTML_ENTITIES, function replaceHtmlEntityWithOneChar(res, htmlEntity) {
            return res.replace(htmlEntity, '*');
        }, text).length;
    }

    function escapedSubstr(text, length) {
        // we can't simply use substr, because, special html
        // entities should be treated as if they have length 1.
        var htmlEntitiesRegexp = new RegExp('(' + HTML_ENTITIES.join('|') + ')');
        var clippedText = '';
        var charsCollected = 0;
        while (charsCollected < length && text.length > 0) {
            var htmlEntityOccurrence = htmlEntitiesRegexp.exec(text);
            var index = htmlEntityOccurrence ? htmlEntityOccurrence.index : text.length;
            var part = text.substr(0, index);
            part = part.substr(0, length - charsCollected);
            charsCollected += part.length;
            if (charsCollected < length && htmlEntityOccurrence) {
                part += htmlEntityOccurrence[0];
                charsCollected += 1;
            }
            text = text.substr(part.length);
            clippedText += part;
        }

        return clippedText;
    }

    function trimTrailingSpaces(text) {
        return text.replace(new RegExp('(\\s|&nbsp;)+$'), '');
    }

    /**
     * This function parses rich text (HTML), counts only characters between tags
     * in order to truncate text using a final state machine.
     * @param textContent   the rich html text to parse
     * @param maxChars      the maximum characters to return
     * @return {string}     VALID html with length "maxChars"
     */
    function clipText(textContent, maxChars) {
        var output = [];
        var closingTagsStack = [];
        var stopClipping = false;
        var charsCollected = 0;

        htmlParser(textContent, {
            start: function (tagName, attributes, isSingleton, tag) {
                if (stopClipping) {
                    return;
                }

                output.push(tag);
                if (!isSingleton) {
                    closingTagsStack.push('</' + tagName + '>');
                }
            },
            chars: function (text) {
                if (stopClipping) {
                    return;
                }

                var escapedLength = getEscapedLength(text);
                if (charsCollected + escapedLength <= maxChars) {
                    charsCollected += escapedLength;
                    output.push(text);
                } else {
                    stopClipping = true;
                    var clippedText = escapedSubstr(text, maxChars - charsCollected);

                    output.push(trimTrailingSpaces(clippedText));
                    output.push("...");

                    while (closingTagsStack.length > 0) {
                        output.push(closingTagsStack.pop());
                    }
                }
            },
            end: function () {
                if (stopClipping) {
                    return;
                }
                output.push(closingTagsStack.pop());
            }
        });

        return output.join("");
    }

    return {
        clipText: clipText
    };

});
