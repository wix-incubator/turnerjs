define(['documentServices/wixapps/utils/classicsPathUtils'], function (classicsPathUtils) {
    'use strict';

    describe('classicsPathUtils', function () {

        it('should be an object', function () {
            expect(classicsPathUtils).toEqual(jasmine.any(Object));
        });


        describe('getPackagePath', function () {

            it('should be a function', function () {
                expect(classicsPathUtils.getPackagePath).toEqual(jasmine.any(Function));
            });


            describe('return value', function () {

                it('should be ["wixapps", "a"] if called with "a"', function () {
                    var packagePath = classicsPathUtils.getPackagePath('a');
                    expect(packagePath).toEqual(['wixapps', 'a']);
                });


                it('should be ["wixapps", "b"] if called with "b"', function () {
                    var packagePath = classicsPathUtils.getPackagePath('b');
                    expect(packagePath).toEqual(['wixapps', 'b']);
                });

            });

        });

    });
});