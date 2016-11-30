define(['lodash', 'testUtils', 'experiment',
        'documentServices/anchors/anchors',
        'definition!documentServices/siteAccessLayer/SiteUpdatesHandler',
        'fake!documentServices/siteAccessLayer/postUpdateOperations',
        'documentServices/mockPrivateServices/privateServicesHelper',
        'documentServices/utils/utils'
    ],
    function(_, testUtils, experiment, anchors, siteUpdatesHandlerDef, fakePostUpdateOperations, privateServicesHelper, dsUtils){
        "use strict";

        describe("SiteUpdatesHandler", function(){
            var privateServices;
            /** @type SiteUpdatesHandler*/
            var updatesHandler;
            var SiteUpdatesHandler = siteUpdatesHandlerDef(_, anchors, fakePostUpdateOperations, dsUtils);
//sorry for this... I really need karmit here
            function mockSiteAPIStuff(siteAPI){
                var actionsAspect = {
                    _callbacks: [],
                    registerNavigationComplete: function(callback){
                        this._callbacks.push(callback);
                    },

                    testEndTransition: function(){
                        //_.invoke(this, '_callbacks.apply', this);
                        _.forEach(this._callbacks, function(c){
                            c();
                        });
                    }
                };

                _.assign(siteAPI, {
                    getSiteAspect: function (name) {
                        if (name === 'actionsAspect') {
                            return actionsAspect;
                        }
                        throw "not supported aspect in this test :(";
                    },

                    testInit: function(){
                        this.isInTransition = false;
                        var self = this;
                        var aspect = self.getSiteAspect('actionsAspect');
                        aspect.registerNavigationComplete(function(){
                            self.isInTransition = false;
                        });
                        this.registerToDidLayout(function(){
                            _.defer(function(){
                                if (self.isInTransition){
                                    aspect.testEndTransition();
                                }
                            });
                        });
                    },

                    isSiteBusyIncludingTransition: function(){
                        return this.isInTransition || this.isSiteBusy();
                    },

                    testStartTransition: function(){
                        this.isInTransition = true;

                        this.forceUpdate();
                    }
                });

                siteAPI.testInit();
            }

            beforeEach(function(){
                privateServices = privateServicesHelper.mockPrivateServices();
                mockSiteAPIStuff(privateServices.siteAPI);
                this.updated = null;
                var self = this;
                updatesHandler = new SiteUpdatesHandler(privateServices, function(itemIds){
                    if (self.updated){
                        self.updated(itemIds);
                    }
                });
            });

            afterEach(function(){
                updatesHandler.dispose();
            });

            describe("update process", function(){
                it("should call done callback with the right itemIds when update is done", function(done){
                    this.updated = function(itemIds){
                        expect(itemIds).toEqual([1]);
                        done();
                    };
                    updatesHandler.addItemToUpdateBatch(1, {});
                    updatesHandler.closeBatchAndUpdate();
                });

                it("should add the item to the same batch if compatible (not updating anchors)", function(done){
                    this.updated = function(itemIds){
                        expect(itemIds).toEqual([1, 2]);
                        done();
                    };
                    updatesHandler.addItemToUpdateBatch(1, {isUpdatingAnchors: dsUtils.NO});
                    updatesHandler.addItemToUpdateBatch(2, {isUpdatingAnchors: dsUtils.NO});
                    updatesHandler.closeBatchAndUpdate();
                });

                it("should add the item to the same batch if compatible (updating anchors)", function(done){
                    this.updated = function(itemIds){
                        expect(itemIds).toEqual([1, 2]);
                        done();
                    };
                    updatesHandler.addItemToUpdateBatch(1, {isUpdatingAnchors: dsUtils.YES});
                    updatesHandler.addItemToUpdateBatch(2, {isUpdatingAnchors: dsUtils.YES});
                    updatesHandler.closeBatchAndUpdate();
                });

                it("should add the item to the same batch if compatible: no and don't care", function(done){
                    this.updated = function(itemIds){
                        expect(itemIds).toEqual([1, 2, 3]);
                        done();
                    };
                    updatesHandler.addItemToUpdateBatch(1, {isUpdatingAnchors: dsUtils.NO});
                    updatesHandler.addItemToUpdateBatch(2, {isUpdatingAnchors: dsUtils.DONT_CARE});
                    updatesHandler.addItemToUpdateBatch(3, {isUpdatingAnchors: dsUtils.NO});
                    updatesHandler.closeBatchAndUpdate();
                });

                it("should add the item to the same batch if compatible: yes and don't care", function(done){
                    this.updated = function(itemIds){
                        expect(itemIds).toEqual([1, 2, 3]);
                        done();
                    };
                    updatesHandler.addItemToUpdateBatch(1, {isUpdatingAnchors: dsUtils.YES});
                    updatesHandler.addItemToUpdateBatch(2, {isUpdatingAnchors: dsUtils.DONT_CARE});
                    updatesHandler.addItemToUpdateBatch(3, {isUpdatingAnchors: dsUtils.YES});
                    updatesHandler.closeBatchAndUpdate();
                });

                it("should not add the item to the same batch if incompatible", function(done){
                    this.updated = function(itemIds){
                        expect(itemIds).toEqual([1]);
                        done();
                    };
                    expect(updatesHandler.addItemToUpdateBatch.bind(updatesHandler, 1, {isUpdatingAnchors: dsUtils.NO})).not.toThrow();
                    expect(updatesHandler.addItemToUpdateBatch.bind(updatesHandler, 2, {isUpdatingAnchors: dsUtils.YES})).toThrow();
                    updatesHandler.closeBatchAndUpdate();
                });

                it("should call registered callback on any update", function(done){
                    var callback1 = jasmine.createSpy('callback1');
                    var callback2 = jasmine.createSpy('callback2');

                    this.updated = function(){
                        expect(callback1).toHaveBeenCalled();
                        expect(callback2).toHaveBeenCalled();
                        done();
                    };

                    updatesHandler.registerToSiteUpdated(callback1);
                    updatesHandler.registerToSiteUpdated(callback2);

                    updatesHandler.addItemToUpdateBatch(1, {});
                    updatesHandler.closeBatchAndUpdate();
                });

                it("should call registered callback with right itemIds", function(done){
                    var callback1 = jasmine.createSpy('callback1');
                    var callback2 = jasmine.createSpy('callback2');

                    this.updated = function(){
                        expect(callback1).toHaveBeenCalledWith([1], ['method']);
                        expect(callback2).toHaveBeenCalledWith([1], ['method']);
                        done();
                    };

                    updatesHandler.registerToSiteUpdated(callback1);
                    updatesHandler.registerToSiteUpdated(callback2);

                    updatesHandler.addItemToUpdateBatch(1, {methodName: 'method'});
                    updatesHandler.closeBatchAndUpdate();
                });

                it("should throw if cancel is called when no update is running", function(){
                    expect(function(){
                        updatesHandler.removeItemFromUpdateBatch();
                    }).toThrow();
                });

                it("should do nothing if finish is called when no update is running", function (done) {
                    spyOn(privateServices.siteAPI, 'forceUpdate');

                    updatesHandler.closeBatchAndUpdate();

                    setTimeout(function () {
                        expect(privateServices.siteAPI.forceUpdate).not.toHaveBeenCalled();
                        done();
                    }, 50);
                });

                it("should throw if adding a non compatible item to batch", function(){
                    updatesHandler.addItemToUpdateBatch(1, {isUpdatingAnchors: dsUtils.YES});
                    expect(function (){
                        updatesHandler.addItemToUpdateBatch(2, {isUpdatingAnchors: dsUtils.NO});
                    }).toThrow();
                });

                it("should throw if if adding a non compatible item to batch, even if the prev  one was cancelled", function(){
                    updatesHandler.addItemToUpdateBatch(1, {isUpdatingAnchors: dsUtils.YES});
                    updatesHandler.removeItemFromUpdateBatch(1);
                    expect(function (){
                        updatesHandler.addItemToUpdateBatch(2, {isUpdatingAnchors: dsUtils.NO});
                    }).toThrow();
                });

                it("should discard post update operations on cancel update process", function(done){
                    updatesHandler.addItemToUpdateBatch(1, {isUpdatingAnchors: dsUtils.YES});
                    var postUpdate = jasmine.createSpy('postUpdate');
                    updatesHandler.addItemPostUpdateOperation(postUpdate, 1);
                    updatesHandler.removeItemFromUpdateBatch(1);

                    this.updated = function(itemIds){
                        expect(itemIds).toEqual([1, 2]);
                        expect(postUpdate).not.toHaveBeenCalled();
                        done();
                    };
                    updatesHandler.addItemToUpdateBatch(2, {isUpdatingAnchors: dsUtils.YES});
                    updatesHandler.closeBatchAndUpdate();
                });


                it("should throw start another update when previous is during site update", function(){
                    updatesHandler.addItemToUpdateBatch(1, {});
                    privateServices.siteAPI.makeForceUpdateAsync();
                    updatesHandler.closeBatchAndUpdate();
                    expect(function(){
                        updatesHandler.addItemToUpdateBatch(2, {isUpdatingAnchors: dsUtils.YES});
                    }).toThrow();
                });

                it("should allow another process to start when the previous one is done", function(done){
                    this.updated = function(itemIds){
                        if (_.isEqual(itemIds, [1])){
                            updatesHandler.addItemToUpdateBatch(2, {isUpdatingAnchors: dsUtils.NO});
                            updatesHandler.closeBatchAndUpdate();
                        } else if (_.isEqual(itemIds, [2])){
                            done();
                        }
                    };
                    updatesHandler.addItemToUpdateBatch(1, {isUpdatingAnchors: dsUtils.YES});
                    updatesHandler.closeBatchAndUpdate();
                });

            });

            describe("site updated only when transition done", function(){

                it("should run post update ops and done callbacks only after transition and not layout done", function(done){
                    var postUpdate1 = jasmine.createSpy('postUpdate1');
                    var callback1 = jasmine.createSpy('callback1');
                    updatesHandler.registerToSiteUpdated(callback1);

                    var didLayout = false;
                    privateServices.siteAPI.registerToDidLayout(function(){
                        didLayout = true;
                        expect(postUpdate1).not.toHaveBeenCalled();
                        expect(callback1).not.toHaveBeenCalled();
                    });

                    this.updated = function(){
                        expect(didLayout).toBeTruthy();
                        expect(postUpdate1).toHaveBeenCalled();
                        expect(callback1).toHaveBeenCalled();
                        done();
                    };

                    updatesHandler.addItemToUpdateBatch(1, {waitingForTransition: true});
                    updatesHandler.addItemPostUpdateOperation(postUpdate1, 1);
                    privateServices.siteAPI.testStartTransition();
                    updatesHandler.closeBatchAndUpdate();
                });

                it("should still wait for transition even if site was updated before the transition started", function(done){
                    var callback1 = jasmine.createSpy('callback1');
                    updatesHandler.registerToSiteUpdated(callback1);
                    var didLayout = false;
                    this.updated = function(){
                        expect(didLayout).toBeTruthy();
                        expect(callback1).toHaveBeenCalled();
                        done();
                    };


                    updatesHandler.addItemToUpdateBatch(1, {waitingForTransition: true});
                    //here is the point - site was rendered before the operation was applied at all
                    privateServices.siteAPI.forceUpdate();
                    privateServices.siteAPI.testStartTransition();

                    privateServices.siteAPI.registerToDidLayout(function(){
                        didLayout = true;
                        expect(callback1).not.toHaveBeenCalled();
                    });

                    updatesHandler.closeBatchAndUpdate();
                });

                xit("should not be able to add stuff to a batch if during transition", function(done){
                    privateServices.siteAPI.registerToDidLayout(function(){
                        expect(updatesHandler.canAddItemToUpdateBatch({})).toBe(false);
                        expect(function(){
                            updatesHandler.addItemToUpdateBatch(1, {});
                        }).toThrow("the site is during update or this item isn't compatible with the current batch");
                        done();
                    });

                    expect(updatesHandler.canAddItemToUpdateBatch({})).toBe(true);
                    privateServices.siteAPI.testStartTransition();
                    expect(updatesHandler.canAddItemToUpdateBatch({})).toBe(false);
                    privateServices.siteAPI.forceUpdate();
                });

                it("should be able to add stuff to batch after transition ended, transition initiated by DS", function(done){
                    updatesHandler.addItemToUpdateBatch(1, {waitingForTransition: true});
                    privateServices.siteAPI.testStartTransition();
                    updatesHandler.closeBatchAndUpdate();

                    this.updated = function(){
                        expect(updatesHandler.canAddItemToUpdateBatch({})).toBe(true);
                        done();
                    };
                });

                it("if in batch there is an operation that waits for transition, all should wait for transition", function(done){
                    var callback1 = jasmine.createSpy('callback1');
                    updatesHandler.registerToSiteUpdated(callback1);

                    var didLayout = false;
                    privateServices.siteAPI.registerToDidLayout(function(){
                        didLayout = true;
                        expect(callback1).not.toHaveBeenCalled();
                    });

                    this.updated = function(itemIds){
                        expect(didLayout).toBeTruthy();
                        expect(itemIds).toEqual([1, 2]);
                        expect(callback1).toHaveBeenCalled();
                        done();
                    };

                    updatesHandler.addItemToUpdateBatch(1, {waitingForTransition: true});
                    updatesHandler.addItemToUpdateBatch(2, {waitingForTransition: false});
                    privateServices.siteAPI.testStartTransition();
                    updatesHandler.closeBatchAndUpdate();
                });

                it("should wait for site layout in next batch after a batch waiting for transition", function(done){
                    updatesHandler.addItemToUpdateBatch(1, {waitingForTransition: true});
                    privateServices.siteAPI.testStartTransition();
                    updatesHandler.closeBatchAndUpdate();



                    this.updated = function(itemIds){
                        if (_.isEqual(itemIds, [1])){
                            updatesHandler.addItemToUpdateBatch(2, {waitingForTransition: false});
                            updatesHandler.closeBatchAndUpdate();
                        } else if (_.isEqual(itemIds, [2])){
                            done();
                        }
                    };
                });
            });

            describe("canAddItemToUpdateBatch", function(){
                it("should return false if the site is currently rendering", function(){
                    privateServices.siteAPI.makeForceUpdateAsync();
                    updatesHandler.addItemToUpdateBatch(1, {});
                    updatesHandler.closeBatchAndUpdate();
                    expect(updatesHandler.canAddItemToUpdateBatch({isUpdatingAnchors: dsUtils.NO})).toBeFalsy();
                });

                it("should return false if site is busy due to some viewer activity", function(){
                    privateServices.siteAPI.makeForceUpdateAsync();
                    privateServices.siteAPI.forceUpdate();
                    expect(updatesHandler.canAddItemToUpdateBatch({isUpdatingAnchors: dsUtils.NO})).toBeFalsy();
                });

                it("should return true if nothing is running", function(){
                    expect(updatesHandler.canAddItemToUpdateBatch({isUpdatingAnchors: dsUtils.NO})).toBeTruthy();
                });

                it("should return true if same type of update", function(){
                    updatesHandler.addItemToUpdateBatch(1, {isUpdatingAnchors: dsUtils.YES});
                    expect(updatesHandler.canAddItemToUpdateBatch({isUpdatingAnchors: dsUtils.YES})).toBeTruthy();
                });

                it("should return false if different types of update", function(){
                    updatesHandler.addItemToUpdateBatch(1, {isUpdatingAnchors: dsUtils.YES});
                    expect(updatesHandler.canAddItemToUpdateBatch({isUpdatingAnchors: dsUtils.NO})).toBeFalsy();
                });

            });

            describe("post update operations", function(){
                it("should run the generic post operation (update from measureMap) after every update", function(done){
                    var postOp = spyOn(fakePostUpdateOperations, 'runPostUpdateOperations');
                    this.updated = function(){
                        expect(postOp).toHaveBeenCalled();
                        done();
                    };
                    updatesHandler.addItemToUpdateBatch(1, {});
                    updatesHandler.closeBatchAndUpdate();

                });

                it("should call all post update operations", function(done){
                    var postUpdate1 = jasmine.createSpy('postUpdate1');
                    var postUpdate2 = jasmine.createSpy('postUpdate2');
                    var postUpdate3 = jasmine.createSpy('postUpdate3');
                    this.updated = function(){
                        expect(postUpdate1).toHaveBeenCalled();
                        expect(postUpdate2).toHaveBeenCalled();
                        expect(postUpdate3).toHaveBeenCalled();
                        done();
                    };
                    updatesHandler.addItemToUpdateBatch(1, {isUpdatingAnchors: dsUtils.YES});
                    updatesHandler.addItemPostUpdateOperation(postUpdate1, 1);
                    updatesHandler.addItemPostUpdateOperation(postUpdate2, 1);
                    updatesHandler.addItemToUpdateBatch(2, {isUpdatingAnchors: dsUtils.YES});
                    updatesHandler.addItemToUpdateBatch(3, {isUpdatingAnchors: dsUtils.YES});
                    updatesHandler.addItemPostUpdateOperation(postUpdate3, 3);
                    updatesHandler.closeBatchAndUpdate();
                });

                it("should run the passed post update operation after the generic post operation", function(done){
                    var genericPostOp = spyOn(fakePostUpdateOperations, 'runPostUpdateOperations');

                    var postUpdate = jasmine.createSpy('postUpdate').and.callFake(function(){
                        expect(genericPostOp).toHaveBeenCalled();
                        setTimeout(done, 0);
                    });

                    updatesHandler.addItemToUpdateBatch(1, {isUpdatingAnchors: dsUtils.YES});
                    updatesHandler.addItemPostUpdateOperation(postUpdate, 1);
                    updatesHandler.closeBatchAndUpdate();
                });

                it("should throw if trying to add a post update operation while no update is in process", function(){
                    expect(function(){
                        updatesHandler.addItemPostUpdateOperation(_.noop, 1);
                    }).toThrow();
                });

            });

        });
    });
