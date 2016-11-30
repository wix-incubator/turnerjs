define(
    [
        'testUtils',
        'mediaContainer/utils/cssItem/cssToken',
        'mediaContainer/utils/cssItem/stringify'
    ],
    function (testUtils, CSSToken, Stringify) {
        'use strict';

        var Fixture = testUtils.compDesignMixinFixture;

        describe('compDesignMixin Stringify', function () {

            describe('value', function () {
                it('creates a CSS property value stringifier from token map', function () {
                    var stringifier = Stringify.value({
                        top:    CSSToken.BR_WIDTH,
                        right:  CSSToken.BR_WIDTH,
                        bottom: CSSToken.BR_WIDTH,
                        left:   CSSToken.BR_WIDTH
                    });
                    expect(stringifier(Fixture.cssStyle.cssBorder.width))
                        .toEqual('2em 4em 3em 1px');
                });

                it('works with a partially matching schema', function () {
                    var stringifier = Stringify.value({
                        bottom: CSSToken.BR_WIDTH
                    });
                    expect(stringifier(Fixture.cssStyle.cssBorder.width))
                        .toEqual('3em');
                });
            });

            describe('join', function () {
                it('concatenates object\'s properties\' values separating them with spaces', function () {
                    expect(Stringify.join(Fixture.cssStyle.cssBorder.style))
                        .toEqual('dotted dashed hidden none');
                });
            });

            describe('list', function () {
                it('returns a stringifier that applies another stringifier to a list of items and concatenates the result', function () {
                    var stringifier = Stringify.list(function () { return '*'; });
                    expect(stringifier([1, 2, 3]))
                        .toEqual('*, *, *');
                });
            });

            describe('keyword stringifier', function () {
                it('returns property key when value is `true`', function () {
                    var stringifier = Stringify.value({
                        inset: CSSToken.KEYWORD
                    });
                    expect(stringifier({inset: true}))
                        .toEqual('inset');
                });

                it('returns an empty string when value is `false`', function () {
                    var stringifier = Stringify.value({
                        inset: CSSToken.KEYWORD
                    });
                    expect(stringifier({inset: false}))
                        .toEqual('');
                });
            });

            describe('length-or-percentage stringifier', function () {
                it('concatenates unit and value', function () {
                    var stringifier = Stringify.value({
                        blurRadius: CSSToken.LENGTH_OR_PERCENTAGE
                    });
                    expect(stringifier({blurRadius: {unit:'rem', value:37}}))
                        .toEqual('37rem');
                });

                it('concatenates percent sign (%) and value', function () {
                    var stringifier = Stringify.value({
                        width: CSSToken.LENGTH_OR_PERCENTAGE
                    });
                    expect(stringifier({width: {unit:'%', value:37}}))
                        .toEqual('37%');
                });

                it('renders unitless zeroes', function () {
                    var stringifier = Stringify.value({
                        blurRadius: CSSToken.LENGTH_OR_PERCENTAGE
                    });
                    expect(stringifier({blurRadius: {unit:'rem', value:0}}))
                        .toEqual('0');
                });
            });

            describe('RGBA color stringifier', function () {
                it('produces a CSS rgba color value', function () {
                    var stringifier = Stringify.value({
                        color: CSSToken.COLOR_RGBA
                    });
                    expect(stringifier({color: {red:111, green: 0, blue:222, alpha:0.37}}))
                        .toEqual('rgba(111, 0, 222, 0.37)');
                });
            });

            describe('br-width stringifier', function () {
                it('renders length border width', function () {
                    var stringifier = Stringify.value({
                        borderWidth: CSSToken.BR_WIDTH
                    });
                    expect(stringifier({borderWidth:{unit:'em', value:3.7}}))
                        .toEqual('3.7em');
                });
            });

            describe('border-width stringifier', function () {
                it('renders four br-width values', function () {
                    var stringifier = Stringify.value({
                        borderWidth: CSSToken.BORDER_WIDTH
                    });
                    expect(stringifier({
                        borderWidth: {
                            top:    {unit:'em', value:3.7},
                            right:  {unit:'rem', value:0.37},
                            bottom: {unit:'em', value:1.11},
                            left:   {unit:'em', value:2.22}
                        }
                    })).toEqual('3.7em 0.37rem 1.11em 2.22em');
                });
            });

            describe('border-style stringifier', function () {
                it('concatenates four style values', function () {
                    var stringifier = Stringify.value({
                        borderStyle: CSSToken.BORDER_STYLE
                    });
                    expect(stringifier({
                        borderStyle: {
                            top:    'dotted',
                            right:  'dashed',
                            bottom: 'none',
                            left:   'hidden'
                        }
                    })).toEqual('dotted dashed none hidden');
                });
            });

            describe('border-color stringifier', function () {
                it('concatenates four color values', function () {
                    var stringifier = Stringify.value({
                        borderColor: CSSToken.BORDER_COLOR
                    });
                    expect(stringifier({
                        borderColor: {
                            top:    {red: 111, green:0, blue:222, alpha:0.37},
                            right:  {red: 111, green:0, blue:223, alpha:0.37},
                            bottom: {red: 111, green:0, blue:224, alpha:0.37},
                            left:   {red: 111, green:0, blue:225, alpha:0.37}
                        }
                    })).toEqual('rgba(111, 0, 222, 0.37) rgba(111, 0, 223, 0.37) rgba(111, 0, 224, 0.37) rgba(111, 0, 225, 0.37)');
                });
            });
        });
    }
);
