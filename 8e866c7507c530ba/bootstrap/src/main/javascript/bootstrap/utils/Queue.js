/**
 * User: omri
 * Date: 2/14/11
 * Time: 6:00 PM
 **/
define.Class('bootstrap.utils.Queue', function(classDefinition){
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    /**
     * @class bootstrap.utils.Queue
     */
    def.methods({

        initialize: function() {
            this.map = {};
        },

        add : function(key, value) {
            this.map[key] = this.map[key] || [];
            this.map[key].push(value);
        },

        addUnique : function(key, value) {
            this.map[key] = this.map[key] || [];
            //this.map[key].include(value);
            var isUnique = true;
            for(var i=0; i< this.map[key].length; i++){
                if(this.map[key][i] === value){
                    isUnique = false;
                    break;
                }
            }

            if(isUnique){
                this.map[key].push(value);
            }
        },

        remove : function(key, value) {
            this.map[key] && this.map[key].erase(value);
        },

        removeKey : function(key) {
            delete this.map[key];
        },

        removeAll : function() {
            this.map = {};
        },

        getQueue : function(key) {
            return this.map[key] || [];
        },

        getQueueKeys : function(){
            return Object.keys(this.map);
        },

        hasQueue: function(key) {
            if(!key) {
                return Object.some(this.map, function(){return true;});
            } else {
                return Object.some(this.map, function(value, queueKey, object){
                    return (queueKey === key);
                }) || false;
            }
        },

        popQueue : function(key)
        {
            var queue = this.getQueue(key);
            this.removeKey(key);

            return queue;
        },

        isReady: function(){ return true; },
        clone: function(){ return this; }
    });

});