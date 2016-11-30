/**
 * @class bootstrap.managers.classmanager.ClassDefinition
 */
define.bootstrapClass('bootstrap.managers.classmanager.ClassDefinition', function (define) {
    'use strict';

    var InheritStrategy = define.getBootstrapClass('bootstrap.managers.classmanager.InheritStrategy');
    /** @constructor */
    function ClassDefinition() {
        this.$constructor = ClassDefinition;
        this._extends_ = undefined;
        this._binds_ = undefined;
        this._traits_ = undefined;
        this._statics_ = undefined;
        this._fields_ = {};
        this._methods_ = {};
        this._imports_ =undefined;
        this._resources_ = undefined;
        this._onClassReadyFunc_ = undefined;
        this._inheritStrategy_ = new InheritStrategy();
    }

    /**
     * @lends bootstrap.managers.classmanager.ClassDefinition
     */
    ClassDefinition.extendPrototype({

        /**
         *
         */
        InheritStrategy: InheritStrategy,

        /** @param {string} parentClassName */
        inherits:function (parentClassName) {
            this._extends_ = parentClassName;
        },

        /** @param {Array.<string>} bindList */
        binds:function (bindList) {
            this._binds_ = bindList;
        },

        /** @param {Array.<string>} traitList */
        traits:function (traitList) {
            this._traits_ = traitList;
        },

        /** @param {Object} staticObj */
        statics:function (staticObj) {
            if(typeof staticObj === 'function'){
                LOG.reportError(wixErrors.INVALID_STATICS_PARAM, "classDefinition", "statics");
            }
            this._statics_ = staticObj;
        },

        /** @param {Object} fieldsObj */
        fields:function (fieldsObj) {
            if(typeof fieldsObj === 'function'){
                LOG.reportError(wixErrors.INVALID_FIELDS_PARAM, "classDefinition", "fields");
            }
            this._fields_ = fieldsObj;
        },

        /** @param {Object.<string,function>} methodsObj */
        methods:function (methodsObj) {
            if(typeof methodsObj === 'function'){
                LOG.reportError(wixErrors.INVALID_METHODS_PARAM, "classDefinition", "methods");
            }
            this._methods_ = methodsObj;
        },
        /** @param {Array.<string>} depsArray */
        resources:function (depsArray) {
            this._resources_ = depsArray;
        },

        /** @param {Array.<string>} importsList */
        utilize: function (importsList) {
            this._imports_ = importsList;
        },

        onClassReady:function(onClassReadyFunc){
            this._onClassReadyFunc_ = onClassReadyFunc;
        }
    });

    return ClassDefinition;
});