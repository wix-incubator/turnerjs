describe("Tween", function() {
    var checkValues = function (log, sampleValues, valuePrecision) {
        var i;

        var valueDiff = function(index, value) {
            return Math.abs(log[index][1]/1000 - value);
        };

        var isClosestPoint = function (index, t) {
            if(index == log.length-1) {
                return true;
            }

            return (valueDiff(index, t) < valueDiff(index+1, t));
        };

        var checkValue = function (value) {
            var i;
            for(i=0; i<log.length; i++) {
                if(isClosestPoint(i, value[0])) {
                    var valueDiff = Math.abs(log[i][2] - value[1]);
                    expect(valueDiff).toBeLessThan(valuePrecision);
                    return;
                }
            }
        };

        for(i=0; i<sampleValues.length; i++) {
            checkValue(sampleValues[i]);
        }
        return true;
    };

    var fakeRequestAnimFrame = function (callback) {
       this._fakeTime += 16; // simulate 16 ms (60 fps) framerate
        callback();
    };

    var fakeCurrentTime = function () {
       return this._fakeTime;
   };

    var fakeTimeout = function (callback, timeout) {
        this._fakeTime += timeout;
        callback();
    };

    beforeEach(function () {
       this._oldRequestAnimFrame = window.requestAnimFrame;
       window.requestAnimFrame = fakeRequestAnimFrame.bind(this);

       this._oldTimeout = window.setTimeout;
       window.setTimeout = fakeTimeout.bind(this);

       this._oldGetCurrentTime = W.Utils.Tween.prototype._getCurrentTime;
       this._fakeTime = 0;
       W.Utils.Tween.prototype._getCurrentTime = fakeCurrentTime.bind(this);
    });

    afterEach(function () {
        window.requestAnimFrame = this._oldRequestAnimFrame;
        W.Utils.Tween.prototype._getCurrentTime = this._oldGetCurrentTime;
        window.setTimeout = this._oldTimeout;
    });

    it("Tests basic tweening", function () {
        var testObj = { a : 0.0 };
        var valueLog = [];
        W.Utils.Tween.debugMode = true;
        W.Utils.Tween.log = function () {
            valueLog.push(arguments);
        };
        var testFinished = false;
        new W.Utils.Tween(testObj, 1.0, { a:5.0, onComplete: function () {
            expect(testObj.a).toBe(5.0);
            expect(valueLog.length > 3);
            checkValues(valueLog, [[0.25, 1.25], [0.5, 2.5], [0.75, 3.75], [1.0, 5.0]], 0.11 );
            testFinished = true;
        }});

        waitsFor(function () { return testFinished; }, 1500);
    });

    it("Tests negative tweening", function () {
        var testObj = { a : 5.0 };
        var valueLog = [];
        W.Utils.Tween.debugMode = true;
        W.Utils.Tween.log = function () {
            valueLog.push(arguments);
        };
        var testFinished = false;
        new W.Utils.Tween(testObj, 1.0, { a:-5.0, onComplete: function () {
            expect(testObj.a).toBe(-5.0);
            expect(valueLog.length > 3);
            checkValues(valueLog, [[0.25, 2.5], [0.5, 0.0], [0.75, -2.5], [1.0, -5.0]], 0.1 );
            testFinished = true;
        }});

        waitsFor(function () { return testFinished; }, 1500);
    });

    it("Tests negative tweening with strong ease", function () {
        var testObj = { a : 0.0 };
        var valueLog = [];
        W.Utils.Tween.debugMode = true;
        W.Utils.Tween.log = function () {
            valueLog.push(arguments);
        };
        var testFinished = false;
        new W.Utils.Tween(testObj, 1.0, { a:5.0, ease:"strong_easeIn", onComplete: function () {
            expect(testObj.a).toBe(5.0);
            expect(valueLog.length > 3);
            checkValues(valueLog, [[0.25, 0.005], [0.5, 0.16], [0.75, 1.13], [0.9, 3.0], [1.0, 5.0]], 0.2 );
            testFinished = true;
        }});

        waitsFor(function () { return testFinished; }, 1500);
    });

    it("Tests tweening of multiple properties", function () {
        var testObj = { a : 0.0, b:5.0, c:-5.0 };
        var testFinished = false;
        new W.Utils.Tween(testObj, 1.0, { a:5.0, b:-5.0, c:10.0, onComplete: function () {
            expect(testObj.a).toBe(5.0);
            expect(testObj.b).toBe(-5.0);
            expect(testObj.c).toBe(10.0);
            testFinished = true;
        }});

        waitsFor(function () { return testFinished; }, 1500);
    });

    it("Tests tweening with delay", function () {
        // delay is here to test that Tween sees it as a parameter, not a property
        var testObj = { a : 0.0, delay:0.0 };
        var testFinished = false;
        var t0 = this._fakeTime;
        new W.Utils.Tween(testObj, 1.0, { a:5.0, delay:0.5, onComplete: function () {
            var t1 = this._fakeTime;
            var elapsedTime = t1-t0;
            expect(Math.abs(elapsedTime-1500)).toBeLessThan(250);
            expect(testObj.a).toBe(5.0);
            expect(testObj.delay).toBe(0.0);
            testFinished = true;
        }.bind(this) });

        waitsFor(function () { return testFinished; }, 3000);
    });
});