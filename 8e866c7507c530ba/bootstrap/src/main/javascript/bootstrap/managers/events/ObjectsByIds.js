define.Class('bootstrap.managers.events.ObjectsByIds', function (classDefinition) {
    /*@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.fields({
        _OBJECT_ID_PROPERTY: '$id'
    });
    def.methods({
        initialize: function () {
            this._objectIdsMap = {};
        },
        /**
         *
         * @param {Object} object
         */
        getObjectId: function (object, addToMap) {
            var id = object[this._OBJECT_ID_PROPERTY];
            if (!id) {
                id = this.injects().Utils.getGUID();
                object[this._OBJECT_ID_PROPERTY] = id;
            }
            if (!this.getObjectById(id) && addToMap) {
                this._objectIdsMap[id] = object;
            }
            return id;
        },

        getObjectIdIfInMap: function(object){
            var id = object[this._OBJECT_ID_PROPERTY];
            if(id && this.getObjectById(id)){
                return id;
            }
            return null;
        },

        registerObjectId: function (object, id) {
            object[this._OBJECT_ID_PROPERTY] = id;
            this._objectIdsMap[id] = object;
            return object;
        },
        /**
         *
         * @param {Number} id
         */
        getObjectById: function (id) {
            return this._objectIdsMap[id];
        },
        removeObjectById: function (id) {
            if (this._objectIdsMap[id]) {
                delete this._objectIdsMap[id];
            }
        }
    });
});
