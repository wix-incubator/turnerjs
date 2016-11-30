define([
    'lodash',
    'documentServices/tpa/saveTasks/saveEventDispatcher',
    'documentServices/tpa/tpa',
    'documentServices/hooks/hooks'
], function (_, saveEventDispatcher, tpa, hooks) {
    'use strict';

    describe('saveEventDispatcher', function(){
        beforeEach(function(){
            spyOn(tpa.change, 'siteSaved').and.callThrough();
        });

        it('should not trigger the save callbacks since they will be triggered in the save tasks', function(){
            saveEventDispatcher.publish({}, jasmine.createSpy('resolve'));
            expect(tpa.change.siteSaved).not.toHaveBeenCalled();
        });

        describe('autosave', function(){
            beforeEach(function(){
                spyOn(hooks, 'executeHook');
                this.lastSavedData = {};
                this.currentData = {};
                this.resolveSpy = jasmine.createSpy('resolve');
            });

            _.forEach(['partialSave', 'fullSave', 'firstSave'], function(funcName){
                it('should execute SITE_SAVED hook on ' + funcName, function(){
                    saveEventDispatcher[funcName](this.lastSavedData, this.currentData, this.resolveSpy);

                    expect(hooks.executeHook).toHaveBeenCalledWith(hooks.HOOKS.SAVE.SITE_SAVED);
                });
            });
        });
    });

});
