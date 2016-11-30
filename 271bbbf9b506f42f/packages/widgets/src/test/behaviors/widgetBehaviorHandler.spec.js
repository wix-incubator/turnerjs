define(['testUtils', 'widgets/behaviors/widgetBehaviorHandler'], function (testUtils, widgetBehaviorHandler) {
    'use strict';


    describe('widgetBehaviorHandler', function () {

        describe('handle', function () {

            beforeEach(function () {
                this.mockSiteAPI = testUtils.mockFactory.mockSiteAPI();
                this.widgetAspect = this.mockSiteAPI.getSiteAspect('WidgetAspect');
            });

            it('should call the widget registered handler behavior name method', function () {
                var compId = 'myCompId';
                var rootId = this.mockSiteAPI.getSiteData().getCurrentUrlPageId();
                var handler = this.widgetAspect.getWidgetHandler();
                spyOn(handler, 'handleEvent').and.callThrough();
                var event = {type: 'click', target: compId};
                var behavior = testUtils.mockFactory.behaviorMocks.widget.runCode('myCompNickName', 'onClick', rootId);

                widgetBehaviorHandler.handle([behavior], this.mockSiteAPI, event);

                expect(handler.handleEvent).toHaveBeenCalledWith(rootId, behavior.name, behavior.params, event);
            });

            it('should call the widget registered handler multiple times', function(){
                var compId = 'myCompId';
                var rootId = this.mockSiteAPI.getSiteData().getCurrentUrlPageId();
                var handler = this.widgetAspect.getWidgetHandler();
                spyOn(handler, 'handleEvent').and.callThrough();
                var event = {type: 'click', target: compId};
                var behaviorA = testUtils.mockFactory.behaviorMocks.widget.runCode('myCompNickName', 'onClick', rootId);
                var behaviorB = testUtils.mockFactory.behaviorMocks.widget.runCode('myCompNickName', 'onHover', rootId);
                var behaviors = [behaviorA, behaviorB];

                widgetBehaviorHandler.handle(behaviors, this.mockSiteAPI, event);

                expect(handler.handleEvent.calls.count()).toBe(2);
                expect(handler.handleEvent.calls.argsFor(0)[0]).toEqual(rootId, behaviorA.name, behaviorA.params, event);
                expect(handler.handleEvent.calls.argsFor(1)[0]).toEqual(rootId, behaviorB.name, behaviorB.params, event);
            });
        });

        it('getUniqueIdentifier should return type,name,targetId,callbackId', function() {
            var behavior = testUtils.mockFactory.behaviorMocks.widget.runCode('compName', 'callbackId', 'wixCodeInstanceId');
            expect(widgetBehaviorHandler.getUniqueIdentifier(behavior)).toEqual('widget,runCode,wixCodeInstanceId,callbackId');
        });
    });
});
