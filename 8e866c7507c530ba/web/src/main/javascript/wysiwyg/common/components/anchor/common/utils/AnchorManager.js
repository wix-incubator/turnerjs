/**@class wysiwyg.common.utils.AnchorManager*/
define.Class('wysiwyg.common.utils.AnchorManager', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.utilize([
        'wysiwyg.common.utils.ScrollAnimation'
    ]);

    def.resources(['W.Commands', 'W.Data']);

    def.binds(['_scrollToLocation']);

    def.statics({
        SCROLL_DURATION_MS: 700
    });

    /**@lends wysiwyg.common.utils.AnchorManager*/
    def.methods({
        initialize: function(viewerManager){
            /**@type wysiwyg.common.utils.ScrollAnimation*/
            this._scrollAnimation = new this.imports.ScrollAnimation();
            this.resources.W.Commands.registerCommandAndListener("WViewerCommands.SamePageScrollAnchor", this, this._scrollToLocation);
            this.resources.W.Commands.registerCommandAndListener("WViewerCommands.PageChangeComplete", this, this._scrollToLocation);

            this._viewerManager = viewerManager;
        },
        increaseNumberOfAnchors: function(){
            if(!this._numberOfAnchors){
                this._numberOfAnchors = 0;
            }
            this._numberOfAnchors++;
        },
        getNumberOfAnchors: function(){
            return this._numberOfAnchors || 0;
        },
        /**
         * 1. Get "anchorDataId" from sessionStorage.
         * 2. Calculate the specific Y offset related to that "anchorDataId".
         * 3. Do the actual scrolling with animation to the Y offset.
         * 4. Clear the sessionStorage from "anchorDataId"
         *
         * @returns {promise}
         * @private
         */
        _scrollToLocation: function(){
            var location,
                sessionStorageAnchorDataId = sessionStorage.getItem('anchorDataId'),
                animationPromise;

            if(!sessionStorageAnchorDataId){
                return null;
            }

            if(sessionStorageAnchorDataId === 'SCROLL_TO_TOP'){
                location = 0;
            } else if(sessionStorageAnchorDataId === 'SCROLL_TO_BOTTOM'){
                location = document.body.scrollHeight;
            } else {
                location = this._calculateAnchorYOffset(sessionStorageAnchorDataId);
            }

            animationPromise = this._scrollAnimation.smoothScrollTo(location, this.SCROLL_DURATION_MS);
            sessionStorage.removeItem('anchorDataId');
            return animationPromise;
        },

        _calculateAnchorYOffset: function(anchorDataId){
            var anchorLogic = this._getAnchorLogicByDataId(anchorDataId),
                headerContainer = this._viewerManager.getHeaderContainer().getLogic(),
                isHeaderFixed = headerContainer.isFixedPositioned(),
                isHeaderDisplayed = headerContainer.getIsDisplayed(),
                headerHeight = isHeaderFixed && isHeaderDisplayed ? headerContainer.getHeight() : 0,
                headerTopOffset = isHeaderFixed && isHeaderDisplayed ? headerContainer.getPosition().y : 0,
                anchorTopOffset = headerTopOffset + headerHeight;

            return anchorLogic ? anchorLogic.getGlobalPosition().y - anchorTopOffset : 0;
        },

        _getAnchorLogicByDataId: function(anchorDataId){
            var anchorData = this.resources.W.Data.getDataByQuery('#' + anchorDataId),
                anchorCompId = anchorData ? anchorData.get('compId') : null,
                anchorCompNode = this._viewerManager.getCompByID(anchorCompId),
                anchorCompNodeMobile = this._viewerManager.getCompByID('mobile_' + anchorCompId);

            return anchorCompNode ? anchorCompNode.getLogic() : anchorCompNodeMobile ? anchorCompNodeMobile.getLogic() : null;
        }

    });
});