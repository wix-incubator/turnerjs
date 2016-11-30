define(['testUtils', 'mediaContainer/utils/compDesignUtils'],

    function (testUtils, compDesignUtils) {
        'use strict';

        var Fixture = testUtils.compDesignMixinFixture;

        describe('compDesignUtils', function () {

            describe('renderDesign', function () {
                it('reduces css items from compDesign into a style object', function () {
                    var style = compDesignUtils.renderDesign(Fixture.cssStyle);

                    expect(style).toEqual({
                        borderWidth: '2em 4em 3em 1px',
                        borderStyle: 'dotted dashed hidden none',
                        borderColor: 'rgba(127, 64, 83, 0.23) rgba(23, 83, 83, 0.37) rgba(83, 37, 83, 0.37) rgba(23, 23, 83, 0.37)',
                        boxShadow: '2em 2em 4px 1px rgba(127, 64, 83, 0.23), inset 2em 2em 2px 1px rgba(127, 255, 83, 0.37)',
                        borderRadius: '20px 30px 50px 70px'
                    });
                });
            });
        });
    }
);
