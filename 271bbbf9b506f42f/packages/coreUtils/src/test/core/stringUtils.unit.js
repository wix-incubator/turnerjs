define(['coreUtils/core/stringUtils'], function (stringUtils) {
    'use strict';

    describe('stringUtils', function () {

        describe('capitalize', function () {

            it('should return string with first character capitalized and other characters untouched', function () {
                expect(stringUtils.capitalize('hello')).toBe('Hello');
                expect(stringUtils.capitalize('heLLo')).toBe('HeLLo');
                expect(stringUtils.capitalize('+AA')).toBe('+AA');
                expect(stringUtils.capitalize('h/]+-^$A')).toBe('H/]+-^$A');
            });

            it('should return string with first character capitalized and other characters lower cased', function () {
                expect(stringUtils.capitalize('hello', true)).toBe('Hello');
                expect(stringUtils.capitalize('heLLo', true)).toBe('Hello');
                expect(stringUtils.capitalize('+AA', true)).toBe('+aa');
                expect(stringUtils.capitalize('h/]+-^$A', true)).toBe('H/]+-^$a');
            });

        });

        describe('startsWith', function () {

            it('should return true if string starts with param', function () {
                expect(stringUtils.startsWith('hello', 'he')).toBeTruthy();
                expect(stringUtils.startsWith('h/]+-^$Aaaa', 'h/]+-^$A')).toBeTruthy();
                expect(stringUtils.startsWith('hello', 'He', true)).toBeTruthy();
                expect(stringUtils.startsWith('Hello', 'he', true)).toBeTruthy();
                expect(stringUtils.startsWith('h/]+-^$Aaaa', 'H/]+-^$a', true)).toBeTruthy();
            });

            it('should return false if string does not start with param', function () {
                expect(stringUtils.startsWith('hello', 'el')).toBeFalsy();
                expect(stringUtils.startsWith('hello', 'El', true)).toBeFalsy();
                expect(stringUtils.startsWith('hello', 'el', true)).toBeFalsy();
            });

        });

        describe('endsWith', function () {

            it('should return true if string ends with param', function () {
                expect(stringUtils.endsWith('hello', 'lo')).toBeTruthy();
                expect(stringUtils.endsWith('hello', 'lo', true)).toBeTruthy();
                expect(stringUtils.endsWith('helLO', 'lO', true)).toBeTruthy();
            });

            it('should return false if string does not end with param', function () {
                expect(stringUtils.endsWith('hello', 'll')).toBeFalsy();
                expect(stringUtils.endsWith('hello', 'll', true)).toBeFalsy();
                expect(stringUtils.endsWith('hello', 'll', true)).toBeFalsy();
            });

        });

    });
});
