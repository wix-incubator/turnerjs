/**
 * @class bootstrap.managers.experiments.ExperimentStrategy
 */
define.bootstrapClass('bootstrap.managers.experiments.ExperimentStrategy', function () {

    function ExperimentStrategy() {
    }

    /**
     * @lends bootstrap.managers.experiments.ExperimentStrategy
     */
    ExperimentStrategy.extendPrototype({

        init:function () {
            return this;
        },

        STRATEGY_FLAG:'experimentStrategy',
        BEFORE:'before',
        AFTER:'after',
        AROUND:'around',
        MERGE:'merge',
        DELETE:'delete',
        CUSTOM:'customField',

        /**
         * mark method to run before original method.
         * @param {function} method
         */
        before:function (method) {
            if (typeof method !== 'function') {
                throw new Error("before must be on a method");
            }
            method[this.STRATEGY_FLAG] = this.BEFORE;
            return method;
        },

        /**
         * mark method to run after original method.
         * @param {function} method
         */
        after:function (method) {
            if (typeof method !== 'function') {
                throw new Error("after must be on a method");
            }
            method[this.STRATEGY_FLAG] = this.AFTER;
            return method;
        },

        /**
         * mark method to run around original method.
         * @param {function} method
         */
        around:function (method) {
            if (typeof method !== 'function') {
                throw new Error("around must be on a method");
            }
            method[this.STRATEGY_FLAG] = this.AROUND;
            return method;
        },

        /**
         * mark array or object to be merged with the inherited field
         * @param {Object|Array} obj
         */
        merge:function (obj) {
            var mergeWrapper = function () {
                return obj;
            };
            mergeWrapper[this.STRATEGY_FLAG] = this.MERGE;
            return mergeWrapper;
        },

        /**
         * mark array or object to be deleted from inheritance
         * @param {Object|Array} obj
         */
        "remove":function (obj) {
            var mergeWrapper = function () {
                return obj;
            };
            mergeWrapper[this.STRATEGY_FLAG] = this.DELETE;
            return mergeWrapper;
        },

        /**
         *
         * @param {function} customFunction gets the original field value and returns the new
         * @returns {function}
         */
        customizeField:function(customFunction){
            if (typeof customFunction !== 'function') {
                throw new Error("custom must be on a method");
            }
            customFunction[this.STRATEGY_FLAG] = this.CUSTOM;
            return customFunction;
        },

        _mergeObjects_:function (originalObj, experimentObj) {
            originalObj = originalObj ||{};
            var result = Object.clone(originalObj);
            for (var key in experimentObj) {
                var experimentField = experimentObj[key];
                var originalField = originalObj[key];
                result[key] = this._mergeSingleObject(experimentField, originalField);
                if(this._isDeleteFieldObj(result[key])) {
                    delete result[key];
                }
            }
            return result;
        },

        _mergeSingleObject:function (experimentField, originalField) {
            var result;
            if (typeof experimentField === 'function'&& this._isMethodStrategy(experimentField)){
                result = this._resolveMethod(originalField, experimentField);
            } else if (typeof experimentField === 'function' && this._isFieldStrategy(experimentField)) {
                result = this._mergeField_(originalField, experimentField);
            } else {
                result = experimentField;
            }
            return result;
        },

        _isMethodStrategy: function(experimentField) {
            var strategyFlag = experimentField[this.STRATEGY_FLAG];
            return strategyFlag && (strategyFlag === this.AFTER || strategyFlag === this.BEFORE || strategyFlag === this.AROUND);
        },

        _isFieldStrategy: function(experimentField) {
            var strategyFlag = experimentField[this.STRATEGY_FLAG];
            return strategyFlag && (strategyFlag === this.MERGE || strategyFlag === this.DELETE || strategyFlag === this.CUSTOM);
        },

        _resolveMethod:function (originalMethod, experimentMethod) {
            var overrideMethod;
            if(!originalMethod){
                if(experimentMethod[this.STRATEGY_FLAG]){
                    throw new Error("cannot " + experimentMethod[this.STRATEGY_FLAG] + " if original method is not defined");
                }
                return experimentMethod;
            }
            switch (experimentMethod[this.STRATEGY_FLAG]) {
                case this.BEFORE:
                    overrideMethod = function () {
                        experimentMethod.apply(this, arguments);
                        return originalMethod.apply(this, arguments);
                    };
                    break;
                case this.AFTER:
                    overrideMethod = function () {
                        var result = originalMethod.apply(this, arguments);
                        experimentMethod.apply(this, arguments);
                        return result;
                    };
                    break;
                case this.AROUND:
                    overrideMethod = function () {
                        var that = this;
                        var args = Array.prototype.splice.call(arguments, 0);
                        args.splice(0, 0, function () {
                            return originalMethod.apply(that, args.slice(1));
                        });
                        return experimentMethod.apply(this, args);
                    };
                    break;
                default:
                    overrideMethod = experimentMethod;
            }
            originalMethod.$wrapperFunction = overrideMethod;
            return overrideMethod;
        },

        _mergeField_:function (originalField, experimentField) {
//            if (this._isEmpty(originalField)) {
//                return (typeof experimentField === "function" ? experimentField() : experimentField);
//            }

            if (this._isEmpty(experimentField)) {
                return originalField;
            }

            var isMerge = experimentField[this.STRATEGY_FLAG] == this.MERGE || false;
//            if((experimentField instanceof Array && experimentField.length === 0 ) ||
//                typeof experimentField === 'object' && Object.getLength(experimentField) === 0){
//                return originalField;
//            }
            var isDelete = experimentField[this.STRATEGY_FLAG] == this.DELETE || false;

            var isCustom = experimentField[this.STRATEGY_FLAG] == this.CUSTOM || false;

            if(isCustom){
                delete experimentField[this.STRATEGY_FLAG];
                experimentField =  experimentField(originalField);
            }else if (typeof experimentField === 'function') {
                experimentField = experimentField();
            }


            if (isMerge) {
                delete experimentField[this.STRATEGY_FLAG];
                return this._combine(originalField, experimentField);
            }
            else if(isDelete) {
                return this._getFieldDeleteObj();
            }
            else {
                return experimentField;
            }
        },

        _getFieldDeleteObj: function() {
            return {_delete_:true};
        },

        _isDeleteFieldObj: function(obj) {
            return (obj && obj._delete_ === true);
        },

        _isEmpty:function (field) {
            if (!field) {
                return true;
            }

            if (field instanceof Array && field.length === 0) {
                return true;
            }

            if (typeof field === 'object' && Object.getLength(field) === 0) {
                return true;
            }

            return false;
        },

        _combine:function (element1, element2) {
            if (element2 instanceof Array && (element1 instanceof Array || this._isEmpty(element1))) {
                if (this._isEmpty(element1)) {
                    element1 = [];
                }
                for (var i = 0; i < element2.length; ++i) {
                    var current = element2[i];
                    if (!this._elementExistsInArray(current, element1)) {
                        element1.push(current);
                    }
                }
            } else if (typeof element2 === 'object' && (typeof element1 === 'object' || this._isEmpty(element1))) {
                if (this._isEmpty(element1)) {
                    element1 = {};
                }
                for (var item in element2) {
                    if (
                        (typeof element1[item] === 'object' && typeof element2[item] === 'object') ||
                        (element1[item] instanceof Array && element2[item]  instanceof Array)) {
                        element1[item] = this._combine(element1[item], element2[item]);
                    } else {
                        element1[item] = element2[item];
                    }
                }
            }
            return element1;
        },

        _elementExistsInArray:function(elem, arr){
            for (var j = 0; j < arr.length; j++) {
                if (this._areEqual(arr[j], elem)) {
                    return true;
                }
            }
            return false;
        },

        _areEqual:function (element1, element2) {
            if (typeof element1 === 'object' && typeof element2 === 'object') {
                return this._areObjectsEqual(element1, element2);
            } else if (element1 instanceof Array && element2 instanceof Array) {
                return this._areArraysEqual(element1, element2);
            } else if (element1 !== element2) {
                return false;
            }
            return true;
        },

        _areObjectsEqual:function (obj1, obj2) {
            var result;
            for (var key in obj1) {
                result = this._areEqual(obj1[key], obj2[key]);
                if (!result) {
                    return false;
                }
            }
            return true;
        },

        _areArraysEqual:function (arr1, arr2) {
            var result;
            if (arr1.length !== arr2.length) {
                return false;
            }

            for (var i = 0; i < arr1.length; i++) {
                result = this._areEqual(arr1[i], arr2[i]);

                if (!result) {
                    return false;
                }
            }
            return true;
        }
    });

    return ExperimentStrategy;
});
