define.component('wysiwyg.viewer.components.FooterContainer', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.viewer.components.SiteSegmentContainer");
    def.traits(['wysiwyg.viewer.components.traits.FixedComponentTrait']);
    def.binds(['_adjustPositionForWixAds']);

    def.methods({
        applyPos: function(optionalOverride){
            this._applyLayoutPosition_(optionalOverride);
            var position = optionalOverride || this.getLayoutPosition();
            var isMobile = W.Config.env.isViewingMobileDevice();
            if(position === "fixed" && !isMobile){
                this._setBottomPosition();
            }else{
                this._unsetBottomPosition();
            }
        },

        _setBottomPosition: function(){
            this.$view.addClass('fixedPosition');
            var adContainer = window.$$('[comp=\"wysiwyg.viewer.components.WixAds\"]')[0],
                hasAds = !!adContainer;
            if(hasAds){
                var adLogic = adContainer.$logic;
                if(adLogic){
                    this._adjustPositionForWixAds(adLogic);
                } else{
                    adContainer.addEvent('ready',this._adjustPositionForWixAds);
                }
            } else{
                this.$view.setStyle('bottom', '0px');
            }
        },

        _adjustPositionForWixAds: function(adComponent){
            var adHeight = adComponent.getAdHeight();
            this.$view.setStyle('bottom', adHeight.footer + 'px');
        },

        _unsetBottomPosition: function(){
            this.$view.setStyle('bottom', 'auto');
        }

    });
});