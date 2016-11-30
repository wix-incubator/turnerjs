define([
    'lodash',
    'react',
    'testUtils',
    'components/components/boxSlideShow/common/slideNavigationMixin'
], function (_, React, testUtils, slideNavigationMixin) {
    'use strict';

    describe('slideNavigationMixin', function () {
        var slideNavigationMixinClass = React.createClass({
            displayName: 'slideNavigationMixin',
            mixins: [slideNavigationMixin],
            getSkinProperties: function () {
                return {};
            }
        });

        it('should create default public state', function () {
            var propsInfo = {
                props: testUtils.mockFactory.dataMocks.boxSlideShowProperties()
            };

            expect(slideNavigationMixinClass.publicState(null, propsInfo)).toEqual({
                currentIndex: 0,
                autoPlay: false
            });
        });

        it('should create default public state with autoPlay set to true', function () {
            var propsInfo = {
                props: testUtils.mockFactory.dataMocks.boxSlideShowProperties({autoPlay: true})
            };

            expect(slideNavigationMixinClass.publicState(null, propsInfo)).toEqual({
                currentIndex: 0,
                autoPlay: true
            });
        });

        it('should update public state according to the state of the component', function () {
	        var newState = {
                currentIndex: 5,
                autoPlay: true
            };

            var propsInfo = {
                props: testUtils.mockFactory.dataMocks.boxSlideShowProperties({autoPlay: !newState.autoPlay})
            };

            expect(slideNavigationMixinClass.publicState(newState, propsInfo)).toEqual(newState);
        });
    });
});
