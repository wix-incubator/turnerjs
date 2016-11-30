define(["wixappsCore/core/expressions/expressionLexer"], function (expressionLexer) {
    "use strict";

    var DIALECT_JS = 0,
        DIALECT_LISP = 1;

    function parseExpressionSource(part) {
        var tokenList = expressionLexer.parseExpression(part);
        var dialect = (tokenList[0] === '(') ? DIALECT_LISP : DIALECT_JS;
        var codeTree = _foldTokenList(tokenList, dialect);
        return _foldFunctionChain(codeTree);
    }

    function _foldTokenList(tokenList, dialect) {
        if (tokenList.length) {
            var result = _getFunction(tokenList, dialect) || _getPrimitive(tokenList, dialect) || _getReference(tokenList, dialect);
            if (result) {
                return [result.node].concat(_foldTokenList(result.next, dialect));
            }
        }
        return [];
    }

    function _foldFunctionChain(nodeList) {
        function isFunction(item) {
            return item.type === "function";
        }
        // is function  chain?
        if (nodeList.length > 0 && nodeList.every(isFunction)) {
            var foldedNode = nodeList.slice(1).reduce(function (acc, item) {
                return {
                    type: item.type,
                    content: item.content,
                    params: [acc].concat(_foldFunctionChain(item.params))
                };
            }, nodeList[0]);
            return [foldedNode];
        }
        return nodeList;
    }

    function _getFunction(tokenList, dialect) {
        var bracketsPos = (dialect === DIALECT_LISP) ? 0 : 1;
        var funcNamePos = (dialect === DIALECT_LISP) ? 1 : 0;
        if (tokenList[bracketsPos] === "(" && typeof tokenList[funcNamePos] === "string") {
            var funcParams = _getFuncParams(tokenList);
            return {
                next: tokenList.slice(funcParams.length + 3),
                node: {
                    type: "function",
                    content: tokenList[funcNamePos],
                    params: _foldTokenList(funcParams, dialect)
                }
            };
        }
    }

    function _getFuncParams(tokenList) {
        var getFuncParamsInternal = function (tokens, bracketCount) {
            if (!(tokens.length && bracketCount > 0)) {
                return [];
            }

            var token = tokens[0];
            var rest = tokens.slice(1);

            switch (token) {
                case "(":
                    return [token].concat(getFuncParamsInternal(rest, bracketCount + 1));
                case ")":
                    return [token].concat(getFuncParamsInternal(rest, bracketCount - 1));
                default :
                    return [token].concat(getFuncParamsInternal(rest, bracketCount));
            }
        };
        return getFuncParamsInternal(tokenList.slice(2), 1).slice(0, -1);
    }

    function _getPrimitive(tokenList) {
        var value;
        var candidate = tokenList[0];
        if (candidate === "true") {
            value = true;
        } else if (candidate === "false") {
            value = false;
        } else if ((candidate.charAt(0) === '\"' && candidate.charAt(candidate.length - 1) === '\"') || (candidate.charAt(0) === "'" && candidate.charAt(candidate.length - 1) === "'")) {
            value = _unescapeString(candidate.slice(1, candidate.length - 1));
        } else if (!isNaN(parseFloat(candidate, 10))) {
            value = parseFloat(candidate, 10);
        } else if (!isNaN(parseInt(candidate, 10))) {
            value = parseInt(candidate, 10);
        }

        if (value !== undefined) {
            return {
                next: tokenList.slice(1),
                node: {
                    type: "primitive",
                    content: value
                }
            };
        }
    }

    function _unescapeString(value) {
        value = value.replace(/\\/g, "");
        return value;
    }

    function _getReference(tokenList) {
        return {
            next: tokenList.slice(1),
            node: {
                type: "ref",
                content: tokenList[0]
            }
        };
    }

    return {
        parseExpressionSource: parseExpressionSource
    };
});
