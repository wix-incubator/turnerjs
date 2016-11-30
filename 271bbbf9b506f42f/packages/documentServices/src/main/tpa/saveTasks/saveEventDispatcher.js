define(['documentServices/tpa/tpa', 'documentServices/hooks/hooks'], function(tpa, hooks) {
    'use strict';

    var triggerSaveEvent = function () {
        tpa.change.siteSaved();
        hooks.executeHook(hooks.HOOKS.SAVE.SITE_SAVED);
    };

    return {
        partialSave: function (lastSavedData, currentData, resolve) {
            resolve();
            triggerSaveEvent();
        },
        fullSave: function (lastSavedData, currentData, resolve) {
            resolve();
            triggerSaveEvent();
        },
        firstSave: function (lastSavedData, currentData, resolve) {
            resolve();
            triggerSaveEvent();
        },
        saveAsTemplate: function(lastSavedData, currentData, resolve) {
            resolve();
        },
        publish: function (currentData, resolve) {
            resolve();
        },
        getTaskName: function () {
          return 'saveEventDispatcher';
        },
        autosave: function(lastSnapshot, currentSnapshot, resolve) {
            resolve();
        }
    };
});
