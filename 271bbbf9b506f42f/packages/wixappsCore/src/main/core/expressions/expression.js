define(["wixappsCore/core/expressions/expressionParser", "lodash"], function (parser, _) {
    "use strict";

    function isExpression (obj) {
        return typeof obj === 'object' && _.has(obj, "$expr");
    }

    function evaluate(refResolver, source, funcLib) {
        var expr = parser.parseExpressionSource(source)[0];
        return evalInternal(refResolver, expr, source, funcLib);
    }

    function evaluateFunction(refResolver, exprDesc, source, funcLib) {
        var params = _.map(exprDesc.params, function (item) {
            return evalInternal(refResolver, item, source, funcLib);
        });

        var func = funcLib[exprDesc.content];
        if (!func) {
            throw new Error("Expression: " + source + " | Cannot resolve function " + exprDesc.content + "()");
        }

        return func.apply(funcLib, params);
    }

    function evaluateRef(refResolver, exprDesc, source) {
        var value = refResolver(exprDesc.content);
        if (value === undefined) {
            throw new Error("Expression: " + source + " | Cannot resolve symbol " + exprDesc.content);
        }
        return value;
    }

    function evalInternal(refResolver, exprDesc, source, funcLib) {
        switch (exprDesc.type) {
            case "primitive":
                return convertStringToPrimitive(exprDesc.content);
            case "ref":
                return evaluateRef(refResolver, exprDesc, source, funcLib);
            case "function":
                return evaluateFunction(refResolver, exprDesc, source, funcLib);
        }
    }

    function convertStringToPrimitive(value) {
        if (!_.isString(value)) {
            return value;
        } else if (/^\s*(\+|-)?\d+\s*$/.test(value)) {
            return parseInt(value, 10);
        } else if (value === "true") {
            return true;
        } else if (value === "false") {
            return false;
        } else if (value === "null") {
            return null;
        }
        return value;
    }


    return {
        isExpression: isExpression,

        evaluate: evaluate,

        convertStringToPrimitive: convertStringToPrimitive
    };
});
