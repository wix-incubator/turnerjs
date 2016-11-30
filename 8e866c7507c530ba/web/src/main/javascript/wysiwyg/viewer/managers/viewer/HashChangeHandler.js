/**
 * @class wysiwyg.viewer.managers.viewer.HashChangeHandler
 */
define.Class('wysiwyg.viewer.managers.viewer.HashChangeHandler', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.binds(['_onHashChange']);

//   circular ref  'W.Apps'
    def.resources(['W.Utils', 'W.Config', 'W.Commands', 'W.Data']);

    /** @lends wysiwyg.viewer.managers.viewer.HashChangeHandler */
    def.methods({
        //I think that this class should be a viewer member and get the zoom and site members
        //the other option is trait and then it accesses the original class
        initialize: function(viewer, zoomHandler, siteMembersHandler){
            this._viewer = viewer;
            this._zoomHandler = zoomHandler;
            this._siteMembersHandler = siteMembersHandler;

            this.resources.W.Utils.hash.addEvent('change', this._onHashChange);
        },

        _onHashChange: function (event) {
            event = event || {};

            //hash change event is fired twice, first time might not be with the old hash value
            if (!this._viewer.isSiteReady()) {
                return;
            }

            var dataItemId = event.newHash;
            var extData = event.extData;
            var idChanged = event.isIdChanged;
            var extDataChanged = event.isExtraDataChanged;
            var silent = event.silent;

            var isZoomOpened = this._zoomHandler.isZoomOpened();
            var isImageZoomLegacy = dataItemId === 'zoom';

            if (!isImageZoomLegacy && !W.Data.isDataAvailable('#' + dataItemId)) {
                dataItemId = this._viewer.getHomePageId();
            }

            if (idChanged && !silent && dataItemId) {
                if (dataItemId === 'zoom') {
                    dataItemId = extData.split('/')[1];
                }
                W.Data.getDataByQuery('#' + dataItemId, function (data) {
                    this._onHashDataItemIdChange(dataItemId, data);
                }.bind(this));

                if (event.isForSureAfterChange) {
                    LOG.reportPageEvent(window.location.href);
                }
            }

            var pageId = this._viewer.getCurrentPageId();
            if (extDataChanged) {
                if (isZoomOpened) {
                    this._zoomHandler.showItemInOpenedZoom();
                } else if(pageId) {
                    this._viewer._activeViewer_._onPageExtraDataChange_(extData, pageId, silent);
                    this._viewer.fireEvent("hashExtraDataChanged", {
                        extData: extData,
                        pageId: pageId,
                        silent: silent
                    });
                }
            }
        },


        _onHashDataItemIdChange: function (dataItemId, data) {
            var dataType = data.getType && data.getType();

            if (this.isPageDataType(dataType) && dataItemId) {
                this._changePageFromHash(data);
                return;
            }

            if (dataType === 'Image') {
                this.resources.W.Commands.executeCommand('WViewerCommands.OpenZoom', {
                    'item': '#' + data.get('id'),
                    'getDisplayerDivFunction': this._zoomHandler.getDefaultGetZoomDisplayerFunction('Image')//,
                }, this);
            }

            else if (dataType === 'PermaLink' && data.get('appType') === 'ListsApps') {
                W.Apps.openPermaLink(data);
            }
        },

        isPageDataType: function (dataType) {
            return (dataType === 'Page' || dataType == "AppPage");
        },

        _changePageFromHash: function (nextPageData) {
            if (nextPageData === null || !this._isPageVisible(nextPageData)) {
                return;
            }
            // Check that next page is difference then current or falsy
            var nextPageId = nextPageData.get("id");
            if (nextPageId === this._viewer.getCurrentPageId()) {
                return;
            }

            this._siteMembersHandler.checkRequireLogin(nextPageData, function () {
                // Change page
                if (nextPageId) {
                    if (this.resources.W.Config.env.$isEditorViewerFrame ) { //this should only be fired when we're in the editor/preview. not when users of users are viewing a site...
                        LOG.reportEvent(wixEvents.USER_MOVED_BETWEEN_PAGES, {c1: (nextPageData._data && nextPageData._data.pageUriSEO) || 'no-page-url'});
                    }
                    this._viewer._setCurrentPageId_(nextPageId);
                    this._viewer._activeViewer_.changePageWithTransition(nextPageId);
                    W.Commands.executeCommand("WViewerCommands.SelectedPageChanged", nextPageId);
                }
            }.bind(this),true);
        },

        _isPageVisible: function(pageData){
            return !pageData.getMeta('isHidden') || this.resources.W.Config.env.$isEditorViewerFrame;
        },

        _setUrlHashToPage: function (pageId, extData, silentChangeEvent) {
            silentChangeEvent = !!silentChangeEvent; // convert to real boolean because setHash does === true

            var newPageData = this._viewer.getPageData(pageId);

            if (newPageData) {
                this.resources.W.Utils.hash.setHash(pageId, newPageData.get('pageUriSEO'), extData, silentChangeEvent);
            }
        }
    });
});
