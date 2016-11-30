/**@class wysiwyg.viewer.managers.viewer.ViewerStaticLoadingHandler */
define.Class('wysiwyg.viewer.managers.viewer.ViewerStaticLoadingHandler', function(classDefinition){
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.inherits("bootstrap.utils.Events");

    def.utilize(['wysiwyg.viewer.managers.viewer.ViewerDomDisplayReadyEventsCollector']);

    def.statics({
        'EVENTS':{
            'SITE_REPLACED_STATIC_HTML':'siteReplacedStaticHtml'
        }
    });

    def.binds(['_cleanupStaticElements', '_onAllDomDisplayReady', '_onNeverDomDisplayReady']);

    def.methods({
        initialize: function(viewer){
            this._viewer = viewer;
            this._domDisplayReadyEventsCollector = new this.imports.ViewerDomDisplayReadyEventsCollector(wixErrors.STATIC_HTML_REPLACEMENT_DELAY, function(node){});
        },

        replaceStaticHtmlWithActualSite: function(){
            this._domDisplayReadyEventsCollector._waitForDomDisplayReady(5000)
                .then(this._onAllDomDisplayReady, this._onNeverDomDisplayReady);
        },

        _onAllDomDisplayReady: function(){
            this._cleanupStaticElements();
        },

        _cleanupStaticElements: function(){
            this._removeFarAwayPage();

            var headElements = document.head.getChildren("[id^=" + Constants.ViewerTypesParams.DOM_ID_STATIC_PREFIX + "]");
            var bodyElements = document.body.getChildren("[id^=" + Constants.ViewerTypesParams.DOM_ID_STATIC_PREFIX + "]");
            //we search only for static direct children of body and head
            //(all site structure's inner elements should have been removed before)

            var staticElements = headElements.concat(bodyElements);
            var elementsIdsNotToRemove = [Constants.ViewerTypesParams.DOM_ID_STATIC_PREFIX + "mobile_bgNode",
                Constants.ViewerTypesParams.DOM_ID_STATIC_PREFIX + "mobileBgNode"] ;
            _.forEach(staticElements, function(elementToRemove){
                var elementId = elementToRemove.getAttribute('id');
                if (!_.contains(elementsIdsNotToRemove, elementId)){
                    //we don't remove the static bgNode because of bug #MOB-1223 --> the removal of bgNode with height turns
                    // the scroll back to the top position, so we just turn it to display:none
                    elementToRemove.parentNode.removeChild(elementToRemove);
                } else {
                    elementToRemove.setStyle('display', 'none');
                }
            });

            this.fireEvent(this.EVENTS.SITE_REPLACED_STATIC_HTML);
        },

        _removeFarAwayPage: function(){
            var id = Constants.ViewerTypesParams.DOM_ID_STATIC_PREFIX + this._viewer.getSiteNode().getAttribute('id');
            var elementToReplace = document.getElementById(id);
            if (elementToReplace){
                elementToReplace.parentNode.replaceChild(this._viewer.getSiteNode(),elementToReplace);
                this._viewer.getSiteNode().removeClass('farAwayNode');
            }
        },

        _onNeverDomDisplayReady: function(){
            this._domDisplayReadyEventsCollector._onNeverDomDisplayReady();
            this._cleanupStaticElements(); //cleanup anyway
        }
    });

});
