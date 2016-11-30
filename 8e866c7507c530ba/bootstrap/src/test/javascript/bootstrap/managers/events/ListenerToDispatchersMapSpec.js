describe("ListenerToDispatchersMap", function(){
    testRequire().classes('bootstrap.managers.events.ListenerToDispatchersMap');
    beforeEach(function(){
        this._listenersMapping = new this.ListenerToDispatchersMap();
    });
    afterEach(function(){

    });

    describe("addHandler", function(){
        it("should add one handler", function(){
            this._listenersMapping.addHandler('lisId', 'disId');
            var dispatchers = this._listenersMapping.getAllDispatcherIdsForListener('lisId');
            expect(dispatchers.length).toBe(1);
        });
        it("should add 2 handlers for different dispatchers", function(){
            this._listenersMapping.addHandler('lisId', 'disId1');
            this._listenersMapping.addHandler('lisId', 'disId2');
            var dispatchers = this._listenersMapping.getAllDispatcherIdsForListener('lisId');
            expect(dispatchers.length).toBe(2);
        });
        it("should add 2 handlers to same dispatcher", function(){
            this._listenersMapping.addHandler('lisId', 'disId');
            this._listenersMapping.addHandler('lisId', 'disId');
            var dispatchers = this._listenersMapping.getAllDispatcherIdsForListener('lisId');
            expect(dispatchers.length).toBe(1);
        });
        it("should add 2 handlers to different listeners", function(){
            this._listenersMapping.addHandler('lisId1', 'disId');
            this._listenersMapping.addHandler('lisId2', 'disId');
            var dispatchers1 = this._listenersMapping.getAllDispatcherIdsForListener('lisId1');
            var dispatchers2 = this._listenersMapping.getAllDispatcherIdsForListener('lisId2');
            expect(dispatchers1.length).toBe(1);
            expect(dispatchers2.length).toBe(1);
        });
    });
    describe("removeHandler", function(){
        it("should do nothing if map is empty", function(){
            this._listenersMapping.removeHandler('lisId', 'disId');
            var dispatchers = this._listenersMapping.getAllDispatcherIdsForListener('lisId');
            expect(dispatchers.length).toBe(0);
        });
        it("should do nothing if no such listener", function(){
            this._listenersMapping.addHandler('lisId', 'disId');
            this._listenersMapping.removeHandler('lisId1', 'disId');
            var dispatchers = this._listenersMapping.getAllDispatcherIdsForListener('lisId');
            expect(dispatchers.length).toBe(1);
        });
        it("should do nothing if no such dispatcher", function(){
            this._listenersMapping.addHandler('lisId', 'disId');
            this._listenersMapping.removeHandler('lisId', 'disId1');
            var dispatchers = this._listenersMapping.getAllDispatcherIdsForListener('lisId');
            expect(dispatchers.length).toBe(1);
        });
        it("should remove dispatcher entry if the only handler for that listener + dispatcher removed", function(){
            this._listenersMapping.addHandler('lisId', 'disId');
            this._listenersMapping.removeHandler('lisId', 'disId');
            var dispatchers = this._listenersMapping.getAllDispatcherIdsForListener('lisId');
            expect(dispatchers.length).toBe(0);
        });
        it("should not remove dispatcher entry if there are more handlers for that listener + dispatcher", function(){
            this._listenersMapping.addHandler('lisId', 'disId');
            this._listenersMapping.addHandler('lisId', 'disId');

            this._listenersMapping.removeHandler('lisId', 'disId');
            
            var dispatchers = this._listenersMapping.getAllDispatcherIdsForListener('lisId');
            expect(dispatchers.length).toBe(1);
        });
        it("should not change other entries", function(){
            this._listenersMapping.addHandler('lisId', 'disId');
            this._listenersMapping.addHandler('lisId', 'disId1');

            this._listenersMapping.removeHandler('lisId', 'disId1');

            var dispatchers = this._listenersMapping.getAllDispatcherIdsForListener('lisId');
            expect(dispatchers.length).toBe(1);
            expect(dispatchers[0]).toBe('disId');
        });
        it("should remove entry if there were 2 handlers after 2 removes", function(){
            this._listenersMapping.addHandler('lisId', 'disId');
            this._listenersMapping.addHandler('lisId', 'disId');

            this._listenersMapping.removeHandler('lisId', 'disId');
            this._listenersMapping.removeHandler('lisId', 'disId');

            var dispatchers = this._listenersMapping.getAllDispatcherIdsForListener('lisId');
            expect(dispatchers.length).toBe(0);
        });
    });

    describe("removeListenerHandlers", function(){
        it("should remove only the specified listener handlers", function(){
            this._listenersMapping.addHandler('lisId', 'disId');
            this._listenersMapping.addHandler('lisId', 'disId1');
            this._listenersMapping.addHandler('lisId1', 'disId1');
            var dispatchers = this._listenersMapping.getAllDispatcherIdsForListener('lisId');
            expect(dispatchers.length).toBe(2);

            this._listenersMapping.removeListenerHandlers('lisId', 'disId');

            dispatchers = this._listenersMapping.getAllDispatcherIdsForListener('lisId');
            expect(dispatchers.length).toBe(1);
            var dispatchers1 = this._listenersMapping.getAllDispatcherIdsForListener('lisId1');
            expect(dispatchers1.length).toBe(1);
        });

        it("should do nothing if there are no handlers for this listener and dispatcher", function(){
            this._listenersMapping.addHandler('lisId', 'disId1');
             var dispatchers = this._listenersMapping.getAllDispatcherIdsForListener('lisId');
            expect(dispatchers.length).toBe(1);

            this._listenersMapping.removeListenerHandlers('lisId', 'disId');
            dispatchers = this._listenersMapping.getAllDispatcherIdsForListener('lisId');
            expect(dispatchers.length).toBe(1);
        });

        it("should do nothing if there are no handlers for the specified listener at all", function(){
            this._listenersMapping.removeListenerHandlers('lisId', 'disId');

             var dispatchers = this._listenersMapping.getAllDispatcherIdsForListener('lisId');
            expect(dispatchers.length).toBe(0);
        });
    });
});