define([], function() {
    'use strict';

    var PATHS = {
        generatedData: 'generated',
        generatedVersion: 'generatedVersion'
    };

    /**
     * @param {object} privateServices
     * @param {string} composerKey
     * @returns {object}
     */
    function getComposerPointer(privateServices, composerKey) {
        return privateServices.pointers.getInnerPointer(getGeneratedDataPointer(privateServices), composerKey);
    }

    /**
     * @param {object} privateServices
     * @returns {object}
     */
    function getGeneratedDataPointer(privateServices) {
        return privateServices.pointers.getInnerPointer(privateServices.pointers.general.getEditorData(), PATHS.generatedData);
    }

    /**
     * @param {object} privateServices
     * @returns {object}
     */
    function getGeneratedVersionPointer(privateServices) {
        return privateServices.pointers.getInnerPointer(privateServices.pointers.general.getEditorData(), PATHS.generatedVersion);
    }

    return {
        getComposerPointer: getComposerPointer,
        getGeneratedDataPointer: getGeneratedDataPointer,
        getGeneratedVersionPointer: getGeneratedVersionPointer
    };
});
