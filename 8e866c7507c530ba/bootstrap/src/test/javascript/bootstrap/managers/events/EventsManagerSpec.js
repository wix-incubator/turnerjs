describe("EventsManager", function(){
    testRequire().classes('bootstrap.managers.events.EventsManager');
    var defaults = {
        'disId' : 'disId',
        'lisId': 'lisId',
        'handler': function(){},
        'event': 'testEv'
    };

    function killObject(objectId){
        this.deadObjectsMap[objectId] = true;
        if(this.objectsMap[objectId]){
            this.objectsMap[objectId].$alive = false;
        }
        this._eventsManager.deleteObjectFromMaps(objectId);
    }

    function getMockEventDispatcher(scope, id){
        return {
            $alive: !scope.deadObjectsMap[id],
            $id: id,
            'removeNativeListener': scope.removeNativeListenerSpy,
            'addNativeListener': scope.addNativeListenerSpy
        };
    }

    beforeEach(function(){
        this.objectsMap = {};
        this.deadObjectsMap = {};
        this._eventsManager = new this.EventsManager();
        spyOn(this._eventsManager, '_isValidObjectId').andReturn(true);
        this.removeNativeListenerSpy = jasmine.createSpy('removeNativeListener');
        this.addNativeListenerSpy = jasmine.createSpy('addNativeListener');
        var that = this;

        spyOn(this._eventsManager, 'getObjectById').andCallFake(function(id){
            that.objectsMap[id] = that.objectsMap[id] || getMockEventDispatcher(that, id);
            return that.objectsMap[id];
        });
        spyOn(this._eventsManager, '_deleteObjectFromMap');
        defaults.handler = jasmine.createSpy('handler');
    });

    function addHandler(manager, params){
        params = params || {};
        var handler = params.handler || defaults.handler;
        var listenerId = params.listenerId || defaults.lisId;
        var eventType = params.type || defaults.event;
        var dispatcherId = params.dispatcherId || defaults.disId;
        var isOnce = params.once || false;
        manager.addEventHandler(dispatcherId, eventType, listenerId, handler, params.nativeHandler, isOnce);
        return {'listenerId': listenerId, 'handler': handler};
    }
    describe("addEventHandler, dispatchEvent", function(){
        it("should add event handler", function(){
            addHandler(this._eventsManager);
            this._eventsManager.dispatchEvent(defaults.disId, defaults.event);
            expect(defaults.handler).toHaveBeenCalledXTimes(1);
        });
        it("should not add the same handler twice", function(){
            var handler = jasmine.createSpy('handler');
            addHandler(this._eventsManager, {'handler': handler});
            addHandler(this._eventsManager, {'handler': handler});
            this._eventsManager.dispatchEvent(defaults.disId, defaults.event);
            expect(handler).toHaveBeenCalledXTimes(1);
        });
        it("should add 2 different handlers for same listener", function(){
            var handler1 = jasmine.createSpy('handler1');
            var handler2 = jasmine.createSpy('handle2');
            addHandler(this._eventsManager, {'handler': handler1});
            addHandler(this._eventsManager, {'handler': handler2});
            this._eventsManager.dispatchEvent(defaults.disId, defaults.event);
            expect(handler1).toHaveBeenCalledXTimes(1);
            expect(handler2).toHaveBeenCalledXTimes(1);

        });
        it("should add 2 handlers for 2 listeners", function(){
            addHandler(this._eventsManager, {'listenerId': 'lisId1'});
            addHandler(this._eventsManager, {'listenerId': 'lisId2'});
            this._eventsManager.dispatchEvent(defaults.disId, defaults.event);
            expect(defaults.handler).toHaveBeenCalledXTimes(2);
        });
        it("should add native event if native handler passed", function(){
            var handler = function(){};
            addHandler(this._eventsManager, {'nativeHandler': handler});
            expect(this.addNativeListenerSpy).toHaveBeenCalledWith(defaults.event, handler);
        });
        it("should not add native event if handler isn't passed", function(){
            addHandler(this._eventsManager);
            expect(this.addNativeListenerSpy).not.toHaveBeenCalled();
        });
    });

    describe("removeEventHandler test for memory leaks", function(){
        it("should remove the object from the object ids list if it doesn't listen or dispatch anything", function(){
            addHandler(this._eventsManager);
            this._eventsManager.removeEventHandler(defaults.disId, defaults.event, defaults.lisId, defaults.handler);
            expect(this._eventsManager._deleteObjectFromMap).toHaveBeenCalledWith(defaults.disId);
            expect(this._eventsManager._deleteObjectFromMap).toHaveBeenCalledWith(defaults.lisId);
        });
        it("shouldn't remove the listener object from the object ids list if it still listens to some event on the same object", function(){
            addHandler(this._eventsManager);
            addHandler(this._eventsManager, {'handler': function(){}});
            this._eventsManager.removeEventHandler(defaults.disId, defaults.event, defaults.lisId, defaults.handler);
            expect(this._eventsManager._deleteObjectFromMap).not.toHaveBeenCalled();
        });
        it("shouldn't remove the listener object from the object ids list if it still dispatches some event", function(){
            addHandler(this._eventsManager);
            addHandler(this._eventsManager, {'dispatcherId': defaults.lisId, 'listenerId': 'ddd'});
            this._eventsManager.removeEventHandler(defaults.disId, defaults.event, defaults.lisId, defaults.handler);
            expect(this._eventsManager._deleteObjectFromMap).toHaveBeenCalledWith(defaults.disId);
            expect(this._eventsManager._deleteObjectFromMap).not.toHaveBeenCalledWith(defaults.lisId);
        });
        it("shouldn't remove the dispatcher object from the object ids list if it still listens to some event", function(){
            addHandler(this._eventsManager);
            addHandler(this._eventsManager, {'dispatcherId': 'sdf', 'listenerId': defaults.disId});
            this._eventsManager.removeEventHandler(defaults.disId, defaults.event, defaults.lisId, defaults.handler);
            expect(this._eventsManager._deleteObjectFromMap).toHaveBeenCalledWith(defaults.lisId);
            expect(this._eventsManager._deleteObjectFromMap).not.toHaveBeenCalledWith(defaults.disId);
        });
        it("shouldn't remove the dispatcher object from the object ids list if it still dispatches some event", function(){
            addHandler(this._eventsManager);
            addHandler(this._eventsManager, {'dispatcherId': defaults.disId, 'listenerId': 'sdf'});
            this._eventsManager.removeEventHandler(defaults.disId, defaults.event, defaults.lisId, defaults.handler);
            expect(this._eventsManager._deleteObjectFromMap).toHaveBeenCalledWith(defaults.lisId);
            expect(this._eventsManager._deleteObjectFromMap).not.toHaveBeenCalledWith(defaults.disId);
        });

        it("should remove native event if there is one", function(){
            var handler = function(){};
            addHandler(this._eventsManager, {'nativeHandler': handler});
            this._eventsManager.removeEventHandler(defaults.disId, defaults.event, defaults.lisId, defaults.handler);
            expect(this.removeNativeListenerSpy).toHaveBeenCalledWith(defaults.event, handler);
        });
        it("should not try remove native event if there isn't one", function(){
            addHandler(this._eventsManager);
            expect(this.removeNativeListenerSpy).not.toHaveBeenCalled();
        });
    });

    describe("removeEventHandler during dispatch", function(){
        function createHandlersAndDispatchEvent(){
            this.handler2 = jasmine.createSpy('handler2');
            addHandler(this._eventsManager, {'listenerId': 'list1', 'handler': this.handler1});
            addHandler(this._eventsManager, {'listenerId': 'list2', 'handler': this.handler2});
            this._eventsManager.dispatchEvent(defaults.disId, defaults.event);
        }

        it("should run all the remaining handlers if one handler has been removed", function(){
            var self = this;
            this.handler1 = jasmine.createSpy('handler1').andCallFake(function(){
                self._eventsManager.removeEventHandler(defaults.disId, defaults.event, 'list1', self.handler1);
            });

            createHandlersAndDispatchEvent.call(this);
            expect(this.handler1).toHaveBeenCalled();
            expect(this.handler2).toHaveBeenCalled();
        });

        it("should run all the remaining handlers if one listener has been removed", function(){
            var self = this;
            this.handler1 = jasmine.createSpy('handler1').andCallFake(function(){
                self._eventsManager.removeEventsForListener(defaults.disId, 'list1');
            });

            createHandlersAndDispatchEvent.call(this);
            expect(this.handler1).toHaveBeenCalled();
            expect(this.handler2).toHaveBeenCalled();
        });

        it("should run all the remaining handlers if one listener has been exterminated", function(){
            var self = this;
            this.handler1 = jasmine.createSpy('handler1').andCallFake(function(){
                killObject.call(self, 'list1');
            });

            createHandlersAndDispatchEvent.call(this);
            expect(this.handler1).toHaveBeenCalled();
            expect(this.handler2).toHaveBeenCalled();
        });
    });

    describe("exterminate object during dispatch", function(){
        it("should stop executing handlers if the dispatcher has died", function(){
            var self = this;
            var handler1 = jasmine.createSpy('handler1').andCallFake(function(){
               killObject.call(self, defaults.disId);
            });
            var handler2 = jasmine.createSpy('handler2');
            var handler3 = jasmine.createSpy('handler3');
            addHandler(this._eventsManager, {'handler': handler1});
            addHandler(this._eventsManager, {'handler': handler2});
            addHandler(this._eventsManager, {'handler': handler3});

            this._eventsManager.dispatchEvent(defaults.disId, defaults.event);

            expect(handler1).toHaveBeenCalled();
            expect(handler2).not.toHaveBeenCalled();
            expect(handler3).not.toHaveBeenCalled();
        });
        it("should not execute the handler if the listener has died", function(){
            var self = this;
            var handler1 = jasmine.createSpy('handler1').andCallFake(function(){
                killObject.call(self, defaults.lisId);
            });
            var handler2 = jasmine.createSpy('handler2');
            var handler3 = jasmine.createSpy('handler3');
            addHandler(this._eventsManager, {'handler': handler1});
            addHandler(this._eventsManager, {'handler': handler2});
            addHandler(this._eventsManager, {'handler': handler3, 'listenerId': 'list2'});

            this._eventsManager.dispatchEvent(defaults.disId, defaults.event);

            expect(handler1).toHaveBeenCalled();
            expect(handler2).not.toHaveBeenCalled();
            expect(handler3).toHaveBeenCalled();
        });

        it("should regard listeners which aren't event dispatcher as alive", function(){
            var originalMethod = this._eventsManager.getObjectById;
            this._eventsManager.getObjectById.isSpy = false;
            spyOn(this._eventsManager, 'getObjectById').andCallFake(function(id){
                if(id === defaults.lisId) {
                    return {'$id': id};
                }
                return originalMethod(id);
            });

            var handler1 = jasmine.createSpy('handler1');
            addHandler(this._eventsManager, {'handler': handler1});
            this._eventsManager.dispatchEvent(defaults.disId, defaults.event);
            expect(handler1).toHaveBeenCalled();
        });

        it("should regard an object which isn't in the map as dead", function(){
            var originalMethod = this._eventsManager.getObjectById;
            this._eventsManager.getObjectById.isSpy = false;
            spyOn(this._eventsManager, 'getObjectById').andCallFake(function(id){
                if(id === defaults.lisId) {
                    return undefined;
                }
                return originalMethod(id);
            });

            var handler1 = jasmine.createSpy('handler1');
            var handler2 = jasmine.createSpy('handler2');
            addHandler(this._eventsManager, {'handler': handler1});
            addHandler(this._eventsManager, {'handler': handler2, 'listenerId': 'list2'});
            this._eventsManager.dispatchEvent(defaults.disId, defaults.event);
            expect(handler1).not.toHaveBeenCalled();
            expect(handler2).toHaveBeenCalled();
        });

    });

    describe("dispatchEvent", function(){
        it("should call the handler with the event object", function(){
            var handler = function(evt){
                expect(evt.type).toBe(defaults.event);
                expect(evt.data).toBeEquivalentTo({'a': 3});
                expect(evt.target.$id).toBe(defaults.disId);
            };
            addHandler(this._eventsManager, {'handler': handler});
            this._eventsManager.dispatchEvent(defaults.disId, defaults.event, {'a': 3});
        });

        it("should call multiple handlers", function(){
            var handler1 = jasmine.createSpy('handler1');
            var handler2 = jasmine.createSpy('handler2');
            var handler3 = jasmine.createSpy('handler3');
            addHandler(this._eventsManager, {'handler': handler1});
            addHandler(this._eventsManager, {'handler': handler2, 'listenerId': 'dfgg'});
            addHandler(this._eventsManager, {'handler': handler3});
            this._eventsManager.dispatchEvent(defaults.disId, defaults.event);
            expect(handler1).toHaveBeenCalled();
            expect(handler2).toHaveBeenCalled();
            expect(handler3).toHaveBeenCalled();
        });
        it("should collect the returned values if collectReturnedValues passed as true", function(){
            var handler1 = function(evt){
                expect(evt.returnedValues).toBeEquivalentTo([]);
                return 1;
            };
            var handler2 = function(evt){
                expect(evt.returnedValues).toBeEquivalentTo([1]);
                return 2;
            };
            var handler3 = function(evt){
                expect(evt.returnedValues).toBeEquivalentTo([1,2]);
                return 3;
            };

            addHandler(this._eventsManager, {'handler': handler1, 'listenerId': 'aa'});
            addHandler(this._eventsManager, {'handler': handler2, 'listenerId': 'bb'});
            addHandler(this._eventsManager, {'handler': handler3, 'listenerId': 'aa'});

            this._eventsManager.dispatchEvent(defaults.disId, defaults.event, null, true);
        });

        it("should not collect returned values if collectReturnedValues isn't true", function(){
             var handler = function(evt){
                 expect(evt.returnedValues).toBeUndefined();
            };
            addHandler(this._eventsManager, {'handler': handler});
            this._eventsManager.dispatchEvent(defaults.disId, defaults.event, {'a': 3});
        });
    });

    describe("addEventHandlerOnce", function(){
        beforeEach(function(){
            spyOn(this._eventsManager, 'removeEventHandler');
        });

        it("should add event handler", function(){
            addHandler(this._eventsManager, {'once': true});
            this._eventsManager.dispatchEvent(defaults.disId, defaults.event);
            expect(defaults.handler).toHaveBeenCalledXTimes(1);
        });
        it("should remove the event after it's dispatched", function(){
            addHandler(this._eventsManager, {'once': true});
            this._eventsManager.dispatchEvent(defaults.disId, defaults.event);
            expect(this._eventsManager.removeEventHandler).toHaveBeenCalledWith(defaults.disId, defaults.event, defaults.lisId, defaults.handler);
        });
        it("should remove both of the handlers after the dispatch", function(){
            addHandler(this._eventsManager, {'once': true});
            var handler = jasmine.createSpy('handler');
            addHandler(this._eventsManager, {'handler': handler, 'listenerId': 'lisId1', 'once': true});

            this._eventsManager.dispatchEvent(defaults.disId, defaults.event);

            expect(this._eventsManager.removeEventHandler).toHaveBeenCalledWith(defaults.disId, defaults.event, defaults.lisId, defaults.handler);
            expect(this._eventsManager.removeEventHandler).toHaveBeenCalledWith(defaults.disId, defaults.event, 'lisId1', handler);
        });
        it("should remove the handler added once and not remove the other one when the once added first", function(){
            addHandler(this._eventsManager, {'once': true});
            var handler = jasmine.createSpy('handler');
            addHandler(this._eventsManager, {'handler': handler, 'listenerId': 'lisId1', 'once': false});

            this._eventsManager.dispatchEvent(defaults.disId, defaults.event);

            expect(this._eventsManager.removeEventHandler).toHaveBeenCalledWith(defaults.disId, defaults.event, defaults.lisId, defaults.handler);
            expect(this._eventsManager.removeEventHandler).not.toHaveBeenCalledWith(defaults.disId, defaults.event, 'lisId1', handler);
        });
        it("should remove the handler added once and not remove the other one when the once added second", function(){
            var handler = jasmine.createSpy('handler');
            addHandler(this._eventsManager, {'handler': handler, 'listenerId': 'lisId1', 'once': false});
            addHandler(this._eventsManager, {'once': true});

            this._eventsManager.dispatchEvent(defaults.disId, defaults.event);

            expect(this._eventsManager.removeEventHandler).toHaveBeenCalledWith(defaults.disId, defaults.event, defaults.lisId, defaults.handler);
            expect(this._eventsManager.removeEventHandler).not.toHaveBeenCalledWith(defaults.disId, defaults.event, 'lisId1', handler);
        });
    });

    describe("deleteObjectFromMaps", function(){
        it("should delete the object", function(){
            addHandler(this._eventsManager);
            killObject.call(this, defaults.disId);

            expect(this._eventsManager._deleteObjectFromMap).toHaveBeenCalledWith(defaults.lisId);
            expect(this._eventsManager._deleteObjectFromMap).toHaveBeenCalledWith(defaults.disId);

        });
        it("should delete the object and only the free listeners to the events it dispatches", function(){
            addHandler(this._eventsManager);
            addHandler(this._eventsManager, {'dispatcherId': defaults.disId, 'listenerId': 'noDelete'});
            addHandler(this._eventsManager, {'dispatcherId': 'asd', 'listenerId': 'noDelete'});
            addHandler(this._eventsManager, {'dispatcherId': defaults.disId, 'listenerId': 'delete'});
            killObject.call(this, defaults.disId);

            expect(this._eventsManager._deleteObjectFromMap).toHaveBeenCalledWith(defaults.disId);
            expect(this._eventsManager._deleteObjectFromMap).toHaveBeenCalledWith(defaults.lisId);
            expect(this._eventsManager._deleteObjectFromMap).toHaveBeenCalledWith('delete');
            expect(this._eventsManager._deleteObjectFromMap).not.toHaveBeenCalledWith('noDelete');
            expect(this._eventsManager._deleteObjectFromMap).not.toHaveBeenCalledWith('asd');
        });
        it("should delete the object and only the free dispatchers that it listens to", function(){
            addHandler(this._eventsManager);
            addHandler(this._eventsManager, {'dispatcherId': 'delete', 'listenerId': defaults.lisId});
            addHandler(this._eventsManager, {'dispatcherId': 'noDelete', 'listenerId': defaults.lisId});
            addHandler(this._eventsManager, {'dispatcherId': 'noDelete', 'listenerId': 'sdf'});
            killObject.call(this, defaults.lisId);
            expect(this._eventsManager._deleteObjectFromMap).toHaveBeenCalledWith(defaults.disId);
            expect(this._eventsManager._deleteObjectFromMap).toHaveBeenCalledWith(defaults.lisId);
            expect(this._eventsManager._deleteObjectFromMap).toHaveBeenCalledWith('delete');
            expect(this._eventsManager._deleteObjectFromMap).not.toHaveBeenCalledWith('noDelete');
            expect(this._eventsManager._deleteObjectFromMap).not.toHaveBeenCalledWith('sdf');
        });

        it("should remove native events", function(){
            var handler = function(){};
            var handler1 = function(){};
            var removeSpy = spyOn(this._eventsManager, '_removeNativeEvent');
            addHandler(this._eventsManager, { 'nativeHandler' : handler} );
            addHandler(this._eventsManager, {'handler': function(){}});
            addHandler(this._eventsManager, {'handler': function(){}, 'nativeHandler':  handler1});
            addHandler(this._eventsManager, { 'nativeHandler':  handler, 'type': 'ttt'});
            addHandler(this._eventsManager, { 'dispatcherId': 'ddd', 'listenerId': defaults.disId, nativeHandler: handler});
            killObject.call(this, defaults.disId);
            expect(removeSpy).toHaveBeenCalledWith('ddd', defaults.event, handler);
            expect(removeSpy).toHaveBeenCalledWith(defaults.disId, defaults.event, handler);
            expect(removeSpy).toHaveBeenCalledWith(defaults.disId, defaults.event, handler1);
            expect(removeSpy).toHaveBeenCalledWith(defaults.disId, defaults.event, undefined);
            expect(removeSpy).toHaveBeenCalledWith(defaults.disId, 'ttt', handler);
        });

    });

    describe("more general end to end leaks tests", function(){
        it("should delete the event entry when removing the listener object", function(){
            var handler = addHandler(this._eventsManager).handler;

            killObject.call(this, defaults.lisId);
            this._eventsManager.dispatchEvent(defaults.disId, defaults.event, {'a': 3});

            expect(handler).not.toHaveBeenCalled();
        });
    });

});