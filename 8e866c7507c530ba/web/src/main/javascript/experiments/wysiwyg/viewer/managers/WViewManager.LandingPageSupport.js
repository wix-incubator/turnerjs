define.experiment.Class('wysiwyg.viewer.managers.WViewManager.LandingPageSupport', function (def, strategy) {

    def.traits(strategy.merge(['core.events.EventDispatcher']));
    def.utilize(strategy.merge(['wysiwyg.viewer.utils.TransitionUtils']));

    def.methods({
        initialize: strategy.after(function(){
            this.resources.W.Commands.registerCommandAndListener('Viewer.ToggleLandingPageMode', this, this._onToggleLandingPageMode);
            this._transitionUtils = new this.imports.TransitionUtils();
            this._Tween = this.resources.W.Utils.Tween;
        }),

        /**
         * The reason this is written declaratively from the viewer instead of the components listening,
         * is because of the editor, where two components exist simultaneously (mobile and desktop), and causes bugs.
         * This is the cleanest solution.
         * @param {{toLanding: boolean, isFirstLoad: boolean}} params
         * @private
         */
        _onToggleLandingPageMode: function(params){
            var toLanding = params.toLanding;
            this._toggleMasterPageComponentsVisibility(toLanding);
            //not caching, since if we're in the editor, the viewer will get the correct components every time (be it mobile or desktop)
            var compsToToggle = [
                this.getPagesContainer().$logic,
                this.getHeaderContainer().$logic,
                this.getFooterContainer().$logic
            ];

            if(params.isFirstLoad){
                _.invoke(compsToToggle, 'toggleLandingPageMode', toLanding); //we don't want to animate on site load, we want it to immediately appear in the right position
            }else {
                _.invoke(compsToToggle, 'toggleLandingPageMode', toLanding, this._Tween);
            }

        },

        /**
         *
         * @param {boolean} isToLanding
         * @private
         */
        _toggleMasterPageComponentsVisibility: function(isToLanding){
            var masterPageComponents = this._getTopLevelMasterPageComponents();
            _.forEach(masterPageComponents, function(node){
                if(isToLanding){ //we don't use toggleCollapsed() because we want to explicitly choose the state
                    node.collapse();
                }else{
                    node.uncollapse();
                }
            });
        },

        /**
         *
         * @returns {Element[]} array of master-page level components' viewNodes
         * @private
         */
        _getTopLevelMasterPageComponents: function(){
            return _.filter(this.getSiteNode().getChildren(), function(node){
                return node.$logic.getComponentId() !== 'PAGES_CONTAINER'; //we don't use the dom, so this should work for mobile too (no prefix)
            });
        },

        /**
         *
         * @returns {boolean}
         */
        isCurrentPageLandingPage: function(){
            var pageGroup = this.getPageGroup();
            return pageGroup && pageGroup.isCurrentPageLandingPage();
        },

        _initSiteView: strategy.after(function(){
            this.once('SiteReady', this, this._setSiteToVisible);
        }),

        /**
         *
         * @private
         */
        _setSiteToVisible: function(){
            if(this.isCurrentPageLandingPage()){
                this.resources.W.Commands.executeCommand('Viewer.ToggleLandingPageMode', {toLanding: true, isFirstLoad: true});
            }
            this.getSiteNode().setOpacity(1);
            this._fixHtmlEmbedsHackForMobile();
        },

        _fixHtmlEmbedsHackForMobile: function(){
            if(window.MobileUtils && window.MobileUtils.isMobile()){
                $$('.hiddenTillReady').setStyle('display','none'); //not enough to fix the problem in the head
            } else {
                $$('.hiddenTillReady').removeClass('hiddenTillReady');
            }
        }
    });
});
