define(
    [
        'testUtils',
        'mediaContainer/utils/cssItem/cssItem'
    ],
    function (testUtils, CSSItem) {
        'use strict';

        var Fixture = testUtils.compDesignMixinFixture;

        describe('compDesignMixin CSSItem', function () {

            /* eslint-disable new-cap */

            describe('cssBoxShadow', function () {
                it('stringifies multiple boxShadow items into a single property', function () {
                    var style = {};
                    CSSItem.cssBoxShadow(style, Fixture.cssStyle.cssBoxShadow);
                    expect(style).toEqual({
                        boxShadow: '2em 2em 4px 1px rgba(127, 64, 83, 0.23), inset 2em 2em 2px 1px rgba(127, 255, 83, 0.37)'
                    });
                });
            });

            describe('cssBorderRadius', function () {
                it('stringifies a borderRadius item into a borderRadius property', function () {
                    var style = {};
                    CSSItem.cssBorderRadius(style, Fixture.cssStyle.cssBorderRadius);
                    expect(style).toEqual({
                        borderRadius: '20px 30px 50px 70px'
                    });
                });
            });

            describe('cssBorder', function () {
                it('stringifies a border item into borderWidth, borderStyle, borderRadius properties', function () {
                    var style = {};
                    style = CSSItem.cssBorder(style, Fixture.cssStyle.cssBorder);
                    expect(style).toEqual({
                        borderWidth: '2em 4em 3em 1px',
                        borderStyle: 'dotted dashed hidden none',
                        borderColor: 'rgba(127, 64, 83, 0.23) rgba(23, 83, 83, 0.37) rgba(83, 37, 83, 0.37) rgba(23, 23, 83, 0.37)'
                    });
                });
            });

            /* eslint-enable new-cap */
        });
    }
);
