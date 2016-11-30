/**
 * setup = {
 *     items:Array,
 *     outputRate: Number (in ms),
 *     outputChunkSize: Number (int),
 *     processContext:Object,
 *     onprocess: Function
 * };
 *
 */
define.Class("bootstrap.utils.Que", function (def) {
    'use strict';

    def.binds(['_next']);

    def.methods({
        initialize: function (setup) {
            setup = setup || {};
            this.processContext = setup.processContext || this,
            this.active = false;
            this.timeoutTicket = null;
            this.items = setup.items || [];
            this.outputRate = setup.outputRate || 100;
            this.outputChunkSize = setup.outputChunkSize || 1;
            this.onprocess = null;
            this.setProcess(setup.onprocess);
        },
        _next: function () {
            var limit = Math.min(this.outputChunkSize, this.size());
            for (var i = 0; i < limit; i++) {
                this.onprocess.call(this.processContext,this.items.shift(), i);
            }
            if (this.size()) {
                this.timeoutTicket = setTimeout(this._next, this.outputRate);
            }
            else {
                this.stop();
            }
        },
        size:function(){
            return this.items.length;
        },
        start: function () {
            if (this.active) {
                return;
            }
            this.stop();
            this.active = true;
            this.timeoutTicket = setTimeout(this._next, this.outputRate);
        },
        stop:function(){
            if (!this.active) {
                return;
            }
            this.active = false;
            clearTimeout(this.timeoutTicket);
        },
        clear: function () {
            this.stop();
            this.items.length = 0;
        },
        add:function(items){
            var p= this.items.push;
            p.apply(this.items, arguments);
            this.start();
        },
        silentAdd:function(items){
            var p= this.items.push;
            p.apply(this.items, arguments);
        },
        addArray:function(items){

        },
        setProcess: function (processFunction) {
            this.onprocess = processFunction || function defalut() {};
        }

    });

});
