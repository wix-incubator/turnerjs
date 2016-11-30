define([
    'lodash',
    'utils',
    'experiment',
    'documentServices/errors/errors',
    'documentServices/hooks/hooks',
    'documentServices/saveAPI/saveAPI',
    'documentServices/siteMetadata/generalInfo',
    'documentServices/page/pageData'
], function (_, utils, experiment, errors, hooks, saveAPI, generalInfo, pageData) {
    'use strict';

    var performAutosaveDebounced;
    var config = {};
    var innerPaths = {
        SHOULD_AUTOSAVE: 'shouldAutoSave',
        ACTIONS_COUNT: 'actionsCount',
        AUTOSAVES_COUNT: 'autosaveCount',
        TIMEOUT_ID: 'timeoutId',
        AUTO_FULL_SAVE_FLAG: 'autoFullSaveFlag'
    };
    var requiredEditorConfigKeys = [
        'AUTOSAVE_TIMEOUT',
        'AUTOSAVE_ACTION_COUNT',
        'SAVE_AFTER_AUTOSAVE_COUNT',
        'DEBOUNCE_WAIT'
    ];
    var counterOps = {
        INCREASE: 'increase',
        DECREASE: 'decrease',
        RESET: 'reset'
    };

    function handleUserAction(ps) {
        performAutosaveDebounced = performAutosaveDebounced || _.debounce(performAutosave, config.DEBOUNCE_WAIT * 1000);

        setAutosaveTimeout(ps);

        var newCount = increaseCounter(ps, innerPaths.ACTIONS_COUNT);
        if (newCount >= config.AUTOSAVE_ACTION_COUNT) {
            performAutosaveDebounced(ps, _.noop, _.noop, 'num of actions');
        }
    }

    function performAutosave(ps, onSuccess, onError, trigger) {
        var autosaveCount = increaseCounter(ps, innerPaths.AUTOSAVES_COUNT);

        clear(ps);

        if (autosaveCount < config.SAVE_AFTER_AUTOSAVE_COUNT || !experiment.isOpen('sv_autoFullSave')) {
            var onAutosaveSuccess = getDiffSaveCompletedCallback(ps, trigger, onSuccess);
            var onAutosaveFail = getDiffSaveCompletedCallback(ps, trigger, onError);

            config.onDiffSaveStarted(trigger);

            utils.performance.start('autosave-incremental');

            saveAPI.autosave(ps, onAutosaveSuccess, onAutosaveFail);
        } else {
            var onPartialSaveSuccess = getPartialSaveCompletedCallback(ps, trigger, onSuccess);
            var onPartialSaveFail = getPartialSaveCompletedCallback(ps, trigger, onError);
            var autoFullSaveFlagPointer = ps.pointers.general.getAutoSaveInnerPointer(innerPaths.AUTO_FULL_SAVE_FLAG);

            ps.dal.set(autoFullSaveFlagPointer, true);

            config.onPartialSaveStarted(trigger);

            saveAPI.save(ps, onPartialSaveSuccess, onPartialSaveFail, false);
        }
    }

    function getDiffSaveCompletedCallback(ps, trigger, callback) {
        return function(error) {
            utils.performance.finish('autosave-incremental', true, {
                actionsPerAutosave: config.AUTOSAVE_ACTION_COUNT,
                autosavesPerFull: config.SAVE_AFTER_AUTOSAVE_COUNT,
                pagesCount: pageData.getNumberOfPages(ps),
                success: (!error).toString()
            });

            // Failed autosave due to concurrency should not count (so auto-full-save won't trigger after X autosaves)
            if (isConcurrencyError(error)) {
                decreaseCounter(ps, innerPaths.AUTOSAVES_COUNT);
            }

            config.onDiffSaveFinished(error, trigger);

            if (_.isFunction(callback)) {
                callback(trigger);
            }
        };
    }

    function getPartialSaveCompletedCallback(ps, trigger, callback) {
        return function(error) {
            var autoFullSaveFlagPointer = ps.pointers.general.getAutoSaveInnerPointer(innerPaths.AUTO_FULL_SAVE_FLAG);

            ps.dal.remove(autoFullSaveFlagPointer);

            config.onPartialSaveFinished(error, trigger);

            resetCounter(ps, innerPaths.AUTOSAVES_COUNT);

            if (_.isFunction(callback)) {
                callback(trigger);
            }
        };
    }

    function isConcurrencyError(error) {
        return _.includes([errors.save.CONCURRENT_AUTO_SAVE, errors.save.SITE_STALE_STATE_FROM_AUTO_SAVE], extractDocumentErrorType(error));
    }

    function extractDocumentErrorType(error) {
        return _.get(error, 'document.errorType');
    }

    function setAutosaveTimeout(ps) {
        clearAutosaveTimeout(ps);

        var timeoutIdPointer = ps.pointers.general.getAutoSaveInnerPointer(innerPaths.TIMEOUT_ID);
        var newTimeoutId = setTimeout(function () {
            performAutosaveDebounced(ps, _.noop, _.noop, 'idle');
        }, config.AUTOSAVE_TIMEOUT * 1000);

        ps.dal.set(timeoutIdPointer, newTimeoutId);
    }

    function clearAutosaveTimeout(ps) {
        var timeoutIdPointer = ps.pointers.general.getAutoSaveInnerPointer(innerPaths.TIMEOUT_ID);
        var timeoutId = ps.dal.get(timeoutIdPointer);

        clearTimeout(timeoutId);

        if (performAutosaveDebounced) {
            performAutosaveDebounced.cancel();
        }
    }

    function updateCounter(ps, key, operation) {
        var counterPointer = ps.pointers.general.getAutoSaveInnerPointer(key);
        var currentCount = ps.dal.get(counterPointer) || 0;
        var newCount;

        switch (operation) {
            case counterOps.INCREASE:
                newCount = currentCount + 1;
                break;
            case counterOps.DECREASE:
                newCount = currentCount - 1;
                break;
            case counterOps.RESET:
                newCount = 0;
                break;
        }

        ps.dal.set(counterPointer, newCount);

        return newCount;
    }

    function increaseCounter(ps, key) {
        return updateCounter(ps, key, counterOps.INCREASE);
    }

    function decreaseCounter(ps, key) {
        return updateCounter(ps, key, counterOps.DECREASE);
    }

    function resetCounter(ps, key) {
        return updateCounter(ps, key, counterOps.RESET);
    }

    function clear(ps) {
        clearAutosaveTimeout(ps);
        resetCounter(ps, innerPaths.ACTIONS_COUNT);
    }

    function isNeverSaved(ps) {
        var neverSavedPointer = ps.pointers.general.getNeverSaved();
        return ps.dal.get(neverSavedPointer);
    }

    function isSiteFromOnBoarding(ps) {
        return generalInfo.isSiteFromOnBoarding(ps);
    }

    function registerHooks(ps) {
        hooks.registerHook(hooks.HOOKS.AUTOSAVE.ACTION, _.partial(handleUserAction, ps));
        hooks.registerHook(hooks.HOOKS.SAVE.SITE_SAVED, _.partial(clear, ps));
    }

    function validateConfig(_config) {
        if (!config) {
            utils.log.error(new Error('Missing autosave config object'));
        }

        var missingKeys = _.difference(requiredEditorConfigKeys, _.keys(_config));

        if (!_.isEmpty(missingKeys)) {
            utils.log.error(new Error('Missing autosave config keys: ' + missingKeys.join(',')));
            return false;
        }

        return true;
    }

    function canAutosave(ps) {
        var autosaveInfo = getAutoSaveInfo(ps);

        return !!(autosaveInfo && autosaveInfo.shouldAutoSave && !isNeverSaved(ps) && !isSiteFromOnBoarding(ps));
    }

    function getAutoSaveInfo(ps) {
        var autosaveInfoPointer = ps.pointers.general.getAutosaveInfo();
        return ps.dal.get(autosaveInfoPointer);
    }

    var autosave = {
        init: function(ps, _config) {
            if (!validateConfig(_config)) {
                return false;
            }

            config = _config;
            hooks.unregisterHooks([hooks.HOOKS.AUTOSAVE.ACTION, hooks.HOOKS.SAVE.SITE_SAVED]);

            if (_config.enabled === false) {
                return false;
            }

            registerHooks(ps);
            return true;
        },

        autosave: function(ps, onSuccess, onError, triggerName) {
            if (!canAutosave(ps)) {
                return onError({document: 'Autosave not available'});
            }

            performAutosave(ps, onSuccess, onError, triggerName);
        },

        canAutosave: canAutosave,

        getAutoSaveInfo: getAutoSaveInfo,

        clear: clear
    };

    return autosave;
});