define(['lodash',
    'documentServices/dataAccessLayer/wixImmutable',
    'documentServices/tpa/services/appStoreService',
    'documentServices/tpa/saveTasks/saveUnprovisionedAppsForAppFlows', 'testUtils'], function (_, wixImmutable, appStoreService, saveUnprovisionedAppsForAppFlows, testUtils) {
    'use strict';

    describe('saveUnprovisionedAppsForAppFlows', function(){

        var msgSpecMap = {a: 1, b: 2};
        function serverResponse(obj) {
            return _.assign({payload: {clientSpecMap: msgSpecMap}}, obj);
        }

        beforeEach(function(){
            jasmine.clock().install();
						testUtils.experimentHelper.openExperiments(['retryOnConcurrencyError']);

            this.lastImmutableSnapshot = wixImmutable.fromJS({
                rendererModel: {
                    clientSpecMap: {}
                }
            });

            var currentImmutableSnapshotSpecMap = {
              c: 3
            };

            this.currentImmutableSnapshot = wixImmutable.fromJS({
                rendererModel: {
                    clientSpecMap: currentImmutableSnapshotSpecMap
                }
            });

            this.resolveSpy = jasmine.createSpy('resolve');
            this.rejectSpy = jasmine.createSpy('reject');
            this.expectedMergedClientSpecMap = {'rendererModel.clientSpecMap': {a: 1, b: 2, c: 3}};
        });

        afterEach(function() {
            jasmine.clock().uninstall();
            testUtils.experimentHelper.closeExperiments('retryOnConcurrencyError');
        });


        it("Should call resolve on success", function(){
            var res = serverResponse({success: true, errorCode: 0});

            spyOn(appStoreService, 'settleOnSave').and.callFake(function(lastImmutableSnapshot, currentImmutableSnapshot, firstSave, resolve){
                resolve(res);
            });

            saveUnprovisionedAppsForAppFlows.partialSave(this.lastImmutableSnapshot, this.currentImmutableSnapshot,
              this.resolveSpy, this.rejectSpy);
            jasmine.clock().tick(201);

            expect(this.resolveSpy).toHaveBeenCalledWith(this.expectedMergedClientSpecMap);
            expect(this.rejectSpy).not.toHaveBeenCalled();
        });

        it("Should call reject on error", function(){
            var res = serverResponse({success: false, errorCode: 14});
            spyOn(appStoreService, 'settleOnSave').and.callFake(function(lastImmutableSnapshot, currentImmutableSnapshot, firstSave, resolve, reject){
                reject(res);
            });

            saveUnprovisionedAppsForAppFlows.partialSave(this.lastImmutableSnapshot, this.currentImmutableSnapshot, this.resolveSpy, this.rejectSpy);
            jasmine.clock().tick(201);

            expect(this.resolveSpy).not.toHaveBeenCalled();
            expect(this.rejectSpy).toHaveBeenCalledWith(res);
        });


        it("Should retry once on concurrency error", function(){
            var res = serverResponse({success: false, errorCode: -40103});
            spyOn(appStoreService, 'settleOnSave').and.callFake(function(lastImmutableSnapshot, currentImmutableSnapshot, firstSave, resolve){
                resolve(res);
            });

            saveUnprovisionedAppsForAppFlows.partialSave(this.lastImmutableSnapshot, this.currentImmutableSnapshot, this.resolveSpy, this.rejectSpy);
            jasmine.clock().tick(400);

            expect(this.rejectSpy).not.toHaveBeenCalled();
            expect(this.resolveSpy).toHaveBeenCalledWith();
            expect(appStoreService.settleOnSave.calls.count()).toBe(2);

            // That's just an extra assert to make sure parameters are passed correctly. I've added it here to 
            // save an extra it statement with the same boilerplate.
            expect(appStoreService.settleOnSave.calls.argsFor(0)).toEqual(
              [this.lastImmutableSnapshot, this.currentImmutableSnapshot, false, jasmine.any(Function), this.rejectSpy]);

        });

        it("passes the relevant parameters to settleOnSave ", function(){
            spyOn(appStoreService, 'settleOnSave');
            saveUnprovisionedAppsForAppFlows.partialSave(this.lastImmutableSnapshot, this.currentImmutableSnapshot, this.resolveSpy, this.rejectSpy);
            jasmine.clock().tick(201);

            expect(appStoreService.settleOnSave.calls.argsFor(0)).toEqual(
              [this.lastImmutableSnapshot, this.currentImmutableSnapshot, false, jasmine.any(Function), this.rejectSpy]);

        });

        it("Should not retry once on concurrency error if the experiment is not open", function(){
            testUtils.experimentHelper.closeExperiments('retryOnConcurrencyError');
            var res = serverResponse({success: false, errorCode: -40103});
            spyOn(appStoreService, 'settleOnSave').and.callFake(function(lastImmutableSnapshot, currentImmutableSnapshot, firstSave, resolve){
                resolve(res);
            });

            saveUnprovisionedAppsForAppFlows.partialSave(this.lastImmutableSnapshot, this.currentImmutableSnapshot, this.resolveSpy, this.rejectSpy);
            jasmine.clock().tick(400);

            expect(this.rejectSpy).not.toHaveBeenCalled();
            expect(this.resolveSpy).toHaveBeenCalledWith(this.expectedMergedClientSpecMap);
            expect(appStoreService.settleOnSave.calls.count()).toBe(1);
        });
    });

});
