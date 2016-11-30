describe("DispatchersToHandlersMap", function(){
    testRequire().classes('bootstrap.managers.events.DispatcherToHandlersMap');
    beforeEach(function(){
        this._dispatchersMapping = new this.DispatcherToHandlersMap();
    });

    function addHandler(dispatcher, params){
        params = params || {};
        var handler = params.handler || function(){};
        var listenerId = params.listenerId || 'listId';
        var eventType = params.type || 'testEv';
        var dispatcherId = params.dispatcherId || 'disId';
        return dispatcher.addHandler(dispatcherId, eventType, listenerId, handler, params.nativeHandler);
    }
    describe("addHandler", function(){
        it("should add first event listener to the object", function(){
            var handlerObject = addHandler(this._dispatchersMapping, {'dispatcherId': 'testD', 'type': 'testType'});
            var handlerObjects = this._dispatchersMapping.getHandlerObjects('testD', 'testType');
            expect(handlerObjects[0]).toBeEquivalentTo(handlerObject);
        });
        it("should add different handlerObjects to different event types", function(){
            var handlerObject1 = addHandler(this._dispatchersMapping, {'dispatcherId': 'testD', 'type': 'testType1'});
            var handlerObject2 = addHandler(this._dispatchersMapping, {'dispatcherId': 'testD', 'type': 'testType2'});
            var handlerObjects1 = this._dispatchersMapping.getHandlerObjects('testD', 'testType1');
            var handlerObjects2 = this._dispatchersMapping.getHandlerObjects('testD', 'testType2');
            expect(handlerObjects1.length).toBe(1);
            expect(handlerObjects2.length).toBe(1);
            expect(handlerObjects1[0]).toBeEquivalentTo(handlerObject1);
            expect(handlerObjects2[0]).toBeEquivalentTo(handlerObject2);
        });
        it("should add several handlerObjects to the same event type", function(){
            var handlerObject1 = addHandler(this._dispatchersMapping, {'dispatcherId': 'testD', 'type': 'testType'});
            var handlerObject2 = addHandler(this._dispatchersMapping, {'dispatcherId': 'testD', 'type': 'testType'});
            var handlerObjects = this._dispatchersMapping.getHandlerObjects('testD', 'testType');
            expect(handlerObjects.length).toBe(2);
            expect(handlerObjects[0]).toBeEquivalentTo(handlerObject1);
            expect(handlerObjects[1]).toBeEquivalentTo(handlerObject2);
        });
        it("should add the same listener object twice", function(){
            var foo = function(){};
            addHandler(this._dispatchersMapping, {'dispatcherId': 'testD', 'type': 'testType', 'handler': foo});
            addHandler(this._dispatchersMapping, {'dispatcherId': 'testD', 'type': 'testType', 'handler': foo});
            var handlerObjects = this._dispatchersMapping.getHandlerObjects('testD', 'testType');
            expect(handlerObjects.length).toBe(2);
        });
        it("should not add native event if such isn't passed", function(){
            var handlerObject = addHandler(this._dispatchersMapping, {'dispatcherId': 'testD', 'type': 'testType'});
            expect(handlerObject.nativeHandler).toBeUndefined();
        });
        it("should add the native event", function(){
            var nHandler = function(){};
            var handlerObject = addHandler(this._dispatchersMapping, {'dispatcherId': 'testD', 'type': 'testType', 'nativeHandler': nHandler});
            expect(handlerObject.nativeHandler).toBe(nHandler);
        });

    });

    describe("removeHandler", function(){
        it("should remove eventListener", function(){
            var foo = function(){};
            var handlerObject = addHandler(this._dispatchersMapping, {'dispatcherId': 'testD', 'type': 'testType', 'handler': foo, 'listenerId': 'lisId'});
            var removed = this._dispatchersMapping.removeHandler("testD", 'testType', 'lisId', foo);
            var handlerObjects = this._dispatchersMapping.getHandlerObjects('testD', 'testType');
            expect(handlerObjects.length).toBe(0);
            expect(removed).toBeEquivalentTo(handlerObject);
        });
        it("should do nothing if the listener objects does not exist", function(){
            var foo = function(){};
            addHandler(this._dispatchersMapping, {'dispatcherId': 'testD', 'type': 'testType', 'handler': foo, 'listenerId': 'lisId'});
            var removed = this._dispatchersMapping.removeHandler("testD", 'testType', 'lisIdgg', foo);
            var handlerObjects = this._dispatchersMapping.getHandlerObjects('testD', 'testType');
            expect(handlerObjects.length).toBe(1);
            expect(removed).toBeNull();
        });
        it("should do nothing if the event type does not exist", function(){
            var foo = function(){};
            addHandler(this._dispatchersMapping, {'dispatcherId': 'testD', 'type': 'testType', 'handler': foo, 'listenerId': 'lisId'});
            var removed = this._dispatchersMapping.removeHandler("testD", 'testTypeTTT', 'lisId', foo);
            var handlerObjects = this._dispatchersMapping.getHandlerObjects('testD', 'testType');
            expect(handlerObjects.length).toBe(1);
            expect(removed).toBeNull();
        });
    });

    describe("isHandlerRegistered", function(){
        it("should return true if handler registered", function(){
            var foo = function(){};
            addHandler(this._dispatchersMapping, {'dispatcherId': 'testD', 'type': 'testType', 'handler': foo, 'listenerId': 'lisId'});
            var isRegistered = this._dispatchersMapping.isHandlerRegistered('testD', 'testType', 'lisId', foo);
            expect(isRegistered).toBeTruthy();
        });
        it("should return false if no dispatcher", function(){
            var foo = function(){};
            addHandler(this._dispatchersMapping, {'dispatcherId': 'testD', 'type': 'testType', 'handler': foo, 'listenerId': 'lisId'});
            var isRegistered = this._dispatchersMapping.isHandlerRegistered('testDTTT', 'testType', 'lisId', foo);
            expect(isRegistered).toBeFalsy();
        });
        it("should return false if no event type", function(){
            var foo = function(){};
            addHandler(this._dispatchersMapping, {'dispatcherId': 'testD', 'type': 'testType', 'handler': foo, 'listenerId': 'lisId'});
            var isRegistered = this._dispatchersMapping.isHandlerRegistered('testD', 'testTypeTTT', 'lisId', foo);
            expect(isRegistered).toBeFalsy();
        });
        it("should return false if no listener", function(){
            var foo = function(){};
            addHandler(this._dispatchersMapping, {'dispatcherId': 'testD', 'type': 'testType', 'handler': foo, 'listenerId': 'lisId'});
            var isRegistered = this._dispatchersMapping.isHandlerRegistered('testDTTT', 'testType', 'lisIdTTT', foo);
            expect(isRegistered).toBeFalsy();
        });
        it("should return false if no handler", function(){
            var foo = function(){};
            addHandler(this._dispatchersMapping, {'dispatcherId': 'testD', 'type': 'testType', 'handler': foo, 'listenerId': 'lisId'});
            var isRegistered = this._dispatchersMapping.isHandlerRegistered('testDTTT', 'testType', 'lisId', function(){});
            expect(isRegistered).toBeFalsy();
        });
    });

    describe("removeListenerHandlers", function(){
        it("should do nothing if there are no handlers with listener", function(){
            addHandler(this._dispatchersMapping, {'dispatcherId': 'testD2'});
            addHandler(this._dispatchersMapping, {'dispatcherId': 'testD1'});
            var removed = this._dispatchersMapping.removeListenerHandlers('testD1', 'ddd');
            expect(this._dispatchersMapping.getAllHandlerObjectsForDispatcher('testD1').length).toBe(1);
            expect(this._dispatchersMapping.getAllHandlerObjectsForDispatcher('testD2').length).toBe(1);
            expect(removed).toBeEquivalentTo({'testEv': []});
        });
        it("should remove listener handlers and the entry if all the handlers for the dispatcher are in the listener", function(){
            var hObject1 = addHandler(this._dispatchersMapping, {'dispatcherId': 'testD', 'type': 'testType', 'listenerId': 'lisId'});
            var hObject2 = addHandler(this._dispatchersMapping, {'dispatcherId': 'testD', 'type': 'testType', 'listenerId': 'lisId'});
            var hObject3 = addHandler(this._dispatchersMapping, {'dispatcherId': 'testD', 'type': 'testType1', 'listenerId': 'lisId'});
            var removed = this._dispatchersMapping.removeListenerHandlers('testD', 'lisId');
            expect(this._dispatchersMapping.getAllHandlerObjectsForDispatcher('testD').length).toBe(0);
            expect(removed).toBeEquivalentTo({
                'testType': [hObject1, hObject2],
                'testType1': [hObject3]
            });

        });
        it("should remove only the listener handlers if there are other handlers for this dispatcher", function(){
            var hObject1 = addHandler(this._dispatchersMapping, {'dispatcherId': 'testD', 'type': 'testType', 'listenerId': 'lisId'});
            var hObject2 = addHandler(this._dispatchersMapping, {'dispatcherId': 'testD', 'type': 'testType', 'listenerId': 'lisIdTTT'});
            var hObject3 = addHandler(this._dispatchersMapping, {'dispatcherId': 'testD', 'type': 'testType1', 'listenerId': 'lisId'});
            var removed = this._dispatchersMapping.removeListenerHandlers('testD', 'lisId');
            expect(this._dispatchersMapping.getAllHandlerObjectsForDispatcher('testD').length).toBe(1);
            expect(removed).toBeEquivalentTo({
                'testType': [hObject1],
                'testType1': [hObject3]
            });
        });
    });
});