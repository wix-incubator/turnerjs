define.experiment.Class('wysiwyg.editor.managers.preview.FullStructureSerializer.NotifyWhenWixDeletesPages', function (classDefinition, experimentStrategy) {
    var def = classDefinition;
    var strategy = experimentStrategy;

    def.methods({
        initialize: function (multiViewersHandler) {
            this._multiViewersHandler = multiViewersHandler;
            this.resources.W.Commands.registerCommandAndListener('PreviewIsReady', this, this.saveStructureOnSiteLoad, null, true);
            this.resources.W.Commands.registerCommandAndListener('PageLoaded', this, this.updateLastSavedStructureOnPageLoad, null, true);

            //*********************** ADDED FOR WOH-10852 *************************************//
            this.resources.W.Commands.registerCommandAndListener('PreviewIsReady', this, this._checkForMissingPageInterval);
            this.resources.W.Commands.registerCommandAndListener("WEditorCommands.WSetEditMode", this, this._onBackFromPreview);
            //*************************************************************************************//
        },

        /**
         *
         * @param backgroundSave
         * @returns {{}}
         */
        getChangedFullSiteStructure: function (backgroundSave) {
            var currentStructure;
            if (backgroundSave) {
                currentStructure = this.getStructureForBackgroundSave();
            } else {
                currentStructure = this.getFullSiteStructureUpdateSecondary();
            }

            this._saveCandidate = currentStructure;
            var previousStructure = this._lastSavedStructure;
            var structure = {};

            structure.updatedPages = _.filter(currentStructure.pages, function (page) {
                var pageId = page.id;
                return page && !_.isEqual(currentStructure.pages[pageId], previousStructure.pages[pageId]);
            });

            structure.deletedPageIds = _.filter(_.keys(previousStructure.pages), function (pageId) {
                return !currentStructure.pages[pageId];
            });

            var deletedPagesThatWereNotDeletedByUser = this._getUnintentionallyDeletedPages(currentStructure, structure.deletedPageIds);
            if (deletedPagesThatWereNotDeletedByUser.length) {
                LOG.reportError(wixErrors.DELETED_PAGES_NOT_DELETED_BY_USER, 'FullStructureSerializer', 'getChangedFullSiteStructure', {
                    p1: deletedPagesThatWereNotDeletedByUser,
                    p2: deletedPagesThatWereNotDeletedByUser.length
                });

                // BlockWixDeletingPages Experiments for WOH-10852
                this.restorePagesThatWereNotDeletedByUser(deletedPagesThatWereNotDeletedByUser, structure);
            }

            if (_.isEqual(previousStructure.masterPage, currentStructure.masterPage)) {
                structure.masterPage = null;
            } else {
                structure.masterPage = currentStructure.masterPage;
            }

            return structure;
        },
        _getUnintentionallyDeletedPages: function (currentStructure, deletedPageIds) {
            var currentStructure = currentStructure || this.getFullSiteStructureUpdateSecondary(),
                previousStructure = this._lastSavedStructure;
            var deletedPageIds = deletedPageIds || _.filter(_.keys(previousStructure.pages), function (pageId) {
                    return !currentStructure.pages[pageId];
                });
            var deletedPagesThatWereNotDeletedByUser = _.difference(deletedPageIds, this._multiViewersHandler.getDeletedPageIds());
            return deletedPagesThatWereNotDeletedByUser;
        },

        _reportWixIsDeletingPages: function () {
            var deletedPagesThatWereNotDeletedByUser = this._getUnintentionallyDeletedPages();
            if (deletedPagesThatWereNotDeletedByUser.length) {
                LOG.reportError(wixErrors.DELETED_PAGES_NOT_DELETED_BY_USER, 'FullStructureSerializer', '_reportWixIsDeletingPages', {
                    p1: deletedPagesThatWereNotDeletedByUser,
                    p2: deletedPagesThatWereNotDeletedByUser.length
                });
                clearInterval(this.errorInterval);
            }
        },

        _checkForMissingPageInterval: function () {
            var minutesToMilliseconds = 60 * 1000,
                minutes = 5;
            this.errorInterval = window.setInterval(this._reportWixIsDeletingPages.bind(this), minutes * minutesToMilliseconds);
        },

        _onBackFromPreview: function (param) {
            if (param && (param.previousEditMode == "PREVIEW")) {
                this._reportWixIsDeletingPages();
            }
        }
    });
});