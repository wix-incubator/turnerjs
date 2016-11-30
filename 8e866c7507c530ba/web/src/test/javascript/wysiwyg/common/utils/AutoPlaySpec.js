describeExperiment({'NBC_SlideShowGallery':'New'}, "AutoPlay", function(){

    var autoPlayer;
    var mockTimeoutIndex;

    testRequire()
        .classes('wysiwyg.common.utils.AutoPlay')
        .resources('W.Utils');

    beforeEach(function() {
        this.autoPlayer = null;
        this.autoPlayer = new this.AutoPlay();
        this.mockTimeoutIndex = Math.round(Math.random() * 1000);

        spyOn(this.W.Utils, 'callLater').andReturn(this.mockTimeoutIndex);
        spyOn(this.W.Utils, 'clearCallLater');
    });

    describe("play()", function(){

        it("should change state to PLAY", function(){
            this.autoPlayer.pause();

            expect(this.autoPlayer._currentState).toBe(this.autoPlayer.AUTOPLAY_STATE.PAUSE);
        });

        it("should not call callLater if already playing", function(){
            this.autoPlayer.play();
            this.autoPlayer.play();

            expect(this.W.Utils.callLater).toHaveBeenCalledWith(this.autoPlayer._onTimer, null, this.autoPlayer, this.autoPlayer._delayTime);
            expect(this.W.Utils.callLater).toHaveBeenCalledXTimes(1);
        });

        it("should start callLater with the current delay if paused", function(){
            this.autoPlayer.pause();
            this.autoPlayer.play();

            expect(this.W.Utils.callLater).toHaveBeenCalledWith(this.autoPlayer._onTimer, null, this.autoPlayer, this.autoPlayer._delayTime);
        });

        it("should trigger play event when _onTimer is called", function(){
            var onTimerEvent = getSpy('onTimerEvent');
            this.autoPlayer.play();
            this.autoPlayer.on(this.autoPlayer.AUTOPLAY_EVENT, this, onTimerEvent);

            this.autoPlayer._onTimer();

            expect(onTimerEvent).toHaveBeenCalled();
        });

        it("should call another callLater with the _onTimer() with the current delay at _onTimer()", function(){
            this.autoPlayer.play();
            this.W.Utils.callLater.reset();

            this.autoPlayer._onTimer();

            expect(this.W.Utils.callLater).toHaveBeenCalledWith(this.autoPlayer._onTimer, null, this.autoPlayer, this.autoPlayer._delayTime);
            expect(this.W.Utils.callLater).toHaveBeenCalledXTimes(1);
        });

    });

    describe("pause()", function(){

        it("should change state to PAUSE", function(){
            this.autoPlayer.pause();

            expect(this.autoPlayer._currentState).toBe(this.autoPlayer.AUTOPLAY_STATE.PAUSE);
        });

        it("should clear the delay call later paused", function(){
            this.autoPlayer.play();
            this.autoPlayer.pause();

            expect(this.W.Utils.clearCallLater).toHaveBeenCalledWith(this.mockTimeoutIndex);
        });

    });

    describe("setDelay()", function(){

        it("should update delay time", function(){
            this.autoPlayer.setDelay(1000);

            expect(this.autoPlayer._delayTime).toBe(1000);
        });

    });

    describe("getAutoPlayState()", function(){

        it("should return the current playing state", function(){
            this.autoPlayer.play();

            var playState = this.autoPlayer.getAutoPlayState();

            expect(playState).toBe(this.autoPlayer._currentState);
        });

    });

});