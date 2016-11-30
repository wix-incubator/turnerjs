define.experiment.Class('wysiwyg.viewer.managers.LayoutManager.LandingPageSupport', function(def, strategy){

    def.methods({
        _measureInvalidatedComps: function (comp) {
            // ****** only change. No need to measure something that's not displayed ****** //
            if(!comp.getIsDisplayed()){
                return;
            }
            //***** end of only change ******//

            if (!comp.NEW_BASE_COMP && comp.isMeasureNeeded()) {
                comp.measure();
            }
            if (!comp.getChildComponents) {
                return;
            }
            var childComps;
            if (comp.getCurrentChildren) {
                childComps = comp.getCurrentChildren();
            } else {
                childComps = comp.getChildComponents();
            }
            for (var i = 0; i < childComps.length; i++) {
                if (childComps[i].$logic && childComps[i].$alive) {
                    this._measureInvalidatedComps(childComps[i].$logic);
                }
            }
        },

        _getLayoutRootComp: function(){
            if(W.Viewer.isCurrentPageLandingPage()){
                return W.Viewer.getPagesContainer().$logic;
            }
            return W.Viewer.getSiteNode().$logic;
        },
        recalculateSiteHeight: function(){
            var siteStructure = W.Viewer.getSiteNode().$logic,
                currentHeight = siteStructure.getHeight(),
                minHeight = this.getComponentMinResizeHeight(siteStructure);
            if(currentHeight !== minHeight){
                siteStructure.setHeight(minHeight);
            }
        },

        _enforceAnchorsRecurse:function(comp) {
            var childComps;
            if(!comp.getChildComponents){
                return;
            }
            if(comp.getCurrentChildren) {
                childComps = comp.getCurrentChildren();
            } else {
                childComps = comp.getChildComponents();
            }
            var changed = [];
            var heightChangedByChildren = false;
            for(var i=0;i<childComps.length;i++) {
                if(childComps[i].$logic && childComps[i].$alive) {
                    heightChangedByChildren = this._enforceAnchorsRecurse(childComps[i].$logic);
                    if(heightChangedByChildren || childComps[i].$logic.wasHeightChanged()) {
                        childComps[i].$logic.validateHeight();
                        changed.push(childComps[i].$logic);
                    }
                }
            }
            if (changed.length == 0) {
                return false;
            }

            return this.enforceAnchors(changed, false, undefined, undefined, true);
        }
    });

});