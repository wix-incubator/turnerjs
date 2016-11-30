describe("EventDispatcherBase", function(){
    testRequire().classes('bootstrap.managers.events.EventDispatcherBase');

    beforeEach(function(){
        this._dis = new this.EventDispatcherBase();
        this._lis = new this.EventDispatcherBase();
        this._handler =  jasmine.createSpy('handler');
    });

    it("should call the handler on trigger", function(){
        this._dis.on('testEv', this._lis, this._handler);
        this._dis.trigger('testEv');
        expect(this._handler).toHaveBeenCalled();
    });

    it("should call the handler on trigger with listener as scope", function(){
        var self = this;
        var handler = jasmine.createSpy('handler1').andCallFake(function(){
            expect(this).toBe(self._lis);
        });
        this._dis.on('testEv', this._lis, handler);
        this._dis.trigger('testEv');
    });

    it("should remove the event when listener exterminated", function(){
        this._dis.on('testEv', this._lis, this._handler);
        this._lis.exterminate();
        this._dis.trigger('testEv');
        expect(this._handler).not.toHaveBeenCalled();
    });

    it("should remove the event when dispatcher exterminated", function(){
        this._dis.on('testEv', this._lis, this._handler);
        this._dis.exterminate();
        this._dis.trigger('testEv');
        expect(this._handler).not.toHaveBeenCalled();
    });

    it("should call the handler twice if triggered twice and registered with on", function(){
        this._dis.on('testEv', this._lis, this._handler);
        this._dis.trigger('testEv');
        this._dis.trigger('testEv');
        expect(this._handler).toHaveBeenCalledXTimes(2);
    });

    it("should call the handler oce if triggered twice and registered with once", function(){
        this._dis.once('testEv', this._lis, this._handler);
        this._dis.trigger('testEv');
        this._dis.trigger('testEv');
        expect(this._handler).toHaveBeenCalledXTimes(1);
    });


});