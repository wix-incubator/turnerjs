define.bootstrapClass('bootstrap.extendnative.Array', function() {

    Array.implement({
        moveItem:function(currentIndex, newIndex) {
            var item = this[currentIndex];
            if (newIndex < 0){
                newIndex = 0;
            }
            if (newIndex > this.length - 1){
                newIndex = this.length - 1;
            }
            this.splice(currentIndex, 1);
            this.splice(newIndex, 0, item);
        },
        getIndexByField:function(field, value) {
            for (var i = 0, len = this.length; i < len; i++) {
                if (this[i][field] == value){
                    return i;
                }
            }
            return -1;
        },
        getByField: function (field, value) {
            var index = this.getIndexByField(field, value);
            return index >= 0 ? this[index] : undefined;
        },

        /**
         * same as index of, but receives a function which returns a boolean value
         * @param predicate
         */
        indexOfByPredicate: function (predicate) {
            for (var i = 0; i < this.length; i++) {
                if (predicate(this[i])) {
                    return i;
                }
            }

            return -1;
        },

        /**
         *
         * @param {Array} objects
         * @param {Function} equalsMethod, the method should receive 2 objects and return true if they're equal
         * @returns {Array} a subArray of this array, so that each element is one of the objects passed
         */
        intersect: function(objects, equalsMethod){
            return this.filter(function(objectA){
                return objects.some(function(objectB){
                    return equalsMethod ? equalsMethod(objectA, objectB) : objectA === objectB;
                });
            });
        },
        /**
         *
         * @param {Array} objects
         * @param {Function} equalsMethod, the method should receive 2 objects and return true if they're equal
         * @returns {Boolean} true if there is an objects which is both in this array and in the passed objects
         */
        isIntersecting: function(objects, equalsMethod){
            return this.some(function(objectA){
                return objects.some(function(objectB){
                    return equalsMethod ? equalsMethod(objectA, objectB) : objectA === objectB;
                });
            });
        },

        first: function(filterFunction){
            var element = null;
            for(var i=0; !element && i < this.length; i++){
                if(filterFunction(this[i])){
                    element = this[i];
                }
            }
            return element;
        },

        eraseWithPredicate: function(predicate){
            var toRemove =  this.filter(predicate);
            toRemove.forEach(function(item){
                 this.erase(item);
            }, this);
            return this;
        },

        toMap: function(getKeyFunction){
            var map = {};
            for(var i = 0; i < this.length; i++){
                var key = getKeyFunction(this[i], i, this);
                map[key] = this[i];
            }
            return map;
        }
    });
    /**
     * Polyfill isArray in IE8 and below.
     */

    if (!Array.isArray){
        Array.implement({
            isArray: function(o) {
                return Object.prototype.toString.call(o) === '[object Array]';
            }
        });
    }

    return Array;
});