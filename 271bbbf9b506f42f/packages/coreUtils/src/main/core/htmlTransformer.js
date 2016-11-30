define(['lodash', 'coreUtils/core/htmlParser'], function(_, htmlParser){
    'use strict';

    /**
     * @param {object} attributes
     * @returns {string}
     */
    function getAttributesString(attributes){
        return _.reduce(attributes, function(result, attrObj){
            return result + ' ' + attrObj.name + '="' + attrObj.escaped + '" ';
        }, '');
    }

    function transformHTMLString( html, handler ) {
        var htmlResult = "";
        var currentTag = '';

        htmlParser(html, {
            start: function( tag, attributes, selfClosing ) {
                var result = {
                    tag: tag,
                    attributes: attributes,
                    selfClosing: selfClosing
                };
                currentTag = selfClosing ? '' : tag;
                if (handler.start){
                    result = handler.start(tag, attributes, selfClosing);
                }
                if (result){
                    htmlResult += '<' + result.tag + getAttributesString(result.attributes) + (result.selfClosing ? '/>' : '>');
                }
            },
            end: function( tag ) {
                if (handler.end){
                    tag = handler.end(tag);
                }
                currentTag = '';
                if (tag) {
                    htmlResult += "</" + tag + ">";
                }
            },
            chars: function( text ) {
                if (handler.chars){
                    text = handler.chars(text, currentTag);
                }
                htmlResult += text;
            },
            comment: function( text ) {
                if (handler.comment){
                    text = handler.comment(text);
                }
                if (text) {
                    htmlResult += "<!--" + text + "-->";
                }
            }
        });

        return htmlResult;
    }

    return {
        /**
         * @param {string} html
         * @param {object} handler
         * @returns {*}
         */
        transformHTMLString: transformHTMLString
    };
});
