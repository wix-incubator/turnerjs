define.Class('bootstrap.utils.BufferFunction', function (classDefinition) {
    /*@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.binds(['_wrapperFunction']);

    def.methods({
        initialize: function (scope, functionName) {
            this._isFirstCallDelayed = false;
            this._bufferTime = 1000;
            this._lastCallArguments;

            this._replaceFunctionAndSaveOriginal(scope, functionName);
            this._clearBuffer();
        },

        setBufferTime: function (time) {
            this._bufferTime = time;
        },

        getBufferTime: function (time) {
            return this._bufferTime;
        },

        setIsFirstCallDelayed: function (isDelayed) {
            this._isFirstCallDelayed = isDelayed;
        },

        getIsFirstCallDelayed: function (time) {
            return this._isFirstCallDelayed;
        },

        _replaceFunctionAndSaveOriginal: function (scope, functionName) {
            this._scope = scope;
            this._originalFunction = scope[functionName];
            scope[functionName] = this._wrapperFunction;
        },

        _wrapperFunction: function () {
            this._lastCallArguments = arguments;
            this._tryCallingFunction();
        },

        _tryCallingFunction: function () {
            if (this.isReadyToCall()) {
                this.callOriginalFunction();
                this._delayCall(this._clearBuffer);
            } else {
                this._delayCall(this._clearBufferAndTryCallingFunction);
            }
        },

        callOriginalFunction: function () {
            this._originalFunction.apply(this._scope, this._lastCallArguments);
        },

        isReadyToCall: function () {
            return (!this._callTimerId && this._isFirstCallDelayed === false);
        },

        _clearBuffer: function () {
            this._callTimerId = undefined;
        },

        _clearBufferAndTryCallingFunction: function () {
            this._clearBuffer();
            this._tryCallingFunction();
        },

        _delayCall: function (callback) {
            this.injects().Utils.clearCallLater(this._callTimerId);
            this._callTimerId = this.injects().Utils.callLater(callback, [], this, this._bufferTime);
        }
    });
});

