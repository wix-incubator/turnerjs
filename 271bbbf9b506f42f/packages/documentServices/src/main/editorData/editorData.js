define(['lodash', 'documentServices/editorData/composersHandler', 'documentServices/editorData/editorDataPath'], function(_, composersHandler, editorDataPath){

    'use strict';

    var COMPOSERS = composersHandler.COMPOSERS;
    var VERSION = '0.1';

    /**
     * Initiate the editorData
     *
     * @param {Object} privateServices
     */
    function initEditorData(privateServices) {

        var DAL = privateServices.dal;

        var editorPointer = privateServices.pointers.general.getEditorData();
        if (_.isEmpty(DAL.get(editorPointer))) {
            DAL.set(editorPointer, {});
        }

        var generatedDataPointer = editorDataPath.getGeneratedDataPointer(privateServices);
        var generatedVersionPointer = editorDataPath.getGeneratedVersionPointer(privateServices);

        var pagePointers = privateServices.pointers.page.getNonDeletedPagesPointers(true);
        DAL.set(generatedDataPointer, composersHandler.getData(privateServices, pagePointers));
        DAL.set(generatedVersionPointer, getVersion());
    }

    /**
     * Gets the current version
     *
     * @returns {string}
     */
    function getVersion() {
        return VERSION;
    }

    /**
     * @param {Object} composerData
     * @param {Array} deletedPages
     */
    function filterDeletedPages(composerData, deletedPages) {
        if (_.isEmpty(deletedPages)) {
            return composerData;
        }

        _.forEach(composerData, function(pageData, pageName) {
             if (_.includes(deletedPages, pageName)) {
                 delete composerData[pageName];
             }
        });

        return composerData;
    }

    /**
     * Updates composer data with loaded pages
     *
     * @param {Object} privateServices
     * @param {Object} composerPointer
     * @param {Object} composerClass
     */
    function updateComposerData(privateServices, composerPointer, composerClass) {

        var DAL = privateServices.dal;

        var pagesPointers = privateServices.pointers.page.getNonDeletedPagesPointers(true);
        var composerData = DAL.get(composerPointer);
        var deletedPages = [];

        _.forEach(pagesPointers, function(pagePointer) {
            var pageData = DAL.get(pagePointer);
            if ( _.isEmpty(pageData)) {
                deletedPages.push(pageData.id);
            }
        });

        _.assign(composerData, composersHandler.getComposerPagesData(privateServices, composerClass, pagesPointers));
        DAL.set(composerPointer, filterDeletedPages(composerData, deletedPages));
    }

    /**
     * @param {Object} privateServices
     * @param {Object} composerClass
     */
    function getComposerData(privateServices, composerClass) {

        var composerKey = composerClass.key;
        var composerPointer = editorDataPath.getComposerPointer(privateServices, composerKey);

        updateComposerData(privateServices, composerPointer, composerClass);
        return privateServices.dal.get(composerPointer);
    }

    /**
     * We will init the editorData in 2 scenarios:
     *   1. editorData is empty.
     *   2. editorData version is outdated.
     *
     * @param privateServices
     * @returns {boolean}
     */
    function shouldInitEditorData(privateServices) {
        var DAL = privateServices.dal;
        var generatedDataPointer = editorDataPath.getGeneratedDataPointer(privateServices);
        var generatedVersionPointer = editorDataPath.getGeneratedVersionPointer(privateServices);

        var generatedVersion = generatedVersionPointer && DAL.get(generatedVersionPointer);
        var generatedData = generatedDataPointer && DAL.get(generatedDataPointer);

        return _.isEmpty(generatedData) || generatedVersion !== getVersion();
    }

    /**
     * Load all site JSONs and fires a callback when it finishes
     *
     * @param callback
     * TODO: implement this.
     */
    function loadAllData(callback) {
        // Assume that all data has been loaded
        if (callback) {
            callback();
        }
    }

    /**
     * @param privateServices
     */
    function updateAllComposers(privateServices) {
        _.forEach(COMPOSERS, function(composer) {
            var composerKey = composer.key;
            var composerClass = composer.class;
            var composerPointer = editorDataPath.getComposerPointer(privateServices, composerKey);
            updateComposerData(privateServices, composerPointer, composerClass);
        });
    }

    return {
        /**
         * Initiate editorData ( if needed )
         *
         * @function
         */
        initialize: function(privateServices) {
            if (shouldInitEditorData(privateServices)) {
                loadAllData(initEditorData.bind(null, privateServices));
            }
        },

        /**
         * Get composer data
         *
         * @function
         * @param {Object} composers class
         * @returns {Object} composer data
         */
        getComposerData: getComposerData,

        /**
         * Gets the current version
         *
         * @function
         * @returns {string} current editorData version
         */
        getVersion: getVersion,

        /**
         * Update all composers
         *
         * @function
         */
        updateAllComposers: updateAllComposers,

        /**
         * Get Composer Classes
         *
         * @enum {Object} composersHandler.COMPOSERS
         * @readonly
         * @ignore
         */
        COMPOSERS: COMPOSERS
    };
});
