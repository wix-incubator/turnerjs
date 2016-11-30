define(['coreUtils/core/style'], function(styleUtils) {
    'use strict';

    describe('style utils spec', function() {
        describe('prefix', function() {
            it('should return an object with both regular and vendor-prefixed styles', function() {
                var styles = {
                    styleA: 'some value',
                    styleB: 'some value'
                };

                var prefixedStyles = styleUtils.prefix(styles);

                var expectedPrefixedStyles = {
                    styleA: 'some value',
                    WebkitStyleA: 'some value',
                    MozStyleA: 'some value',
                    msStyleA: 'some value',
                    styleB: 'some value',
                    WebkitStyleB: 'some value',
                    MozStyleB: 'some value',
                    msStyleB: 'some value'
                };
                expect(prefixedStyles).toEqual(expectedPrefixedStyles);
            });
        });

        describe('unitize', function() {
            it('should return the value as is if it is a string', function() {
                expect(styleUtils.unitize('someVal')).toEqual('someVal');
            });

            it('should return the value with default px units if it is a number', function() {
                expect(styleUtils.unitize(10)).toEqual('10px');
            });

            it('should return the value with the specified units if the value is a number', function() {
                expect(styleUtils.unitize(10, 'em')).toEqual('10em');
            });
        });
    });
});
