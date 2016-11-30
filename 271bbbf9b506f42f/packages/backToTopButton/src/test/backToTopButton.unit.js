define(['testUtils', 'lodash', 'backToTopButton'], function
    (/** testUtils */ testUtils, _, backToTopButton) {
    'use strict';

    describe('backToTopButton component', function () {

        function createBackToTopButtonProps(partialProps) {
            return testUtils.santaTypesBuilder.getComponentProps(backToTopButton, _.merge({
                structure: {componentType: 'wysiwyg.common.components.backtotopbutton.viewer.BackToTopButton'}
            }, partialProps));
        }

        function createBackToTopButtonComp(partialProps) {
            partialProps = partialProps || {};
            var props = createBackToTopButtonProps(partialProps);
            return testUtils.getComponentFromDefinition(backToTopButton, props);
        }

        describe('backToTopButton initial State', function () {
            it('check that on initial state the state is not visible', function () {
                this.backToTopButton = createBackToTopButtonComp();
                expect(this.backToTopButton.state.visible).toEqual(false);
            });
        });

        describe('backToTopButton scroll', function () {
            it('on scroll up without zoom the button becomes visible', function () {
                var partialProps = {
                    isZoomed: false
                };

                this.backToTopButton = createBackToTopButtonComp(partialProps);
                var position = {x: 0, y: 2000};
                var direction = "UP";
                spyOn(this.backToTopButton, 'setState');

                this.backToTopButton.onScroll(position, direction);

                expect(this.backToTopButton.setState).toHaveBeenCalledWith(jasmine.objectContaining({visible: true}));
            });

            it('on scroll up, not on device the button becomes visible', function () {
                var partialProps = {
                    isMobileDevice: false
                };

                this.backToTopButton = createBackToTopButtonComp(partialProps);
                var position = {x: 0, y: 2000};
                var direction = "UP";
                spyOn(this.backToTopButton, 'setState');

                this.backToTopButton.onScroll(position, direction);

                expect(this.backToTopButton.setState).toHaveBeenCalledWith(jasmine.objectContaining({visible: true}));
            });

            it('on scroll up the button doesn`t become visible if the site is zoomed and on mobile device', function () {
                var partialProps = {
                    isZoomed: true,
                    isMobileDevice: true
                };
                this.backToTopButton = createBackToTopButtonComp(partialProps);
                spyOn(this.backToTopButton, 'setState');
                var position = {x: 0, y: 2000};
                var direction = "UP";

                this.backToTopButton.onScroll(position, direction);

                expect(this.backToTopButton.setState).not.toHaveBeenCalled();
            });

            it("on scroll down the button remain hidden", function () {
                this.backToTopButton = createBackToTopButtonComp();
                spyOn(this.backToTopButton, 'setState');
                var position = {x: 0, y: 2000};
                var direction = "DOWN";

                this.backToTopButton.onScroll(position, direction);

                expect(this.backToTopButton.setState).not.toHaveBeenCalled();
            });
        });

    });
});
