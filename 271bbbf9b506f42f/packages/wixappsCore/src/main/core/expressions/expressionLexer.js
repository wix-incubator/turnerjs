define(['lodash'], function (_) {
    "use strict";

    var currentChar;

    function parseExpression(source) {
        if (source.length) {
            var token = _findString(source) || _findSymbol(source) || _findBracket(source);
            return token ? [token].concat(this.parseExpression(source.slice(token.length))) : this.parseExpression(source.slice(1));
        }
        return [];
    }

    function _findString(source) {
        var strSeparators = ["'", '"'];
        var extractString = function (src, separator) {
            if (src.length) {
                currentChar = src.charAt(0);
                if (currentChar === "\\" && src.length > 1) {
                    return currentChar + src.charAt(1) + extractString(src.slice(2), separator);
                } else if (currentChar !== separator) {
                    return currentChar + extractString(src.slice(1), separator);
                }
            }
            return "";
        };
        currentChar = source.charAt(0);
        if (_.includes(strSeparators, currentChar)) {
            return '"' + extractString(source.slice(1), currentChar) + '"';
        }
    }

    function _findSymbol(source) {
        var firstCharPattern = /[\w\*\/\-\%\+\$]/;
        var nextCharPattern = /[\w\*\/\-\%\+\.\$\[\]\?_]/;
        var extractSymbol = function (src) {
            var currentSymbolChar = src.charAt(0);
            return src.length && currentSymbolChar.match(nextCharPattern) ? currentSymbolChar + extractSymbol(src.slice(1)) : "";
        };

        var firstChar = source.charAt(0);
        if (firstChar.match(firstCharPattern)) {
            return firstChar + extractSymbol(source.slice(1));
        }
    }

    function _findBracket(source) {
        currentChar = source.charAt(0);
        if (currentChar === "(" || currentChar === ")") {
            return currentChar;
        }
    }

    return {
        parseExpression: parseExpression
    };
});
