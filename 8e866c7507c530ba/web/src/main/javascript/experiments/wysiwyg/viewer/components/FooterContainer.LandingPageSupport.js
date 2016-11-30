/**
 * @class wysiwyg.viewer.components.FooterContainer
 */
define.experiment.component('wysiwyg.viewer.components.FooterContainer.LandingPageSupport', function(def){

    def.methods({
        toggleLandingPageMode: function(isToLanding){
            if(isToLanding){
                this._serializedHeight = this.getHeight();
                this.setHeight(this.MINIMUM_HEIGHT_DEFAULT);
            } else{
                this.setHeight(this._serializedHeight);
                delete this._serializedHeight;
            }
        },
        _getSerializedHeight: function(){
            return (typeof this._serializedHeight === 'number') ? this._serializedHeight : this.getHeight();
        }
    });
});