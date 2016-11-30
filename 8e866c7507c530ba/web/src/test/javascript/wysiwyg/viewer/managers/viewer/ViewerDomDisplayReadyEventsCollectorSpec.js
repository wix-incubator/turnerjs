xdescribe("ViewerDomDisplayReadyEventsCollector", function(){
    testRequire().classes('wysiwyg.viewer.managers.viewer.ViewerDomDisplayReadyEventsCollector', 'mobile.core.components.base.BaseComponent');
    var asyncSpec =  new AsyncSpec(this);

    beforeEach(function(){
        this._handler = new this.ViewerDomDisplayReadyEventsCollector(undefined, function(node){});
    });

    describe("_waitForDomDisplayReady", function(){
        beforeEach( function(){
            this._mockComps = [];
            var playGround = getPlayGround();
            for(var i = 0; i < 2; i++){
                var el = new Element('div');
                el.$logic = new this.BaseComponent(i, el);
                playGround.adopt(el);
                this._mockComps.push(el);
            }
        });
        asyncSpec.it("should return if all comps already dom display ready", function(done){
            _.forEach(this._mockComps, function(comp){
                comp.$logic.isReadyForDomDisplay = function(){
                    return true;
                }
            });
            this._handler._waitForDomDisplayReady(200).then(function(){
                done();
            });
        });
        asyncSpec.it("should return if all comps aren't dom display ready", function(done){
            this._handler._waitForDomDisplayReady(200).then(function(){
                done();
            });
            _.forEach(this._mockComps, function(comp){
                setTimeout(function(){
                    comp.fireEvent(Constants.ComponentEvents.DOM_DISPLAY_READY);
                },1);
            });
        });
        asyncSpec.it("should return if part of the comps dom display ready", function(done){
            this._mockComps[1].$logic.isReadyForDomDisplay = function(){
                return true;
            };
            this._handler._waitForDomDisplayReady(200).then(function(){
                done();
            });
            _.forEach(this._mockComps, function(comp){
                setTimeout(function(){
                    comp.fireEvent(Constants.ComponentEvents.DOM_DISPLAY_READY);
                },1);
            });
        });
        asyncSpec.it("should return if there are no components", function(done){
            clearPlayGround();
            this._handler._waitForDomDisplayReady(200).then(function(){
                done();
            });
        });
    });
});