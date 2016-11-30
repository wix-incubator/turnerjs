define([
    'lodash',
    'testUtils',
    'core/components/designDataChangeHandlers/designDataChangeBgBehaviorsHandler'
], function (_, testUtils, designDataChangeBgBehaviorsHandler) {
    'use strict';

    describe('designDataChangeBgBehaviorsHandler', function(){
        beforeEach(function(){
            this.mockSiteData = testUtils.mockFactory.mockSiteData();
            this.mockSiteAPI = testUtils.mockFactory.mockSiteAPI(this.mockSiteData);

            this.prevData = {};
            this.nextData = {};
            this.mockInBehavior = {
                name: 'inBehavior',
                type: 'someType',
                part: 'somePart',
                trigger: 'in'

            };
            this.mockOutBehavior = {
                name: 'outBehavior',
                type: 'someType',
                part: 'somePart',
                trigger: 'out'

            };
            this.compId = 'compId';
            this.pageId = 'pageId';

            this.spiedHandleBehavior = jasmine.createSpy('handleBehavior');
            this.spiedStopAndClearAnimations = jasmine.createSpy('stopAndClearAnimations');
            this.spiedSetState = jasmine.createSpy('setState');
            this.mockBehaviorHandlers = {
                handleBehavior: this.spiedHandleBehavior,
                stopAndClearAnimations: this.spiedStopAndClearAnimations
            };
            this.mockBalata = {
                setState: this.spiedSetState
            };
            spyOn(this.mockSiteData, 'getFocusedRootId').and.returnValue(this.pageId);
            spyOn(this.mockSiteAPI, 'getComponentsByPageId').and.callFake(function(){
                var ret = {};
                ret[this.compId] = {refs: {balata: this.mockBalata}};
                return ret;
            }.bind(this));
            spyOn(this.mockSiteAPI, 'getSiteAspect').and.returnValue(this.mockBehaviorHandlers);
        });
        describe('handle function', function(){
            it('should do nothing if both prev and next data has no behaviors object', function(){
                designDataChangeBgBehaviorsHandler.handle(this.mockSiteAPI, this.compId, this.prevData, this.nextData);
                expect(this.spiedHandleBehavior).not.toHaveBeenCalled();
                expect(this.spiedStopAndClearAnimations).not.toHaveBeenCalled();
                expect(this.spiedSetState).not.toHaveBeenCalled();
            });

            it('should run all three external functions if prev data has an "out" behavior', function(){
                this.prevData.dataChangeBehaviors = [this.mockOutBehavior];
                designDataChangeBgBehaviorsHandler.handle(this.mockSiteAPI, this.compId, this.prevData, this.nextData);
                expect(this.spiedHandleBehavior).toHaveBeenCalled();
                expect(this.spiedStopAndClearAnimations).toHaveBeenCalled();
                expect(this.spiedSetState).toHaveBeenCalled();
            });

            it('should run all three external functions if next data has an "in" behavior', function(){
                this.nextData.dataChangeBehaviors = [this.mockInBehavior];
                designDataChangeBgBehaviorsHandler.handle(this.mockSiteAPI, this.compId, this.prevData, this.nextData);
                expect(this.spiedHandleBehavior).toHaveBeenCalled();
                expect(this.spiedStopAndClearAnimations).toHaveBeenCalled();
                expect(this.spiedSetState).toHaveBeenCalled();
            });
        });

        describe('handleBehaviors', function(){
            it('should call the handler only with out behavior if prev and next has the same behavior', function(){
                this.prevData.dataChangeBehaviors = [_.assign(this.mockOutBehavior, {name: 'sameBehavior'})];
                this.nextData.dataChangeBehaviors = [_.assign(this.mockInBehavior, {name: 'sameBehavior'})];
                designDataChangeBgBehaviorsHandler.handle(this.mockSiteAPI, this.compId, this.prevData, this.nextData);

                var handlerArgs = this.spiedHandleBehavior.calls.argsFor(0);
                expect(this.spiedHandleBehavior.calls.count()).toEqual(1);
                expect(handlerArgs[0].name).toEqual(this.mockOutBehavior.name);
            });

            it('should call the handler for both if prev and next are not equal', function(){
                this.prevData.dataChangeBehaviors = [this.mockOutBehavior];
                this.nextData.dataChangeBehaviors = [this.mockInBehavior];
                designDataChangeBgBehaviorsHandler.handle(this.mockSiteAPI, this.compId, this.prevData, this.nextData);

                expect(this.spiedHandleBehavior.calls.count()).toEqual(2);
            });

            it('should not call handler if no "in" in next and no "out" in prev', function(){
                this.prevData.dataChangeBehaviors = [this.mockInBehavior];
                this.nextData.dataChangeBehaviors = [this.mockOutBehavior];
                designDataChangeBgBehaviorsHandler.handle(this.mockSiteAPI, this.compId, this.prevData, this.nextData);

                expect(this.spiedHandleBehavior).not.toHaveBeenCalled();
            });


        });

        describe('clearAnimations', function(){
            it('should clear animations and not seek if a behavior exists', function(){
                this.prevData.dataChangeBehaviors = [this.mockOutBehavior];
                designDataChangeBgBehaviorsHandler.handle(this.mockSiteAPI, this.compId, this.prevData, this.nextData);
                expect(this.spiedStopAndClearAnimations).toHaveBeenCalledWith(this.compId);
            });
        });

        describe('balata.setState', function(){
            it('should set an empty object for each behavior part if no params to pass', function(){
                this.nextData.dataChangeBehaviors = [this.mockInBehavior];
                designDataChangeBgBehaviorsHandler.handle(this.mockSiteAPI, this.compId, this.prevData, this.nextData);
                var expectedState = {transforms:{}};
                expectedState.transforms[this.mockInBehavior.part] = {};
                expect(this.spiedSetState).toHaveBeenCalledWith(expectedState);
            });
        });

    });

});
