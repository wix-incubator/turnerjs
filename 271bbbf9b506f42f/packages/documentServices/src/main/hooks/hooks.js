define(['lodash'], function (_) {
    'use strict';

    var HOOKS = {
        LAYOUT : {
          UPDATE_BEFORE:'before_layout_update',
          UPDATE_AFTER:'after_layout_update'
        },
        COMPONENT:{
          STYLE_UPDATE_AFTER:'after_style_update'
        },
        ARRANGEMENT: {
            MOVE_AFTER: 'after_move'
        },
        ADD: {
            BEFORE: 'before_add',
            AFTER: 'after_add',
            IS_OPERATION_ALLOWED: 'isOperationAllowed_add'
        },
        DATA: {
            UPDATE_BEFORE: 'data_update_before',
            AFTER_GET: 'after_get_data'
        },
        PROPERTIES: {
            UPDATE_BEFORE: 'properties_update_before'
        },
        ADD_ROOT: {
            BEFORE: 'before_add_root',
            AFTER: 'after_add_root',
            IS_OPERATION_ALLOWED: 'isOperationAllowed_add_root',
            GET_CONTAINER_TO_ADD_TO: 'get_container_to_add_to'
        },
        REMOVE: {
            BEFORE: 'before_remove',
            AFTER: 'after_remove',
            IS_OPERATION_ALLOWED: 'isOperationAllowed_remove'
        },
        DUPLICATE: {
            IS_OPERATION_ALLOWED: 'isOperationAllowed_duplicate',
            DUPLICATE_ROOT:'duplicateRoot'
        },
        SERIALIZE: {
            SET_CUSTOM: 'set_custom_serialize'
        },
        CHANGE_PARENT: {
            BEFORE: 'before_change_parent',
            AFTER: 'after_change_parent'
        },
        SWITCH_VIEW_MODE: {
            MOBILE: 'switch_to_mobile_view'
        },
        MOBILE_CONVERSION: {
            BEFORE: 'before_mobile_conversion',
            AFTER: 'after_mobile_conversion'
        },
        PUBLISH: {
            BEFORE: 'before_site_publish'
        },
        AUTOSAVE: {
            ACTION: 'autosave_action'
        },
        SAVE: {
            SITE_SAVED: 'site_saved'
        }
    };

    var hooks = {};
    unregisterAllHooks();

    function setHook(functionName, compType, callback) {
        if (!callback) {
            return;
        }

        hooks[functionName].push({type: compType, callback: callback});
    }

    function validateHookName(hookName) {
        var isValid = _.some(HOOKS, function (hook) {
            return _.some(hook, function (name) {
                return name === hookName;
            });
        });

        if (!isValid) {
            throw "Invalid Hook Name " + hookName;
        }
    }

    /**
     * Unregister all hooks.
     */
    function unregisterAllHooks() {
        _.forEach(HOOKS, function (hook) {
            _.forEach(hook, function (hookName) {
                hooks[hookName] = [];
            });
            });
    }

    /**
     * Unregister only hooks that are passed
     * @param {String|Array} _hooksToRemove - hook name or array of hooks names
     */
    function unregisterHooks(_hooksToRemove) {
        var hooksToRemove = _.isArray(_hooksToRemove) ? _hooksToRemove : [_hooksToRemove];

        _.forEach(hooksToRemove, function (hookName) {
            hooks[hookName] = [];
        });
    }

    /**
     * Register callback to run the function specified in when executing the hook specified in the hookName parameter according to the hook type.
     * @param {String} hookName The name of the hook to registered (i.e HOOKS.ADD.BEFORE)
     * @param {function} callback function to execute.
     * @param {String=} compType The component type that will use the callback while running the operation according to the hookType.
     */
    function registerHook(hookName, callback, compType) {
        validateHookName(hookName);
        setHook(hookName, compType, callback);
    }

    /**
     * Execute all callbacks of the specified hook for the specified component.
     * @param {String} hookName The name of the hook to execute (i.e HOOKS.ADD.BEFORE).
     * @param {String?} compType The component type or none to execute only hooks that were registered without a component type.
     * @param {Array?} args The arguments that will be passed to the hook callbacks.
     * @param {function(object) : bool?} stopCondition stop running callbacks if one of the callbacks return value apply to the condition.
     * @returns {bool} true if none of the callbacks return value returns true to the stopCondition.
     */
    function runHooksExecution(hookName, compType, executeHookFunction){
        validateHookName(hookName);

        var callbacks = hooks[hookName];

        _(callbacks)
            .filter(function (callback) {
                return _.isUndefined(callback.type) || callback.type === compType;
            })
            .forEach(executeHookFunction)
            .value();

    }

    function executeHooksAndReturnIfAllPassed(hookName, compType, args, stopCondition){
        stopCondition = stopCondition || _.noop;
        var stopped = false;
        function executeHook(hook){
            var callbackReturnValue = hook.callback.apply(this, args);
            if (stopCondition(callbackReturnValue)) {
                stopped = true;
                return false;
            }
        }
        runHooksExecution(hookName, compType, executeHook);

        return !stopped;
    }

    function executeHooksAndCollectValues(hookName, compType, args){
        var values = [];
        function executeHook(hook){
            var callbackReturnValue = hook.callback.apply(this, args);
            if (!_.isUndefined(callbackReturnValue)){
                values.push(callbackReturnValue);
            }
        }
        runHooksExecution(hookName, compType, executeHook);

        return values;
    }

    return {
        HOOKS: HOOKS,
        unregisterAllHooks: unregisterAllHooks,
        unregisterHooks: unregisterHooks,
        registerHook: registerHook,
        executeHook: executeHooksAndReturnIfAllPassed,
        executeHooksAndCollectValues: executeHooksAndCollectValues
    };
});
