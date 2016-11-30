/**
 * Created by alexandreroitman on 10/11/2016.
 */
define(['documentServices/component/componentDeprecation'], function (deprecation) {
    'use strict';

    var NOT_DEPRECATED_COMP_TYPE = 'notDeprecatedCompType';
    var DEPRECATED_COMP_TYPE = 'deprecatedCompType';
    var MARKED_FOR_WARNING_COMP_TYPE = 'wysiwyg.viewer.components.StripContainer';

    describe('deprecation', function(){
        describe('isComponentDeprecated', function(){
            it('should return false if component is not marked for deprecation', function() {
                expect(deprecation.isComponentDeprecated(NOT_DEPRECATED_COMP_TYPE)).toBeFalsy();
            });

            it('should return true if component is marked for deprecation with error', function() {
                spyOn(deprecation, 'isComponentDeprecated').and.returnValue(true);

                expect(deprecation.isComponentDeprecated(DEPRECATED_COMP_TYPE)).toBeTruthy();
            });

            it('should return false if component is marked for deprecation with warning', function() {
                expect(deprecation.isComponentDeprecated(MARKED_FOR_WARNING_COMP_TYPE)).toBeFalsy();
            });
        });

        describe('shouldWarnForDeprecation', function(){
            it('should return false if component is not marked for deprecation', function() {
                expect(deprecation.shouldWarnForDeprecation(NOT_DEPRECATED_COMP_TYPE)).toBeFalsy();
            });

            it('should return false if component is marked for deprecation with error', function() {
                expect(deprecation.shouldWarnForDeprecation(DEPRECATED_COMP_TYPE)).toBeFalsy();
            });

            it('should return false if component is marked for deprecation with warning', function() {
                expect(deprecation.shouldWarnForDeprecation(MARKED_FOR_WARNING_COMP_TYPE)).toBeTruthy();
            });
        });

    });
});
