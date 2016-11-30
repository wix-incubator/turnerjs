(function(container){

    var _w = {

        Indent: {
            TPA_RESPONSE: 'TPA_RESPONSE',
            TPA: "TPA2",
            COMPONENT: "ComponentScript",
            TRIGGER_EVENT: 'TriggerEvent',
            RUN_SCRIPT: 'Run_Script',
            GET_COMPONENT: 'GET_COMPONENT'
        },


        workerId: null,
        globals: {},
        eventCallbacks: [],
        callbacks: [],
        callbackId: 0,
        components: [],


        init: function(){
            this.globals = typeof wix_sdk_globals !== "undefined" ? wix_sdk_globals : {};

            _w.workerId = this.isWorkerMode() ? this.globals.workerId || "[UNKNOWN]"
                : _w.getQueryParameter("workerId") || "[UNKNOWN]";

            this.bindEvents();
        },

        isWorkerMode: function(){
            return typeof window === "undefined" || this.globals.workerMode;
        },

        getCallbackId: function(){
            return _w.callbackId++;
        },

        bindEvents: function(){
            if(this.isWorkerMode()) {
                onmessage = this.handleMessage.bind(this);
            } else {
                window.addEventListener ? window.addEventListener('message', this.handleMessage.bind(this), false)
                    : window.attachEvent('onmessage', this.handleMessage.bind(this));
            }
        },

        handleMessage: function(event){
            var data = null;

            try {
                data = JSON.parse(event.data);
            } catch (e) {
                return;
            }

            if(data && data.workerId == this.workerId) {
                switch (data.intent) {
                    case this.Indent.TPA_RESPONSE:

                        this.handleCallbackMessage(data.callId, data.res);

                        break;
                    case this.Indent.TRIGGER_EVENT:

                        this.handleTrigger(data.eventType, data.compId);

                        break;
                    case this.Indent.RUN_SCRIPT:

                        this.handleRunScript(data.compId, data.script, data.compData);

                        break;
                    case this.Indent.GET_COMPONENT:
                        this.handleGetComponent(data.compId, data.compData, data.callId)

                        break;

                }
            }
        },
        handleGetComponent: function(compId, compData, callId){
            var comp = this.getComponent(compId,compData);


            this.handleCallbackMessage(callId, comp);

        },

        handleCallbackMessage: function(callbackId, args){

            var callback = this.callbacks[callbackId];

            if(callback) {
                callback(args);
                delete this.callbacks[callbackId];
            }
        },

        handleTrigger: function(eventType, compId, params){
            var callbacks = this.eventCallbacks[eventType];

            if(compId && callbacks) {
                callbacks = callbacks[compId];
            }

            if(callbacks) {
                callbacks.forEach(function(callback){
                    callback(params);
                });
            }
        },

        handleRunScript: function(compId, script, compData){

            var component = _w.getComponent(compId,compData);

            (function(script, scope,Wix, _w){
                try {
                    eval(script);
                } catch (e) {
                    alert("Script Error: " + e.message);
                    console.error("Script Error: " + e + " " + script);
                }
            })(script, component, Wix ,undefined);
        },

        sendComponentMessage: function(msgType, params, callback,compId){

            var blob = this.getBlob(this.Indent.COMPONENT,msgType,params);
            blob.compId = compId;

            this.sendMessage(blob, callback);
        },

        sendTpaMessage:function(msgType, params, callback){
            var blob = this.getBlob(this.Indent.TPA,msgType,params);

            this.sendMessage(blob,callback);
        },

        getBlob:function(intent,msgType,params){
            var blob = {
                intent: intent,
                callId: this.getCallbackId(),
                type: msgType,
                workerId: this.workerId,
                data: params
            };

            return blob;
        },

        sendMessage: function(blob,callback){

            if(callback) {
                this.callbacks[blob.callId] = callback;
            }

            send(JSON.stringify(blob));
        },
        addEvent: function(eventName, callback, compId){

            if(!eventName || !Wix.Events.hasOwnProperty(eventName)) {
                return;
            }

            var callbacks = this.eventCallbacks[eventName];

            if(!callbacks) {
                callbacks = this.eventCallbacks[eventName] = [];
            }

            if(compId) {

                callbacks = callbacks[compId];

                if(!callbacks) {
                    callbacks = this.eventCallbacks[eventName][compId] = [];
                }
            }

            callbacks.push(callback);
        },
        removeEvent: function(eventName, callback, compId){

            var callbacks = this.eventCallbacks[eventName];

            if(callbacks && compId) {
                callbacks = callbacks[compId];
            }

            if(!callbacks || callbacks.length == 0) {
                return null;
            }

            var index = callbacks.indexOf(callback);

            if(index > -1) {
                callbacks.splice(index, 1);
            }

            return callbacks;
        },

        getQueryParameter: function(parameterName){
            if(this.isWorkerMode()) {
                return;
            }

            if(!_w.queryMap) {
                _w.queryMap = {};

                var query = window.location.search.substring(1).split("&");

                for (var i = 0, length = query.length; i < length; i++) {
                    var pair = query[i].split("=");
                    _w.queryMap[pair[0]] = decodeURIComponent(pair[1]);
                }
            }

            return _w.queryMap[parameterName] || null;
        },

        getComponent: function(compId,compData){
            if(!compId) {
                return;
            }

            var component = _w.components[compId];

            if(!component) {
                component = _w.components[compId] = new Component(compId,compData);
            }

            return component;
        }
    };


    var Wix = {

        Events: {
            PAGE_NAVIGATION: 'PAGE_NAVIGATION',
            SITE_READY: 'SITE_READY',
            CLICK: 'CLICK',
            DBLCLICK: 'DBLCLICK',
            MOUSE_ENTER: 'MOUSE_ENTER',
            MOUSE_LEAVE: 'MOUSE_LEAVE'
        },

        getSiteInfo: function(callback){
            _w.sendTpaMessage('siteInfo', null, callback);
        },

        navigateToPage: function(pageId){
            _w.sendTpaMessage('navigateToPage', {pageId: pageId});
        },

        getSitePages: function(callback){
            _w.sendTpaMessage('getSitePages', null, callback);
        },

        openModal: function(url, width, height){

            var args = {
                url: url,
                width: width,
                height: height
            };
            _w.sendTpaMessage('openModal', args);
        },

        addEventListener: function(eventName, callBack){
            _w.addEvent(eventName, callBack);
        },

        getComponent: function(compId, callback){

            var blob = _w.getBlob(_w.Indent.GET_COMPONENT,'getComponent',{compId: compId});

            _w.sendMessage(blob,callback);


            //return _w.getComponent(compId);
        }

    };


    var Tween = (function(){
        var TweenClass = function(comp){

            this.comp = comp;
        };

        TweenClass.prototype = {
            run: function(params,callback){


                return this.comp._sendMessage('tweenRun', params,callback);
            },
            pause: function(){
                return this.comp._sendMessage('tweenPause');
            },
            resume: function(){
                return this.comp._sendMessage('tweenResume');
            },
            reverse: function(){
                return this.comp._sendMessage('tweenReverse');
            }
        };

        return TweenClass;

    })();


    var Component = (function(){

        //constarctor
        var ComponentClass = function(compId,data){

            this.compId = compId;
            this._data = data;

            this.tween = new Tween(this);
        };

        ComponentClass.prototype = {

            _sendMessage: function(eventType, args, callback){

                _w.sendComponentMessage(eventType, args, callback,this.compId);

                return this;
            },

            click: function(callback){
                return this.addEvent(Wix.Events.CLICK, callback);
            },

            dblclick: function(callback){
                return this.addEvent(Wix.Events.DBLCLICK, callback);
            },

            mouseover: function(callback){
                return this.addEvent(Wix.Events.MOUSE_ENTER, callback);
            },

            mouseout: function(callback){
                return this.addEvent(Wix.Events.MOUSE_LEAVE, callback);
            },

            getWidth: function(){

                return this._data.width;

                //this._sendMessage('getWidth',null,callback);
            },

            setWidth: function(width, callback){
                return this._sendMessage('setWidth', { width: width }, callback);
            },
            getHeight: function(){
                return this._data.height;

                //return this._sendMessage('getHeight',null,callback);
            },

            setHeight: function(height, callback){

                return this._sendMessage('setHeight', {height: height}, callback);
            },

            show: function(callback){
                return this._sendMessage('show', null, callback);
            },

            hide: function(callback){
                return this._sendMessage('hide', null, callback);
            },

            toggle: function(callback){
                return this._sendMessage('toggle', null, callback);
            },

            fadeIn: function(callback){
                return this._sendMessage('fadeIn', null, callback);
            },

            fadeOut: function(callback){
                return this._sendMessage('fadeOut', null, callback);
            },

            slideIn: function(callback){
                return this._sendMessage('slideIn', null, callback);
            },

            slideOut: function(callback){
                return this._sendMessage('slideOut', null, callback);
            },

            getX: function(){

                return this._data.x;

                //return this._sendMessage('getX',null,callback);
            },

            setX: function(x, callback){
                return this._sendMessage('setX', { x: x}, callback);
            },

            getY: function(){

                return this._data.y;

                //return this._sendMessage('getY',null,callback);
            },

            setY: function(y, callback){
                return this._sendMessage('setY', {y: y}, callback);
            },

            getPosition: function(callback){
                this._sendMessage('getPosition', null, callback);
            },

            on: function(eventName, callback){
                return this.addEvent(eventName, callback);
            },

            addEvent: function(eventName, callback){

                _w.addEvent(eventName, callback, this.compId);

                return this._sendMessage('addEvent', { eventName: eventName });
            },

            setStyle: function(id, callback){
                this._sendMessage('setStyle', {styleId: id}, callback);
            },

            setData: function(key,value,callback){

                this._sendMessage('setData', {key:key,value:value}, callback);
            },

            un: function(eventName, callback){
                return this.removeEvent(eventName, callback);
            },
            removeEvent: function(eventName, callback){

                var callbacks = _w.removeEvent(eventName, callback, this.compId);
                if(callbacks && callbacks.length == 0) {
                    this._sendMessage('removeEvent', { eventName: eventName });
                }

                return this;
            }

        };

        return ComponentClass;
    })();


    /**
     * Deploy API on the container (iframe window)
     */
    container.Wix = Wix;
    _w.init();

    //container.component = new Component(_w.compId);


}(this || self));

var send = (typeof workerPostMessage !== 'undefined') ? workerPostMessage : postMessage;


if(typeof window === "undefined") {
    console = {
        log: function(msg){
            this.postMessage(msg, 'log');
        },
        info: function(msg){
            this.postMessage(msg, 'info');
        },
        warn: function(msg){
            this.postMessage(msg, 'warn');
        },
        debug: function(msg){
            this.postMessage(msg, 'debug');
        },
        error: function(msg){
            this.postMessage(msg, 'error');
        },
        postMessage: function(msg, method){

            var blob = {
                workerId: wix_sdk_globals.workerId,
                intent: 'NativeScript',
                message: msg,
                method: method,
                func: 'console'
            };

            send(JSON.stringify(blob));
        }
    };

    alert = function(message){
        var blob = {
            workerId: wix_sdk_globals.workerId,
            intent: 'NativeScript',
            message: message,
            func: 'alert'
        };

        send(JSON.stringify(blob));
    };
}


