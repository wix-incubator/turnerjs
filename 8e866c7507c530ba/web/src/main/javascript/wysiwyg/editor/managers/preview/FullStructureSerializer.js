define.Class('wysiwyg.editor.managers.preview.FullStructureSerializer', function(classDefinition){
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.resources(['W.Utils', 'W.Commands']);

    def.methods(/** @lends wysiwyg.editor.managers.preview.FullStructureSerializer */
        {
            /**
             * @constructs
             * @param {wysiwyg.editor.managers.preview.MultipleViewersHandler} multiViewersHandler
             */
        initialize: function(multiViewersHandler){
                /**
                 * @type {wysiwyg.editor.managers.preview.MultipleViewersHandler}
                 * @private
                 */
            this._multiViewersHandler = multiViewersHandler;
            this.resources.W.Commands.registerCommandAndListener('PreviewIsReady', this, this.saveStructureOnSiteLoad, null, true);
            this.resources.W.Commands.registerCommandAndListener('PageLoaded', this, this.updateLastSavedStructureOnPageLoad, null, true);
        },

            /**
         *
         * @param backgroundSave
         * @returns {{}}
         */
        getChangedFullSiteStructure: function(backgroundSave){
            var currentStructure;
            if(backgroundSave){
                currentStructure = this.getStructureForBackgroundSave();
            }else{
                currentStructure = this.getFullSiteStructureUpdateSecondary();
            }

            this._saveCandidate = currentStructure;
            var previousStructure = this._lastSavedStructure;
            var structure = {};

            structure.updatedPages   = _.filter(currentStructure.pages, function(page){
                var pageId = page.id;
                return page && !_.isEqual(currentStructure.pages[pageId], previousStructure.pages[pageId]);
            });

            structure.deletedPageIds = _.filter(_.keys(previousStructure.pages), function(pageId){
                return  !currentStructure.pages[pageId];
            });

            var deletedPagesThatWereNotDeletedByUser = _.difference(structure.deletedPageIds, this._multiViewersHandler.getDeletedPageIds());
            if (deletedPagesThatWereNotDeletedByUser.length) {
                LOG.reportError(wixErrors.DELETED_PAGES_NOT_DELETED_BY_USER, 'FullStructureSerializer', 'getChangedFullSiteStructure', deletedPagesThatWereNotDeletedByUser);

                if (W.Experiments.isExperimentOpen('BlockWixDeletingPages')) {
                    this.restorePagesThatWereNotDeletedByUser(deletedPagesThatWereNotDeletedByUser, structure);
                }
            }

            if (_.isEqual(previousStructure.masterPage, currentStructure.masterPage)){
                structure.masterPage = null;
            } else {
                structure.masterPage = currentStructure.masterPage;
            }

            return structure;
        },

        restorePagesThatWereNotDeletedByUser: function (deletedPagesThatWereNotDeletedByUser, structure) {
            structure.deletedPageIds = _.xor(deletedPagesThatWereNotDeletedByUser, structure.deletedPageIds);
            LOG.reportError(wixErrors.BLOCKED_DELETION_OF_MISSING_PAGES, 'FullStructureSerializer', 'restorePagesThatWereNotDeletedByUser', deletedPagesThatWereNotDeletedByUser);
        },

        getStructureForBackgroundSave:function(){
            var types = Constants.ViewerTypesParams.TYPES;
            var mainStructure = this._multiViewersHandler.getSerializedStructure(types.DESKTOP);
            _.forOwn(types, function(viewerName){
                if(this._multiViewersHandler.isMainPreview(viewerName)){
                    return true;
                }
                var secondaryStructure = W.Preview._multipleViewersHandler._viewersInfo[viewerName].siteStructureSerializer._getSerializedStructure() ||
                    W.Preview._multipleViewersHandler.getViewerStructure(viewerName) ||
                    null;

                this._addSecondaryStructureToMain(mainStructure, secondaryStructure);
            }, this);

            return mainStructure;
        },

        saveStructureOnSiteLoad: function(){
            //take from data resolver
            var serializedStructure = this._getFullSiteStructureAtLoadTime();
            this._lastSavedStructure = _.cloneDeep(serializedStructure);
        },

        saveStructureOnSuccessfulSave: function(){
            this._lastSavedStructure = this._saveCandidate;
        },

        /**
         * returns the site structure for first save
         * @returns {Object}
         */
        getFullSiteStructureForFirstSave: function(){
            this._saveCandidate = this.getFullSiteStructureUpdateSecondary();
            return this._saveCandidate;
        },

        /**
         * will return the full structure, after merging the desktop (main) structure to the mobile (secondary)
         * @returns {Object} {pages: Object, masterPage: Object}
         */
        getFullSiteStructureUpdateSecondary: function(){
            var types = Constants.ViewerTypesParams.TYPES;
            var mainStructure = this._multiViewersHandler.getSerializedStructure(types.DESKTOP);
            _.forOwn(types, function(viewerName){
                if(this._multiViewersHandler.isMainPreview(viewerName)){
                    return true;
                }
                this._multiViewersHandler._saveSecondaryStructure_(viewerName);

                try {
                    var secondaryStructure = this._multiViewersHandler.getUpdatedSecondarySerializedStructure(viewerName, mainStructure);
                }
                catch (err) {
                    if (err.type == 'CONVERSION_ALGORITHM_FAILED') {
                        secondaryStructure = null;
                        LOG.reportError(wixErrors.UNKNOWN_CONVERSION_ALGO_CRASH_WHILE_SAVING, 'getFullSiteStructureUpdateSecondary', '', err.stack);

                    }
                    else if (err.type == 'MERGE_ALGORITHM_FAILED') {
                        secondaryStructure = this._multiViewersHandler.getViewerStructure(viewerName);
                        LOG.reportError(wixErrors.UNKNOWN_MERGE_ALGO_CRASH_WHILE_SAVING, 'getFullSiteStructureUpdateSecondary', '', err.stack);
                    }
                }

                this._addSecondaryStructureToMain(mainStructure, secondaryStructure);

            }, this);

            return mainStructure;
        },

        /**
         * will return the full structure as it is in the dom at the moment
         * @returns {Object} {pages: Object, masterPage: Object}
         * @private
         */
        _getFullSiteStructureAtLoadTime: function(){
            var types = Constants.ViewerTypesParams.TYPES;
            var mainStructure = this._multiViewersHandler.getSerializedStructure(types.DESKTOP);
            _.forOwn(types, function(viewerName){
                if(this._multiViewersHandler.isMainPreview(viewerName)){
                    return true;
                }
                var secondaryStructure = this._multiViewersHandler._getStructureFromServer_(viewerName);
                this._addSecondaryStructureToMain(mainStructure, secondaryStructure);
            }, this);

            return mainStructure;
        },

        _addSecondaryStructureToMain: function(mainStructure, secondaryStructure){
            if(!secondaryStructure){
                return mainStructure;
            }
            mainStructure.masterPage.mobileComponents =  secondaryStructure.masterPage.children;
            var mainPages = mainStructure.pages;
            _.forOwn(secondaryStructure.pages, function(secondaryPage){
                var pageId = secondaryPage.id;
                mainPages[pageId].mobileComponents = secondaryPage.components;
            });
            return mainStructure;
        },

        updateLastSavedStructureOnPageLoad: function(pageId) {
            if (this._lastSavedStructure.pages[pageId]) {
                return;
            }
            var serializedPageStructure = this._getPageStructure(pageId);
            this._lastSavedStructure.pages[pageId] = serializedPageStructure;
        },

        _getPageStructure: function(pageId) {
            var types = Constants.ViewerTypesParams.TYPES;
            var mainStructurePage = this._multiViewersHandler.getSerializedStructure(types.DESKTOP).pages[pageId];
            _.forOwn(types, function(viewerName){
                if(this._multiViewersHandler.isMainPreview(viewerName)){
                    return true;
                }
                var secondaryStructurePage = this._multiViewersHandler.getSerializedStructure(types.MOBILE).pages[pageId];
                this._addSecondaryPageStructureToMain(mainStructurePage, secondaryStructurePage);
            }, this);

            return mainStructurePage;
        },

        _addSecondaryPageStructureToMain: function(mainStructurePage, secondaryStructurePage) {
            if(!secondaryStructurePage){
                return mainStructurePage;
            }
            mainStructurePage.mobileComponents = secondaryStructurePage.components;
            return mainStructurePage;
        }
    });
});