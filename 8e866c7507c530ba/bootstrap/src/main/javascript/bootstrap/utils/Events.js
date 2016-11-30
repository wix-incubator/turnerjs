/**
 * @class bootstrap.utils.Events
 */
define.Class('bootstrap.utils.Events', function(classDefinition){
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    /**
     * @lends bootstrap.utils.Events
     */
    def.methods({
        addEvent: function(type, fn){
            type = this._removeOn(type);

            this.$events = this.$events || {};
            this.$events[type] = (this.$events[type] || []).include(fn);
            return this;
        },

        addEvents: function(events){
            for (var type in events) {
                this.addEvent(type, events[type]);
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

        removeEvent: function(type, fn){
            if(this.$events) {
                type = this._removeOn(type);
                var events = this.$events[type];
                if (events){
                    if(fn) {
                        var index = events.indexOf(fn);
                        if (index != -1) {
                            events.splice(index,1); // ToDo: remove event completely
                            if (events.length===0) {
                                delete this.$events[type];
                            }
                        }
                    } else {
                        delete this.$events[type];
                    }
                }
            }
            return this;
        },

        removeEvents: function(events){
            var type;
            if (typeOf(events) == 'object'){
                for (type in events){
                    this.removeEvent(type, events[type]);
                }
                return this;
            }

            if (events) {events = this._removeOn(events);}
            for (type in this.$events){
                if (events && events != type) {continue;}
                var fns = this.$events[type];
                for (var i = fns.length; i--;) {this.removeEvent(type, fns[i]);}
            }
            return this;
        },

        _removeOn: function(string){
            return string.replace(/^on([A-Z])/, function(full, first){
                return first.toLowerCase();
            });
        },

        removeAllEvents: function() {
            this.$events = {};
        }
    });
});