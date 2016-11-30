define(["wixappsCore/core/expressions/expressionParser"], function (parser) {
    'use strict';
    describe("parseExpressionSource", function () {
        var expected = [
            {
                type: "function",
                content: "mod",
                params: [
                    {
                        type: "function",
                        content: "mult",
                        params: [
                            {
                                type: "function",
                                content: "add",
                                params: [
                                    {
                                        type: "ref",
                                        content: "myVar"
                                    },
                                    {
                                        type: "primitive",
                                        content: 5
                                    }
                                ]
                            },
                            {
                                type: "primitive",
                                content: 2
                            }
                        ]
                    },
                    {
                        type: "primitive",
                        content: 5
                    }
                ]
            }
        ];

        it("parseExpressionSource - curried functions", function () {
            var result = parser.parseExpressionSource("add(myVar, 5).mult(2).mod(5)");
            expect(result).toEqual(expected);
        });

        it("parseExpressionSource - nested functions", function () {
            var result = parser.parseExpressionSource("mod(mult(add(myVar, 5), 2), 5)");
            expect(result).toEqual(expected);
        });

        it("parseExpressionSource - lisp-syntax, curried functions", function () {
            var result = parser.parseExpressionSource("(add myVar 5)(mult 2)(mod 5)");
            expect(result).toEqual(expected);
        });

        it("parseExpressionSource - lisp-syntax, nested functions", function () {
            var result = parser.parseExpressionSource("(mod (mult (add myVar 5) 2) 5)");
            expect(result).toEqual(expected);
        });
    });

    describe("Tests string parsing", function () {

        it("Tests string parsing (func with no params)", function () {
            var result = parser.parseExpressionSource("foo()");
            expect(result).toEqual([
                {
                    type: "function",
                    content: "foo",
                    params: []
                }
            ]);
        });

        it("Tests string parsing (two chain func with no params)", function () {
            var result = parser.parseExpressionSource("foo().bar()");
            expect(result).toEqual([
                {
                    type: "function",
                    content: "bar",
                    params: [
                        {
                            type: "function",
                            content: "foo",
                            params: []
                        }
                    ]
                }
            ]);
        });

        it("Tests string parsing", function () {
            var result = parser.parseExpressionSource("if(true, 'yo', 'no')");
            expect(result).toEqual([
                {type: 'function', content: 'if', params: [
                    {type: 'primitive', content: true},
                    {type: 'primitive', content: 'yo'},
                    {type: 'primitive', content: 'no'}
                ]}
            ]);
        });

        it("Tests string parsing", function () {
            var result = parser.parseExpressionSource("String.contains('BooYaa!', 'Yaa')");
            expect(result).toEqual([
                {type: 'function', content: 'String.contains', params: [
                    {type: 'primitive', content: 'BooYaa!'},
                    {type: 'primitive', content: 'Yaa'}
                ]}
            ]);
        });

        it("Tests parsing (1)", function () {
            var result = parser.parseExpressionSource("String.concat('Previous field in capitals: ', String.toUpperCase(parent.title) )");
            expect(result).toEqual([
                {type: 'function', content: 'String.concat', params: [
                    {type: 'primitive', content: 'Previous field in capitals: '},
                    {type: 'function', content: 'String.toUpperCase', params: [
                        {type: 'ref', content: 'parent.title'}
                    ]}
                ]}
            ]);
        });

        it("Tests parsing (2)", function () {
            var result = parser.parseExpressionSource("add($indexInParent, 1, 5).toString()");
            expect(result).toEqual([
                    {
                        type: 'function',
                        content: 'toString',
                        params: [
                            {
                                type: 'function',
                                content: 'add',
                                params: [
                                    {
                                        type: 'ref',
                                        content: '$indexInParent'
                                    },
                                    {
                                        type: 'primitive',
                                        content: 1
                                    },
                                    {
                                        type: 'primitive',
                                        content: 5
                                    }
                                ]
                            }
                        ]
                    }
                ]
            );
        });

        it("Tests parsing (3)", function () {
            var result = parser.parseExpressionSource("mod($index 2).eq(0).true?('#ff0000').else('#00ff00')");
            expect(result).toEqual([
                    {
                        type: 'function',
                        content: 'else',
                        params: [
                            {
                                type: 'function',
                                content: 'true?',
                                params: [
                                    {
                                        type: 'function',
                                        content: 'eq',
                                        params: [
                                            {
                                                type: 'function',
                                                content: 'mod',
                                                params: [
                                                    {
                                                        type: 'ref',
                                                        content: '$index'
                                                    },
                                                    {
                                                        type: 'primitive',
                                                        content: 2
                                                    }
                                                ]
                                            },
                                            {
                                                type: "primitive",
                                                content: 0
                                            }
                                        ]
                                    },
                                    {
                                        type: "primitive",
                                        content: "#ff0000"
                                    }
                                ]
                            },
                            {
                                type: "primitive",
                                content: "#00ff00"
                            }
                        ]
                    }
                ]
            );
        });
    });

    describe("Function-less expressions", function () {
        it("Primitive values (boolean)", function () {
            var result = parser.parseExpressionSource("true");
            expect(result).toEqual([
                {type: "primitive", content: true}
            ]);
            result = parser.parseExpressionSource("false");
            expect(result).toEqual([
                {type: "primitive", content: false}
            ]);
        });

        it("Primitive values (number)", function () {
            var result = parser.parseExpressionSource("12");
            expect(result).toEqual([
                {type: "primitive", content: 12}
            ]);
            result = parser.parseExpressionSource("45.0");
            expect(result).toEqual([
                {type: "primitive", content: 45.0}
            ]);
        });

        it("Primitive values (string)", function () {
            var result = parser.parseExpressionSource('"Franta"');
            expect(result).toEqual([
                {type: "primitive", content: "Franta"}
            ]);
        });

        it("Primitive values (escaped string)", function () {
            //expect(parser._unescapeString('Da\\\"sh\\\"')).toBe("Da\"sh\"");
            var result = parser.parseExpressionSource('"Da\\\"sh"');
            expect(result).toEqual([
                {type: "primitive", content: "Da\"sh"}
            ]);
        });

        it("Symbol", function () {
            var result = parser.parseExpressionSource("title");
            expect(result).toEqual([
                {type: "ref", content: "title"}
            ]);
            result = parser.parseExpressionSource("$indexInParent");
            expect(result).toEqual([
                {type: "ref", content: "$indexInParent"}
            ]);
        });
    });

});