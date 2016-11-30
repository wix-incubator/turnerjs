define.Class('wysiwyg.editor.managers.serverfacade.ServerFacadeErrorHandler', function (classDefinition, experimentStrategy) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;
    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.utilize(['wysiwyg.editor.validations.SiteStructureInvalidatorUtils',
                'wysiwyg.editor.validations.ErrorsInvalidationCollector',
                'wysiwyg.editor.validations.SiteStructureInvalidator',
                'wysiwyg.editor.validations.SiteStructureInvalidationFixer']);

    def.methods(/**@lends wysiwyg.editor.managers.serverfacade.ServerFacadeErrorHandler */{
        /**
         * @constructs
         * **/
        initialize: function(WPreview) {

            this._referenceToWPreview = WPreview;

            /** @type {wysiwyg.editor.validations.SiteStructureInvalidatorUtils} */
            this.invalidationUtils = new this.imports.SiteStructureInvalidatorUtils(WPreview);
            /** @type {wysiwyg.editor.validations.ErrorsInvalidationCollector} **/
            this.invalidationCollector = new this.imports.ErrorsInvalidationCollector();
            /** @type {wysiwyg.editor.validations.SiteStructureInvalidator} **/
            this.structureInvalidator = new this.imports.SiteStructureInvalidator(WPreview, this.invalidationCollector, this.invalidationUtils);
            /** @type {wysiwyg.editor.validations.SiteStructureInvalidationFixer} */
            this.invalidationFixer = new this.imports.SiteStructureInvalidationFixer(WPreview, this.invalidationUtils);

            this._resetErrorValidations();
        },


        /**
         * Handles the various scenarios that cause save error 10104, and tries to fix them automatically.
         * @param payload - the payload that contains the information relating to what caused the failure
         * @returns {boolean} - whether successful in fixing and save should be re-run
         */
        handleSaveValidationError10104: function(payload){

            /** Fatal save errors-  the server will cause the save to fail for any of these **/
            var fatalErrorsFixed = {
                duplicateComponents: this._handleDuplicateComponents(payload.duplicateComponents),
                dataReferenceMismatches: this._handleDataReferenceMismatches(payload.dataReferenceMismatches),
                missingContainers: this._handleMissingSiteSegmentContainer(payload.missingContainers)
            };
            var shouldPromptForSaveAgain = !_.contains(fatalErrorsFixed, false); //if there is no false, then we should prompt for a resave

            /** non-fatal save errors-  the server does not cause save to fail for these, so we will only encounter these if
             * the server caused the save to fail for one of the fatal errors, and this issue was present as well  **/
            var nonFatalErrorsFixed = {
                styleReferenceMismatches: this._handleMissingStyleReferences(payload.styleReferenceMismatches),
                propertyReferenceMismatches: this._handleMissingPropertyReferences(payload.propertyReferenceMismatches)
            };
            var reportNonFatalErrorsFixed = _.contains(nonFatalErrorsFixed, true);

            if(shouldPromptForSaveAgain){
                LOG.reportError(wixErrors.SAVE_ERROR_FROM_SERVER_10104_FIXED, "EditorErrorUtils", "handleSaveValidationError10104");
            } else{
                LOG.reportError(wixErrors.SAVE_ERROR_FROM_SERVER_10104, "EditorErrorUtils", "handleSaveValidationError10104");
            }

            if(reportNonFatalErrorsFixed){
                LOG.reportError(wixErrors.SAVE_ERROR_FROM_SERVER_10104_NONFATAL_FIXED, "EditorErrorUtils", "handleSaveValidationError10104");
            }

            W.Editor.clearSelectedComponent();
            return shouldPromptForSaveAgain;
        },


        /////////////////////////// TOP LEVEL HANDLERS /////////////////////////////

        /**
         * site failed validation because it is missing a site_structure container, i.e. header or footer
         * @param missingContainers - the server's missing site structure containers payload
         * @returns {boolean} - whether we fixed any errors
         * @private
         */
        _handleMissingSiteSegmentContainer: function(missingContainers){
            if(_.isEmpty(missingContainers)){
                return true;
            }

            this._resetErrorValidations();
            this.structureInvalidator.invalidateMissingSiteSegmentContainers();
            this._fixInvalidatedMissingContainers();
            W.UndoRedoManager.clear();

            // note: there is currently a bug with multiple missing containers in one site, WOH-5976.
            // It's a rare scenario, but this should be fixed and changed to return a real boolean, not a hardcoded 'true'
            return true;
        },

        /**
         * @typedef {object} dataReferenceMismatch
         * @property {string} dataNodeId - the dataQuery ID which refers to invalid or nonexisting data.
         * @property {string} referringComponentId - ID of the component which contains the bad reference.
         */

        /**
         * site failed validation because it has references to data nodes which do not exist
         * @param {dataReferenceMismatch[]} dataReferenceMismatches
         * @returns {boolean} - whether successful in fixing and a save should be re-run
         * @private
         */
        _handleDataReferenceMismatches: function(dataReferenceMismatches){
            if(_.isEmpty(dataReferenceMismatches)){
                return true; //if it's empty, we still want to prompt the user to save again, since there are no errors here
            }
            var mode = "DATA_REFERENCE_MISMATCHES";

            this._resetErrorValidations();
            this._forceMergeAlgorithm();
            this.structureInvalidator.invalidateAllCompsWithDataReferenceMismatches(dataReferenceMismatches);
            this._fixInvalidatedDataReferenceMismatches();
            var success = this._validateDataReferenceFix(dataReferenceMismatches);

            this.invalidationCollector.sendAllAggregatedErrors(mode);
            W.UndoRedoManager.clear();
            return success;
        },

        /**
         * Automatically re-generates ID's for duplicate components and returns true when complete.
         * @param duplicateComponentsInfo - this is part of payload returned from the server, and is not actually a component.
         * It only represents one, and the real component must be found before we can work with it (inside the function).
         * @return {boolean} whether successful and should prompt to save again
         * @private
         */
        _handleDuplicateComponents: function(duplicateComponentsInfo){
            if(_.isEmpty(duplicateComponentsInfo)){
                return true; //if it's empty, we still want to prompt the user to save again, since there are no errors here
            }
            var mode = "DUPLICATE_COMPONENTS";

            duplicateComponentsInfo = _.groupBy(duplicateComponentsInfo, 'id'); //for convenience when using _.every
            var wasFixSuccessful = _.every(duplicateComponentsInfo, this._handleAllDuplicatesForSingleId, this);
            this.invalidationCollector.sendAllAggregatedErrors(mode);
                /** @author Etai
                 * In case you're wondering about anchors, dirty comps, why we clear undo etc... see my comments in WOH-5187**/
            W.UndoRedoManager.clear();
            return wasFixSuccessful;
        },

        /**
         * site failed validation because it has references to styles which do not exist
         * @param styleReferenceMismatches - the server's missing style references payload
         * @returns {boolean} - whether we fixed any errors
         * @private
         */
        _handleMissingStyleReferences: function(styleReferenceMismatches){
            /*            if(_.isEmpty(styleReferenceMismatches)){
             return true;
             }*/
            return false;
        },

        /**
         * site failed validation because it has references to properties which do not exist
         * @param propertyReferenceMismatches
         * @returns {boolean} - whether we fixed any errors
         * @private
         */
        _handleMissingPropertyReferences: function(propertyReferenceMismatches){
            /*            if(_.isEmpty(propertyReferenceMismatches)){
             return true;
             }*/
            return false;
        },


        /////////////////////////// INTERNAL API- SET/GET INVALIDATION  /////////////////////////////

        /**
         * Clears / Initializes our validations object between checks
         * @private
         */
        _resetErrorValidations: function(){
            var invalidationSchema = {
                valid: [],
                notInstanceOfClass: [],
                invalidParent: [],
                noCompLogic: [],
                duplicates: {
                    siblings: [],
                    unknownDuplicate: []
                },
                missingContainers: [],
                dataReferences: {
                    missing: {
                        mobile: [],
                        desktop: [],
                        indirectDataReference: []
                    },
                    mismatch:{ //note that these are all arrays of {comp: component, dataItem: the correct data item}
                        mobile: [],
                        desktop: []
                    },
                    notDirty: []
                }
            };
            this.invalidationCollector.resetInvalidations(invalidationSchema);
        },
        /**
         * This will force the merge algorithm to run, which may fix some of the data reference mismatch problems
         */
        _forceMergeAlgorithm: function () {
            this._referenceToWPreview.getFullStructureSerializer().getFullSiteStructureUpdateSecondary();
        },
        /**
         * Clears the component validations and then re-validates. Returns true if no components were invalidated.
         * @param {dataReferenceMismatch[]} dataReferenceMismatches
         * @returns {boolean}
         * @private
         */
        _validateDataReferenceFix: function(dataReferenceMismatches){
            this._resetErrorValidations();
            this.structureInvalidator.invalidateAllCompsWithDataReferenceMismatches(dataReferenceMismatches);
            return !!( _.forEach(this.invalidationCollector.getInvalidationByType('dataReferences.missing'), _.isEmpty, this) &&
                       _.forEach(this.invalidationCollector.getInvalidationByType('dataReferences.mismatch'), _.isEmpty, this) &&
                       _.isEmpty(this.invalidationCollector.getInvalidationByType('dataReferences.notDirty')) );
        },
        /**
         * used by _handleDuplicateComponents
         * @param duplicateCompsArr
         * @param compId
         * @returns {boolean} whether successful in fixing or not
         * @private
         */
        _handleAllDuplicatesForSingleId: function(duplicateCompsArr, compId){
            this._resetErrorValidations();
            var duplicateComponentsViewNodes = this._referenceToWPreview.getAllCompsWithID(compId);
            this.structureInvalidator.invalidateDuplicateComponents(duplicateComponentsViewNodes, compId);

            var canBeFixed = this.invalidationCollector.getMarkedValid().length === 1;
            if(canBeFixed){
                this._fixInvalidatedDuplicates();
            }
            return canBeFixed; //after the above 'if', this could be thought of as 'wasFixed'.
        },


        /////////////////////////// FIX METHODS (After invalidations) /////////////////////////////

        /**
         * handles each of our invalidations according to the best fix we can provide for that invalidation
         * @private
         */
        _fixInvalidatedDuplicates: function(){
            var invalidations = this.invalidationCollector,
                invalidationFixer = this.invalidationFixer;

            _.forEach(invalidations.getInvalidationByType("duplicates.unknownDuplicate"), invalidationFixer.generateNewIdForComp,        invalidationFixer);
            _.forEach(invalidations.getInvalidationByType("notInstanceOfClass"),          invalidationFixer.generateNewIdForComp,        invalidationFixer);
            _.forEach(invalidations.getInvalidationByType("noCompLogic"),                 invalidationFixer.removeInvalidIdFromViewNode, invalidationFixer);
            _.forEach(invalidations.getInvalidationByType("invalidParent"),               invalidationFixer.removeInvalidComponent,      invalidationFixer);
            _.forEach(invalidations.getInvalidationByType("duplicates.siblings"),         invalidationFixer.removeInvalidComponent,      invalidationFixer);

        },
        
        /**
         * Fixes the invalidated dataReferenceMismatches based on the given scenario.
         * @private
         */
        _fixInvalidatedDataReferenceMismatches: function(){
            var invalidations = this.invalidationCollector,
                invalidationFixer = this.invalidationFixer;
            _.forEach(invalidations.getInvalidationByType('dataReferences.missing.mobile'),   invalidationFixer.removeInvalidComponent, invalidationFixer);
            _.forEach(invalidations.getInvalidationByType('dataReferences.missing.desktop'),  invalidationFixer.removeInvalidComponent, invalidationFixer);
            _.forEach(invalidations.getInvalidationByType('dataReferences.mismatch.mobile'),  invalidationFixer.synchronizeDataItem,    invalidationFixer);
            _.forEach(invalidations.getInvalidationByType('dataReferences.mismatch.desktop'), invalidationFixer.synchronizeDataItem,    invalidationFixer);
            _.forEach(invalidations.getInvalidationByType('dataReferences.missing.indirectDataReference'),  invalidationFixer.removeDataQueryFromReflist, invalidationFixer);
            _.forEach(invalidations.getInvalidationByType('dataReferences.notDirty'), invalidationFixer.markDataAsDirtyForSave,    invalidationFixer);
        },

        /**
         * handles the various invalidations that missing site segment containers can cause
         * @private
         */
        _fixInvalidatedMissingContainers: function(){
            var siteStructure = this._referenceToWPreview.getCompByID('SITE_STRUCTURE').$logic;
            this._referenceToWPreview.getPreviewManagers().Layout.updateChildAnchors(siteStructure);

            var invalidations = this.invalidationCollector,
                invalidationFixer = this.invalidationFixer;
            _.forEach(invalidations.getInvalidationByType("notInstanceOfClass"), invalidationFixer.fixMissingContainerWithWrongClass, invalidationFixer);
            _.forEach(invalidations.getInvalidationByType("noCompLogic"),        invalidationFixer.removeInvalidIdFromViewNode,       invalidationFixer);
            _.forEach(invalidations.getInvalidationByType("invalidParent"),      invalidationFixer.fixSiteSegmentHierarchy,           invalidationFixer);
            _.forEach(invalidations.getInvalidationByType('missingContainers'),  invalidationFixer.addMissingSiteSegment,             invalidationFixer);
        }
    });
});
