define([
    'core',
    'components/behaviors/compBehaviorHandler'
], function (core, compBehaviorHandler) {
    'use strict';

    describe('compBehaviorsRegistrar', function () {
        it('should register compBehaviorHandler in behaviorHandlersFactory for type comp', function () {
            var handler = core.behaviorHandlersFactory.getHandler('comp');

            expect(handler).toBe(compBehaviorHandler);
        });
    });
});
