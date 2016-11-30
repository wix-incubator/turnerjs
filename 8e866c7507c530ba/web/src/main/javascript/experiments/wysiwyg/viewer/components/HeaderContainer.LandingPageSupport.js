define.experiment.component('wysiwyg.viewer.components.HeaderContainer.LandingPageSupport', function(def){

    def.methods({
        /**
         *
         * @param {boolean} isToLanding
         * @param {bootstrap.utils.Tween} [tween] - tweener, will not be passed if loading site on a landing page
         */
        toggleLandingPageMode: function(isToLanding, tween){
            if(isToLanding){
                this._serializedY = this.getY();
                var height = this.getHeight();
                if(tween){
                    tween.to(this.$view, 1, { 'top': -height, ease: 'strong_easeIn', onComplete: this.$view.setStyle.bind(this.$view, 'top', -height)});
                } else {
                    this.$view.setStyle('top', -height);
                }
            } else{
                tween.to(this.$view, 1, { 'top': this._serializedY, ease: 'strong_easeIn', onComplete: this.setY.bind(this, this._serializedY)});
                delete this._serializedY;
            }
        },

        _getSerializedY: function(){
            return (typeof this._serializedY === 'number') ? this._serializedY : this.getY();
        }
    });
});