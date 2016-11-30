/**
 * @class wysiwyg.viewer.components.FacebookShare
 */
define.component('wysiwyg.viewer.components.FacebookShare', function (componentDefinition) {

    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.traits(["wysiwyg.viewer.components.traits.CustomPreviewBehavior"]);

    def.dataTypes(['FacebookShareButton']);

    def.resources(['W.Utils', 'W.Viewer']);

    def.skinParts({
        facebookShareButton: { type: 'htmlElement' }
    });

    def.statics({
        EDITOR_META_DATA:{
            general: {
                settings: true,
                design: false
            },
            mobile: {
                allInputsHidden: true
            }
        }
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._resizableSides = [];
        },

        _onRender: function (renderEvent) {
            var invalidations = renderEvent.data.invalidations,
                data,
                shareButtonLabel,
                shareButtonElement;

            if (invalidations.isInvalidated([
                this.INVALIDATIONS.SKIN_CHANGE,
                this.INVALIDATIONS.DATA_CHANGE]
            )){
                shareButtonElement = this._skinParts.facebookShareButton;

                this._createClickOverlayForPreviewMode('Social_Widgets_Only_On_Public');
                this._setShareButtonLabelText();

                shareButtonElement.addEvent('click', function (ev) {
                    this.resources.W.Utils.openPopupWindow(this._getUrlToBeShared(), 'wix_share_to_facebook', 'width=635,height=346,scrollbars=no,status=no,toolbar=no,menubar=no,location=no');
                }.bind(this));
            }
        },

        _getUrlToBeShared: function(){
            var data = this.getDataItem(),
                urlToBeShared = data.get('urlChoice') === 'Site' ? this.getSiteUrl() : this.getCurrentPageUrl();

            return 'http://www.facebook.com/sharer.php?u=' + encodeURIComponent(urlToBeShared);
        },

        getSiteUrl: function () {
            return window.publicModel ? window.publicModel.externalBaseUrl : '';
        },

        getCurrentPageUrl: function () {
            return window.location.href;
        },

        isPartiallyFunctionalInStaticHtml: function(){
            return true;
        },

        _setShareButtonLabelText: function () {
            var labelValue = this.getDataItem().get('label');
            this._skinParts.label.set('html', labelValue);
            if(labelValue === '') {
                this._skinParts.label.setStyle('display', 'none');
                this._skinParts.icon.setStyle('border-width', '0');
            }
            else {
                this._skinParts.label.setStyle('display', '');
                this._skinParts.icon.setStyle('border-width', '1px');
            }
        }
    });
});