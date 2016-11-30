/**@class wysiwyg.editor.components.traits.NavigationButtonPageUtils*/
define.experiment.newClass('wysiwyg.editor.components.traits.NavigationButtonPageUtils.SiteNavigationRefactor', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.resources(['W.Commands', 'W.Preview', 'W.Config']);

    def.methods({
        _isPageVisible: function(pageId) {
            var pageDataItem = this._getPageDataItem(pageId),
                mode = this.resources.W.Config.env.$viewingDevice;

            switch (mode){
                case Constants.ViewerTypesParams.TYPES.MOBILE:
                    return !pageDataItem.get('mobileHidePage');
                case Constants.ViewerTypesParams.TYPES.DESKTOP:
                    return !pageDataItem.get('hidePage');
                default:
                    return true;
            }
        },

        _getPageDataItem: function(pageId) {
            return this.resources.W.Preview.getPreviewManagers().Data.getDataByQuery(pageId);
        },

        _isHomepage: function(pageId) {
            var homepageId = this._getCurrentHomepageId().replace('#', '');

            pageId = pageId.replace('#', '');

            return pageId === homepageId;
        },

        _getCurrentHomepageId:function () {
            return this._getSiteStructure().get('mainPage');
        },

        _getSiteStructure:function () {
            return this.resources.W.Preview.getPreviewManagers().Data.getDataMap().SITE_STRUCTURE;
        }
    });
});