define(['core', 'widgets/behaviors/widgetBehaviorHandler', 'widgets/behaviors/widgetBehaviorPreprocessor', 'widgets'], function(core, widgetBehaviorHandler, widgetBehaviorPreprocessor){
    'use strict';

    describe('widgets', function(){
        it('should register widgetBehaviorHandler to behaviorHandlersFactory', function(){
            var registeredHandler = core.behaviorHandlersFactory.getHandler('widget');

            expect(registeredHandler).toBe(widgetBehaviorHandler);
        });

        it('should register widgetBehaviorPreprocessor to behaviorHandlersFactory', function(){
            var registeredPreprocessor = core.behaviorHandlersFactory.getBehaviorPreprocessor('widget');

            expect(registeredPreprocessor).toBe(widgetBehaviorPreprocessor);
        });
    });
});
