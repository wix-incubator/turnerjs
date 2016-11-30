define(["wixappsCore/core/expressions/expressionLexer"], function (lexer) {
    'use strict';
    describe("Simple expressions", function () {

        it('parseExpression (1)', function () {
            expect(lexer.parseExpression("String.concat('Previous field in capitals: ', String.toUpperCase(parent.title), 'Example()')"))
                .toEqual(['String.concat', '(', '"Previous field in capitals: "', 'String.toUpperCase', '(', 'parent.title', ')', '"Example()"', ')']);
        });

        it('parseExpression (2)', function () {
            expect(lexer.parseExpression("(String.concat, \"Previous field in 'capitals': \", String.toUpperCase(parent.title), 'Example()')"))
                .toEqual(['(', 'String.concat', '"Previous field in \'capitals\': "', 'String.toUpperCase', '(', 'parent.title', ')', '"Example()"', ')']);
        });

        it('parseExpression (3)', function () {
            expect(lexer.parseExpression("(String.concat, \"Previous field in 'capitals': \", String.toUpperCase($monkey), 'Example()')"))
                .toEqual(['(', 'String.concat', '"Previous field in \'capitals\': "', 'String.toUpperCase', '(', '$monkey', ')', '"Example()"', ')']);
        });

        it('parseExpression (4)', function () {
            expect(lexer.parseExpression("(String.concat, \"Previous field in 'capitals': \", String.toUpperCase(this[0].$monkey), 'Example()')"))
                .toEqual(['(', 'String.concat', '"Previous field in \'capitals\': "', 'String.toUpperCase', '(', 'this[0].$monkey', ')', '"Example()"', ')']);
        });

        it('parseExpression (5)', function () {
            expect(lexer.parseExpression("mod($index 2).eq(0).true?('#ff0000').else('#00ff00')"))
                .toEqual(['mod', '(', '$index', '2', ')', 'eq', '(', '0', ')', "true?", "(", '"#ff0000"', ")", "else", '(', '"#00ff00"', ")"]);
        });

        it('parseExpression (single primitives)', function () {
            expect(lexer.parseExpression('"Single string"'))
                .toEqual(['"Single string"']);
            expect(lexer.parseExpression("'Single string'"))
                .toEqual(['"Single string"']);
            expect(lexer.parseExpression("true"))
                .toEqual(["true"]);
            expect(lexer.parseExpression("   1.23   4"))
                .toEqual(["1.23", "4"]);
        });

        it('parseExpression (escaped parentheses in string)', function () {
            expect(lexer.parseExpression('"Single \\"string"'))
                .toEqual(['"Single \\\"string"']);
            expect(lexer.parseExpression("'Single \\'string'"))
                .toEqual(['"Single \\\'string"']);
            expect(lexer.parseExpression('"Single string\\""'))
                .toEqual(['"Single string\\\""']);
        });
    });


});