/**
 * @fileOverview Post Message Service
 *
 * "message" is reserved event type for circumstances when not an Object received.
 * So if you need to listen to a non-standard message and you sure that JSON.parse will not be able to parse received data, use
 *  this.on('message', function(e){
 *      console.log(e.rawEvent);
 *  });
 * But note that in this case you will not be able to use connectionID (so don't even  set it, because it won't work)
 * */

/**
 * Post Message Service
 * @class PMS
 *
 * @param {Object} sets - settings
 * @constructor
 */
var PMS = function(sets){
    this.set(sets);
    this._callbacks = {};
    this._listen();
};

/**
 * Set PMS settings
 *
 * @param {Object} sets - settings
 * @param {Window} sets.targetWindow - target window object (e.g. iframe.contentWindow, window.parent)
 * @param {string} [sets.connectionID] - unique ID of the current connection to filter messages from target window
 * @param {string} [sets.targetOrigin] - representing the origin of the targetWindow where event must be dispatched
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window.postMessage
 */
PMS.prototype.set = function(sets){
    sets = sets || {};
    this._targetWindow = sets.targetWindow;
    this._targetOrigin = sets.targetOrigin || '*';
    this._connectionID = sets.connectionID || null;
};

/**
 * Triggering an event in the target window
 *
 * @param {string} type - event name to be dispatched in the target window
 * @param {Object} [data] - data to be sent to the target window
 */
PMS.prototype.send = function(type, data){
    data = data || null;

    var message;

    if (typeof data === 'object'){
        message = {
            connectionID: this._connectionID,
            data: data,
            type: type
        };
        this._targetWindow.postMessage(JSON.stringify(message), this._targetOrigin);
    } else{
        throw new TypeError('incorrect data type. Should be an Object');
    }
};

/**
 * Triggering a native (RAW) postMessage in the target window with message of any type
 *
 * @param message - message of any type which can be JSON.stringified
 * */
PMS.prototype.sendRAW = function(message){
    message = message || null;

    this._targetWindow.postMessage(JSON.stringify(message), this._targetOrigin);
};

/**
 * Check if postMessage source is from expected window
 *
 * @param {Event} e - event object from the target window
 * @private
 */
PMS.prototype._receive = function(e){
    if (e.source === this._targetWindow){
        this._processMessage(e.data);
    }
};

/**
 * Process the data received with post message
 *
 * @param {string} postJSON - JSON encoded string like "{
  *                                                      "data": "data",
  *                                                      "type": "type"
  *                                                    }"
 * @private
 */
PMS.prototype._processMessage = function(postJSON){
    var parsed, rawEvent, type, data;

    try {
        parsed = JSON.parse(postJSON);
        type = parsed.type;
        data = parsed.data;
        rawEvent = parsed;
    } catch(ex){ // if there was not an Object sent
        rawEvent = postJSON;
        type = 'message';
        data = null;
    }

    if (!this._connectionID || this._connectionID === parsed.connectionID){
        this.trigger(type, data, rawEvent);
    }
};

/**
 * Listen to the native postMessage event
 *
 * @private
 */
PMS.prototype._listen = function(){
    window.addEventListener('message', this._receive.bind(this), false);
};

/**
 * Binds callback to the event
 *
 * @param {string} type - event name to listen to (there can be several types provided that should be divided by spaces and commas)
 * @param {Function} callback - callback to be called
 * @param {Object} [context] - context for calling the callback
 * @param {Boolean} [_once] - denoting to fire callback only once
 */
PMS.prototype.on = function(type, callback, context, _once){
    context = context || null;
    _once = _once || false;

    var typeArr, eName,
        splitRegExp = /[^,\s]+/g;

    while ((typeArr = splitRegExp.exec(type))){
        eName = typeArr[0];
        this._callbacks[eName] = this._callbacks[eName] || [];

        this._callbacks[eName].push({
            callback: callback,
            context: context,
            once: _once
        });
    }
};

/**
 * Binds callback to the event only once
 *
 * @param {string} type - event name to listen to (there can be several types provided that should be divided by spaces and commas)
 * @param {Function} callback - callback to be called
 * @param {Object} [context] - context for calling the callback
 */
PMS.prototype.once = function(type, callback, context){
    context = context || null;

    this.on(type, callback, context, true);
};

/**
 * Triggers an event in this window
 *
 * @param {string} type - event name to be dispatched (there can be several types provided that should be divided by spaces and commas)
 * @param {Object} [data] - event data
 * @param {*} [rawEvent] - RAW event
 */
PMS.prototype.trigger = function(type, data, rawEvent){
    data = data || null;
    rawEvent = rawEvent || null;

    var typeArr, eName, callbacks, e, all,
        splitRegExp = /[^,\s]+/g; //it can't be saved in the PMS prototype because that property will became a link to the RegEx instance. And the RegEx instance has a lastIndex pointer which shouldn't be changing from different places, because this can result to an infinite loop.

    while ((typeArr = splitRegExp.exec(type))){
        eName = typeArr[0];
        all = this._callbacks.all;
        callbacks = this._callbacks[eName];
        e = new InternalEvent({
            type: eName,
            data: data,
            rawEvent: rawEvent
        });

        if (callbacks){
            if (all){
                callbacks.push(all);
            }

            this._fire(e, callbacks);
        }
    }
};

/**
 * Executes the callback
 *
 * @param {InternalEvent} e - internal event to be dispatched
 * @param {Array} callbacks - callbacks to fire
 * @private
 */
PMS.prototype._fire = function(e, callbacks){
    callbacks.forEach(function(item){
        var context = item.context;

        if (!context){
            item.callback(e);
        } else{
            item.callback.call(context, e);
        }

        if (item.once){
            this._offCallback(item.type, item.callback);
        }
    }, this);
};

/**
 * Removes event listeners
 *
 * @param {string} [type] - event name to stop listen to
 * @param {Function} [callback] - callback to be removed from listening stack
 */
PMS.prototype.off = function(type, callback){
    type = type || null;
    callback = callback || null;

    var typeArr, eName,
        offMethod = '_off',
        splitRegExp = /[^,\s]+/g;

    if (!type){
        this._callbacks = {};
    } else{
        if (callback){
            offMethod = '_offCallback';
        } else{
            offMethod = '_off';
        }

        while ((typeArr =splitRegExp.exec(type))){
            eName = typeArr[0];

            this[offMethod](eName, callback);
        }
    }
};

/**
 * Removes all event listeners of the provided type
 *
 * @param {string} type - event name to stop listen to
 * @private
 */
PMS.prototype._off = function(type){
    delete this._callbacks[type];
};

/**
 * Removes certain event listener
 *
 * @param {string} type - event name to stop listen to (there can be several types provided that should be divided by spaces and commas)
 * @param {Function} callback - callback to be removed from listening stack
 * @private
 */
PMS.prototype._offCallback = function(type, callback){
    var callbacks = this._callbacks[type];

    if (callbacks){
        callbacks.some(function(clbk, i){
            return !!(callback === clbk && callbacks.splice(i, 1));
        });
    }
};


/**
 * Internal Event
 * @class InternalEvent
 *
 * @param {Object} sets - event settings
 * @param {string} sets.type - event type
 * @param {*} sets.data - event data
 * @param {*} sets.rawEvent - RAW event object or data
 * @constructor
 */
var InternalEvent = function(sets){
    this.type = sets.type;
    this.data = sets.data;
    this.rawEvent = sets.rawEvent;
};

window.PMS = PMS;