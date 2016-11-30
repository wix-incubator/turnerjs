define.bootstrapClass('bootstrap.utils.async.Async', function() {

    var WClass = define.getBootstrapClass('bootstrap.bootstrap.WClass');

    /**
     * User: omri
     * Date: 1/19/11
     * Time: 3:23 PM
     **/
    var Async = new WClass({
        className: 'Async',
        initialize: function() {

        }
    });

    /**
     * Async.Bulk class
     * @class Async.Bulk
     */
    Async.Bulk = new WClass(/** @lends Async.Bulk */{
        className: 'Async.Bulk',
        _fields_: {
            _traits_: [Options, Events],
            _binds_: ['run'],
            options: {
                // the event to wait for before moving on {string or an array of strings}
                completeEvent: "complete",
                // event type that counts as a failure {string or an array of strings}
                errorEvent: "error",
                // an alternative way to listen to 'complete' event
                completeCallback: null,
                // an alternative way to listen to 'error' event
                errorCallback: null,
                // run all targets at once (if false, run them as a chain)
                parallel: true,
                // an array of special cases. omit any property you don't want to override.
                // note: if the same target is added more then once, only the first instance is used.
                specialTargets: [
                    // sample special case
                    {target:null, method:null, completeEvent:null, errorEvent:null}
                ],
                // false: run immediately, true/negative number: don't run (use run method), positive number: delay in milisecs
                executeDelay: false,
                // if true, the bulk data and event listeners are not removed when the bulk stops
                keepAlive: false,
                // if false, an error event wis never fired, and the bulk is complete when all targets complete or fail
                stopOnErrors: true,
                //if supplied the operation will timeout after a given interval and report to the console the pending objects
                timeout: 0
            }
        },

        /**
         * Runs a function on a bulk of targets
         * @constructor
         * @param targets {Elements}{Array} targets list
         * @param method {function}{string} a function to run.<li> if a function, it will be applied on each target</li><li> if a string, target[x][fn]() is called</li>
         * @param options
         * @member Async.Bulk
         */

        _methods_: {
            initialize: function(targets, method, options) {
                this._method = null;
                this._pending = [];
                this._running = false;
                this._error = [];
                this._complete = [];
                this._done = [];
                // fail for invalid targets
                if (!targets || targets.length === undefined) {
                    LOG.reportError(wixErrors.BULK_INVALID_TARGET, "Async.Bulk", 'initialize', targets)();
                    return this;
                }

                this.$events = {};

                this.setOptions(options);

                this._targets = targets;
                this._method = method;

                var bulkScope = this;
                // stupid IE 8 workaround: setTimeout !== window.setTimeout, hens, window.setTimeout is used to allow spies on setTimeout
                var w = window;

                //set timeout
                if (this.options.timeout > 0) {
                    this._timeoutInterval = w.setTimeout(this._bulkOperationTimeout.bind(this), this.options.timeout);
                }

                this._onTargetComplete = function() {
                    this.removeEvent(bulkScope._getTargetDetails(this).completeEvent, bulkScope._onTargetComplete);
                    bulkScope._pending.erase(this);
                    bulkScope._complete.push(this);
                    bulkScope._done.push(this);
                    bulkScope._checkProgress();
                };
                this._onTargetFailed = function() {
                    this.removeEvent(bulkScope._getTargetDetails(this).errorEvent, bulkScope._onTargetFailed);
                    bulkScope._pending.erase(this);
                    bulkScope._error.push(this);
                    bulkScope._done.push(this);
                    bulkScope._checkProgress();
                };
                if (!this.options.executeDelay) {
                    this.run();
                } else {
                    if (instanceOf(this.options.executeDelay, Number) && this.options.executeDelay > 0) {
                        w.setTimeout(this.run, this.options.executeDelay);
                    }
                }
            },

            _bulkOperationTimeout: function() {
                LOG.reportError(wixErrors.BULK_TIMEOUT, "Async.Bulk", "_bulkOperationTimeout", String(this.options.timeout) + " ms | Pending Operations:" + this._pending)();
            },

            /**
             * Start/resume bulk
             * @member Async.Bulk
             */
            run: function() {
                // nothing to do
                if (this._targets.length !== undefined && this._targets.length !== null && this._targets.length === 0) {
                    this._clearInterval();
                    this._handleBulkComplete();
                    return;
                }

                this._targets.each(function(element, index) {
                    this._addToQue(element, index);
                }, this);

                if (this.options.parallel) {
                    this._targets.each(this._runMethodOnTarget, this);
                }
                else { // Not Parallel
                    this._runNextTarget();
                }
            },

            _runNextTarget: function() {
                var currentTargetIndex = this._targets.length - this._pending.length;
                var currentTarget = this._targets[ currentTargetIndex ];
                this._runMethodOnTarget.apply(this, [currentTarget] );
            },

            _clearInterval:function () {
                if (this._timeoutInterval) {
                    clearInterval(this._timeoutInterval);
                    delete this._timeoutInterval;
                }
            },


            /**
             * run "method" on a single target
             * @param element
             */
            _runMethodOnTarget: function(element) {
                // if "method" param is a function, apply it on the target scope
                if (instanceOf(this._method, Function)) {
                    this._method.call(element);
                }
                // if "method" param is a string, call that method (if it exists)
                if (instanceOf(this._method, String)) {
                    if (instanceOf(element[this._method], Function)) {
                        element[this._method].call(element);
                    } else {
                        LOG.reportError(wixErrors.BULK_NO_METHOD, 'Async.Bulk', '_runMethodOnTarget', element)();
                    }
                }
            },
            /**
             * Stop/suspend the bulk execution
             * @param {boolean} destroy  if true, the bulk is destroyed
             */
            stop: function(destroy) {

            },
            /**
             * destroy the bulk: remove event listeners, nullify references etc
             */
            destroy: function() {
                if (this._targets) {
                    this._targets.each(function(element) {
                        element.removeEvent(this._getTargetDetails(this).completeEvent, this._onTargetComplete);
                        element.removeEvent(this._getTargetDetails(this).errorEvent, this._onTargetFailed);
                    }, this);
                }
                this._targets = null;
            },
            /**
             * return an object: {complete: completedTasksArray, errors: failedTasksArray, total: ...}
             */
            progress: function() {
                return {
                    complete: this._complete.slice(),
                    error:this._error.slice(),
                    total: this._targets.slice()
                };
            },
            /**
             * adds a target to the pending que
             * @param target
             */
            _addToQue: function(target, index) {
                var details = this._getTargetDetails(target);
                this._pending[index] = target;
                target.addEvent(details.completeEvent, this._onTargetComplete);
                target.addEvent(details.errorEvent, this._onTargetFailed);
            },
            /**
             * defined in class constructor
             */
            _onTargetComplete: undefined,
            /**
             * defined in class constructor
             */
            _onTargetFailed: undefined,
            /**
             * return an object with the target's details: method, completeEvent, errorEvent
             * @param target
             */
            _getTargetDetails:    function(target) {
                var i;
                var l;
                var defaults = {
                    method:this._method,
                    completeEvent: this.options.completeEvent,
                    errorEvent: this.options.errorEvent
                };
                for (i = 0,l = this.options.specialTargets.length; i < l; i++) {
                    if (this.options.specialTargets[i].target === target) {
                        return this.options.specialTargets[i].target.implement(defaults);
                    }
                }
                return defaults;
            },
            /**
             * handle a change in bulk status (complete/error of any of the targets)
             */
            _checkProgress: function() {
                if (this._pending.length > 0) {
                    if (!this.options.parallel) {
                        this._runNextTarget();
                    }
                } else {
                    if (this.options.stopOnErrors && this._error.length > 0) {
                        this._handleBulkError();
                    } else {
                        this._handleBulkComplete();
                    }
                    this._clearInterval();
                    if (!this.options.keepAlive) {
                        this.destroy();
                    }
                }
            },

            /**
             * dispatches a error event and callback
             * @param {Boolean} noDelay if true, fires event immediately, otherwise the action is delayed in order to release the thread
             */
            _handleBulkError:function (noDelay) {
                if (noDelay) {
                    this.fireEvent('error', [this._complete, this._error]);
                    if (instanceOf(this.options.errorCallback, Function)) {
                        this.options.errorCallback(this._complete, this._error);
                    }
                } else {
                    window.setTimeout(this._handleBulkError.bind(this, true), 1);
                }
            },


            /**
             * dispatches a complete event and callback
             * @param {Boolean} noDelay if true, fires event immediately, otherwise the action is delayed in order to release the thread
             */
            _handleBulkComplete: function(noDelay) {
                if (noDelay) {
                    this.fireEvent('complete', [this._complete, this._error]);
                    if (instanceOf(this.options.completeCallback, Function)) {
                        this.options.completeCallback(this._complete, this._error);
                    }
                } else {
                    window.setTimeout(this._handleBulkComplete.bind(this, true), 1);
                }
            },

            setOptions: function(){
                var options = this.options = Object.merge.apply(null, [{}, this.options].append(arguments));
                if (!this.addEvent) {
                    return this;
                }
                for (var option in options){
                    if (typeOf(options[option]) != 'function' || !(/^on[A-Z]/).test(option)) {
                        continue;
                    }
                    this.addEvent(option, options[option]);
                    delete options[option];
                }
                return this;
            },

            fireEvent: function (type, args, delay) {
                if (this.$events) {
                    type = this._removeOn(type);
                    var events = this.$events[type];
                    if (!events) {
                        return this;
                    }
                    args = Array.from(args);
                    var localEvents = events.clone();
                    localEvents.each(function (fn) {
                        if (!fn) {
                            return;
                        }
                        if (delay) {
                            fn.delay(delay, this, args);
                        }
                        else {
                            fn.apply(this, args);
                        }
                    }, this);
                }
                return this;
            },

            addEvent: function(type, fn){
                type = this._removeOn(type);

                this.$events = this.$events || {};
                this.$events[type] = (this.$events[type] || []).include(fn);
                return this;
            },

            _removeOn: function(string){
                return string.replace(/^on([A-Z])/, function(full, first){
                    return first.toLowerCase();
                });
            }

        }

    });

    return Async;
});
