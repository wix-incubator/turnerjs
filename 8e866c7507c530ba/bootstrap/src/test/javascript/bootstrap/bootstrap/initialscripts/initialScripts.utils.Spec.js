describe('utils', function() {
    'use strict';

    var utils = window.WT.utils;
    describe('getArgumentNames and getArgumentsObject', function() {
        /* jshint ignore:start */
        var anonymousFunc = function(foo,bar, z, /* comment before */ commentBefore, commentAfter /* comment after */,
                                     commaBeforeNewline
            , commaAfterNewline
            , hasALineComment // line comment
            ) {
            return utils.getArgumentsObject(anonymousFunc, arguments);
        };

        function namedFunc(foo,bar, z, /* comment before */ commentBefore, commentAfter /* comment after */,
                           commaBeforeNewline
            , commaAfterNewline
            , hasALineComment // line comment
            ) {
            return utils.getArgumentsObject(anonymousFunc, arguments);
        }
        /* jshint ignore:end */

        describe('getArgumentNames', function() {
            [/* jshint ignore:start */anonymousFunc, namedFunc/* jshint ignore:end */].forEach(function(func) {
                it('should return the argument names array for an anonymous function', function() {
                    var result = utils.getArgumentNames(func);
                    var expectedResult = ['foo', 'bar', 'z', 'commentBefore', 'commentAfter', 'commaBeforeNewline', 'commaAfterNewline', 'hasALineComment'];
                    expect(JSON.stringify(result, null, 4)).toBe(JSON.stringify(expectedResult, null, 4));
                });

                it('should return an empty array for a function with no arguments', function() {
                    expect(utils.getArgumentNames(function(){})).toBeEquivalentTo([]);
                });
            });
        });

        describe('getArgumentsObject', function() {
            it('should return the arguments object', function() {
                var result = namedFunc('a', 'bb', 'ccc', 'dddd', 'eeeee', 'ffffff', 'ggggggg', 'hhhhhhhh');

                var expectedResult = {
                    foo: 'a',
                    bar: 'bb',
                    z: 'ccc',
                    commentBefore: 'dddd',
                    commentAfter: 'eeeee',
                    commaBeforeNewline: 'ffffff',
                    commaAfterNewline: 'ggggggg',
                    hasALineComment: 'hhhhhhhh'
                };

                expect(JSON.stringify(result, null, 4)).toBe(JSON.stringify(expectedResult, null, 4));
            });
        });

        describe('render template', function() {
            it('should return the rendered string', function() {
                /* jshint ignore:start */
                var model = {FOOD: 'pretzels', feeling_name: 'thirsty'};
                expect(utils.renderTemplate('${nonexistent}these ${FOOD} are making me ${feeling_name}', model))
                    .toBe('these pretzels are making me thirsty');
                /* jshint ignore:end */
            });
        });
    });
});
