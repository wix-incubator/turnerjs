define.Class('bootstrap.managers.events.TimersHandler', function(classDefinition){
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

//can't put statics here, it will become fields, so _timerTypes is defined in EventDispatcherBase

    def.methods({
        initialize: function(){
            this.on('exterminating', this, this._clearAllTimers);
            this._timers = {};
        },
        setTimeout: function(functionToExecute, delay){
            var _delay = delay || 0;
            var wrappedFunction = this._getExecutingFunction(functionToExecute, this._timerTypes.timeout);
            var timerId = window.setTimeout(wrappedFunction, _delay);
            wrappedFunction.timerId = timerId;
            this._timers[timerId] = {
                'type': this._timerTypes.timeout,
                'isActive': true
            };
            return timerId;
        },

        setInterval: function(functionToExecute, interval){
            var wrappedFunction = this._getExecutingFunction(functionToExecute, this._timerTypes.interval);
            var timerId = window.setInterval(wrappedFunction, interval);
            wrappedFunction.timerId = timerId;
            this._timers[timerId] = {
                'type': this._timerTypes.interval,
                'isActive': true
            };
            return timerId;
        },
        isActiveTimer: function(timerId){
            return this._timers[timerId] && this._timers[timerId].isActive;
        },

        _getExecutingFunction: function(originalFunction, timerType){
            var that = this;
            return function(){
                //TODO: think if there is a better way
                var timerId = arguments.callee && arguments.callee.timerId;
                if(timerId && timerType == that._timerTypes.timeout && that._timers[timerId]){
                    that._timers[timerId].isActive = false;
                }
                originalFunction.call(that);
            };
        },

        _clearAllTimers: function(){
            Object.each(this._timers, function(timerData, timerId){
                timerId = Number(timerId);
                if(timerData.type == this._timerTypes.timeout){
                    window.clearTimeout(timerId);
                } else if(timerData.type == this._timerTypes.interval){
                    window.clearInterval(timerId);
                }
            }, this);
        }
    });
});
