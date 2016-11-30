define(['lodash', 'testUtils', 'react', 'core/components/animationsMixin', 'core/components/util/animationsQueueHandler'],
    function (_, /** testUtils */ testUtils, React, animationsMixin, animationsQueueHandler) {
        'use strict';
        describe('animationsMixin', function () {

            var simpleCompDefinition, props;

            beforeEach(function () {

                simpleCompDefinition = simpleCompDefinition || {
                  mixins: [animationsMixin],
                  render: function () {
                    return React.DOM.div(this.props);
                  }
                };

                props = props || testUtils.mockFactory.mockProps();

                this.simpleComp = testUtils.getComponentFromDefinition(simpleCompDefinition, props);
            });

            describe('check animation execution', function () {
                it('should execute the animation immediately', function () {
                    var flush = spyOn(animationsQueueHandler, 'flushQueue');
                    spyOn(this.simpleComp, 'isBusy').and.returnValue(false);

                    this.simpleComp.sequence().execute();

                    expect(flush).toHaveBeenCalled();
                });

                it('should not execute the animation immediately if component is busy', function () {
                    var flush = spyOn(animationsQueueHandler, 'flushQueue');
                    spyOn(this.simpleComp, 'isBusy').and.returnValue(true);

                    this.simpleComp.sequence().execute();

                    expect(flush).not.toHaveBeenCalled();
                });

                it('should execute the animation on componentDidUpdate if component is not busy', function () {
                    var flush = spyOn(animationsQueueHandler, 'flushQueue');
                    var fakeBusy = true;
                    spyOn(this.simpleComp, 'isBusy').and.callFake(function() { return fakeBusy; });

                    this.simpleComp.sequence().execute(); // Not flushed
                    fakeBusy = false;
                    this.simpleComp.componentDidUpdate();

                    expect(flush).toHaveBeenCalled();
                });

                it('should not execute the animation on componentDidUpdate if component is busy', function () {
                    var flush = spyOn(animationsQueueHandler, 'flushQueue');
                    spyOn(this.simpleComp, 'isBusy').and.returnValue(true);

                    this.simpleComp.sequence().execute();
                    this.simpleComp.componentDidUpdate();

                    expect(flush).not.toHaveBeenCalled();
                });

                it('should execute the animation on componentDidLayout', function () {
                    var flush = spyOn(animationsQueueHandler, 'flushQueue');
                    this.simpleComp.componentDidLayoutAnimations();
                    expect(flush).toHaveBeenCalled();
                });
            });
        });
    });
