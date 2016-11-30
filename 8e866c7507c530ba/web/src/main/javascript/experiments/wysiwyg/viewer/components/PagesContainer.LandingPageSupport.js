/**
 * @class wysiwyg.viewer.components.PagesContainer
 */
define.experiment.component('wysiwyg.viewer.components.PagesContainer.LandingPageSupport', function(def){

    def.methods({
        /**
         *
         * @param {boolean} isToLanding
         * @param {bootstrap.utils.Tween} [tween] - tweener, will not be passed if loading site on a landing page
         */
        toggleLandingPageMode: function(isToLanding, tween){
            if(isToLanding){
                this._serializedY = this.getY();
                if(tween){
                    tween.to(this.$view, 1, { 'top': 0, ease: 'strong_easeIn', onComplete: this.setY.bind(this, 0)});
                } else {
                    this.setY(0);
                }

            } else{
                tween.to(this.$view, 1, { 'top': this._serializedY, ease: 'strong_easeIn', onComplete: function(){
                    this.setY(this._serializedY);
                    delete this._serializedY;
                    W.Layout.enforceAnchors([this], true);
                    W.Layout.recalculateSiteHeight();
                }.bind(this)});
            }
        },

        _getSerializedY: function(){
            return (typeof this._serializedY === 'number') ? this._serializedY : this.getY();
        },
        isHorizontallyMovable: function(){
            return !W.Viewer.isCurrentPageLandingPage() && this.parent();
        },
        isVerticallyMovable: function(){
            return !W.Viewer.isCurrentPageLandingPage() && this.parent();
        }
    });
});