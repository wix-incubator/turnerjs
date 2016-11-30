define([
    'lodash',
    'core/components/siteAspects/DesignDataChangeAspect'
], function (_, DesignDataChangeAspect) {
    'use strict';

    describe('this.designDataChangeAspect', function(){
        beforeEach(function() {
            // I know i should use testUtils.mockFactory but it is an overkill
            // for the purposes of this test
            var mockAspectSiteAPI = {
                getSiteAPI: _.noop
            };
            this.designDataChangeAspect = new DesignDataChangeAspect(mockAspectSiteAPI);
        });

        it('should register a new handler', function(){
            var mockFunction = _.noop;
            this.designDataChangeAspect.registerHandler('mockHandler', mockFunction);
            expect(this.designDataChangeAspect._registeredHandlers.mockHandler).toBe(mockFunction);
        });

        it('should unregistered a handler', function(){
            var mockFunction = _.noop;
            this.designDataChangeAspect.registerHandler('mockHandler', mockFunction);
            this.designDataChangeAspect.unregisterHandler('mockHandler');
            expect(this.designDataChangeAspect._registeredHandlers.mockHandler).toBeUndefined();
        });

        it('should notify handler on data change through the propagate function', function(){
            var spiedHandler = jasmine.createSpy('handler');
            var spiedPropagate = spyOn(this.designDataChangeAspect, 'propagate').and.callThrough();
            var compId = 'someId';
            var previousData = 'prevData';
            var currentData = 'nextData';
            this.designDataChangeAspect.registerHandler('mockHandler', spiedHandler);
            this.designDataChangeAspect.notify(compId, previousData, currentData);
            expect(spiedPropagate).toHaveBeenCalledWith(compId, previousData, currentData);
            expect(spiedHandler).toHaveBeenCalledWith(this.designDataChangeAspect._aspectSiteAPI.getSiteAPI(), compId, previousData, currentData);
        });

        it('should notify multiple handler on data change', function(){
            var spiedHandler = jasmine.createSpy('handler');
            var compId = 'someId';
            var previousData = 'prevData';
            var currentData = 'nextData';
            this.designDataChangeAspect.registerHandler('mockHandler', spiedHandler);
            this.designDataChangeAspect.registerHandler('mockHandler2', spiedHandler);
            this.designDataChangeAspect.registerHandler('mockHandler3', spiedHandler);
            this.designDataChangeAspect.notify(compId, previousData, currentData);
            expect(spiedHandler.calls.count()).toEqual(3);
        });

    });
});
