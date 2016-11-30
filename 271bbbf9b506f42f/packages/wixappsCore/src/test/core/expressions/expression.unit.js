define(["wixappsCore/core/expressions/expression", "wixappsCore/core/expressions/functionLibrary"], function (expression, FunctionLibrary) {
    'use strict';
    describe('Expression', function () {
        var funcLib = new FunctionLibrary(null);

        describe("expression tests", function () {
            var exprSource = "mod(mult(add(myVar, 5), 2), 5)";

            var data = {
                myVar: 1
            };
            var refResolver = function (ref) {
                return data[ref];
            };

            it("tests evaluation itself", function () {
                expect(expression.evaluate(refResolver, exprSource, funcLib)).toEqual(2);
            });

            it("tests variable changes", function () {
                expect(expression.evaluate(refResolver, exprSource, funcLib)).toEqual(2);
                data.myVar = 2;
                expect(expression.evaluate(refResolver, exprSource, funcLib)).toEqual(4);
            });
        });

        describe("expression errors", function () {
            var data = {
                apples: 1
            };

            var refResolver = function (ref) {
                return data[ref];
            };

            it("throws error with unknown symbol", function () {
                expect(function () {
                    expression.evaluate(refResolver, "add(apples, pears)", funcLib);
                }).toThrowError("Expression: add(apples, pears) | Cannot resolve symbol pears");
            });

            it("throws error with unknown function", function () {
                expect(function () {
                    expression.evaluate(refResolver, "steal(apples)", funcLib);
                }).toThrowError("Expression: steal(apples) | Cannot resolve function steal()");
            });
        });

        describe("function-less expressions", function () {

            it("primitive values", function () {
                expect(expression.evaluate({}, "true")).toEqual(true);
                expect(expression.evaluate({}, "1.25")).toEqual(1.25);
                expect(expression.evaluate({}, '"Franta"')).toEqual("Franta");
                expect(expression.evaluate({}, '"Da\\\"sh"')).toEqual("Da\"sh");
            });

            it("symbols", function () {
                var data = {
                    "aField": "Franta",
                    "$anotherVar": "Pepa"
                };
                var refResolver = function (ref) {
                    return data[ref];
                };
                expect(expression.evaluate(refResolver, "aField")).toEqual("Franta");
                expect(expression.evaluate(refResolver, "$anotherVar")).toEqual("Pepa");
            });
        });
    });

});