/**
 * Created by Dan_Shappir on 5/5/15.
 */
define(['lodash', 'coreUtils/core/classNames'], function (_, classNames) {
    'use strict';
    describe('testing classNames lodash shim', function () {
        it('should create empty classNames', function () {
            expect(classNames()).toBe('');
            expect(classNames({})).toBe('');
            expect(classNames({a: false})).toBe('');
            expect(classNames({a: false, b: 0})).toBe('');
        });

        it('should create non-empty classNames', function () {
            expect(classNames({a: true})).toBe('a');
            expect(classNames({'hello-world': true})).toBe('hello-world');
            expect(classNames({a: true, b: 1})).toBe('a b');
        });

        it('should handle complex classNames', function () {
            expect(classNames({a: true, b:false, c:1})).toBe('a c');
            expect(classNames({'hello there': true, world:1})).toBe('hello there world');
            expect(classNames({hello:0, there:1, world:false})).toBe('there');
        });
    });
});
