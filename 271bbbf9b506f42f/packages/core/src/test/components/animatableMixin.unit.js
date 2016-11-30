define(['lodash', 'testUtils', 'react', 'core/components/animatableMixin'], function
    (_, /** testUtils */ testUtils, React, animatableMixin){
    'use strict';

    describe('animatableMixin', function () {
        function getCompWithMixin(props) {
            var simpleCompDefinition = {
                mixins: [animatableMixin],
                render: function () {
                    return React.DOM.div(this.props);
                }
            };

            props = _.defaults({}, props, testUtils.mockFactory.mockProps());

            return testUtils.getComponentFromDefinition(simpleCompDefinition, props);
        }

        describe('isAnimating', function () {
            it('should be false by default', function () {
                var comp = getCompWithMixin();

                expect(comp.isAnimating).toBeFalsy();
            });

            it('should assign to true when starting animation', function () {
                var comp = getCompWithMixin();

                comp.animationStarted();

                expect(comp.isAnimating).toBeTruthy();
            });

            it('should assign to false when ending all animations', function () {
                var comp = getCompWithMixin();

                comp.animationStarted();
                comp.animationStarted();
                comp.animationEnded();
                expect(comp.isAnimating).toBeTruthy();

                comp.animationEnded();
                expect(comp.isAnimating).toBeFalsy();
            });
        });

    });
});
