/**
 * @class wysiwyg.viewer.components.ItunesButton
 */
define.component('wysiwyg.viewer.components.ItunesButton', function (componentDefinition) {

    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.traits(["wysiwyg.viewer.components.traits.CustomPreviewBehavior"]);

    def.dataTypes(['ItunesButton']);

    def.propertiesSchemaType('ItunesButtonProperties');

    def.resources(['W.Config']);

    def.skinParts({
        downloadButton: { type: 'htmlElement' },
        itunesImg: { type: 'htmlElement' }
    });

    def.statics({
        _useWidthOverMinWidth: true,
        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: false
            }
        }
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);

            this._resizableSides = [
                Constants.BaseComponent.ResizeSides.LEFT,
                Constants.BaseComponent.ResizeSides.RIGHT
            ];

            this._sizeLimits = {
                minW: 110,
                minH: 40,
                maxW: 400,
                maxH: 145
            };

            this.supportsSVG = (Modernizr.svg);
            var imageType = (this.supportsSVG) ? 'svg' : 'png';
            var imageBasePath = this.resources.W.Config.getServiceTopologyProperty('staticThemeUrlWeb') + '/viewer/ItunesButton/';
            var imageName = 'iTunesBtn_{{langCode}}.';
            this.imageBaseUrl = imageBasePath + imageName + imageType;
        },

        isPartiallyFunctionalInStaticHtml: function(){
            return true;
        },

        _onRender: function (renderEvent) {
            var invalidations = renderEvent.data.invalidations;
            var data = this.getDataItem();
            var properties = this.getComponentProperties();
            var langCode = properties.get('language');
            this.target = properties.get('openIn');
            this.downloadUrl = data.get('downloadUrl');

            this._setImgSrcByLang(langCode);

            if (invalidations.isInvalidated([
                this.INVALIDATIONS.FIRST_RENDER
            ])) {
                this._skinParts.downloadButton.addEvent('click', this._clickHandler.bind(this));

                //In viewer - give the component actual height (not just min-height)
                //This solves problems in Android & Safari browsers
                if(this.resources.W.Config.env.$isPublicViewerFrame) {
                    this._view.setStyle('height', this.getHeight() + 'px');
                }
            }

            this._createClickOverlayForPreviewMode('ItunesButton_CustomPreviewBehavior_ttid');
        },

        _clickHandler: function () {
            if(!this.downloadUrl) {
                return;
            }

            if (this.target === '_blank') {
                this._navigateInNewTab(this.downloadUrl);
            }
            else {
                this._navigateInSameWindow(this.downloadUrl);
            }
        },

        _navigateInNewTab: function(url){
            var form = document.createElement("form");
            form.setAttribute("action", url);
            form.setAttribute("method", "GET");
            form.setAttribute("target", "_blank");
            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);
        },

        _navigateInSameWindow: function navigateInSameWindow(downloadUrl) {
            window.location.href = downloadUrl;
        },

        _setImgSrcByLang: function setImgByLang(langCode) {
            var url = this.imageBaseUrl.replace('{{langCode}}', langCode.toUpperCase());  //Server saves data in lowercase, image file name is in uppercase
            this._skinParts.itunesImg.setAttribute('src', url);
        },

        setWidth: function (width){
            var calculatedHeight = Math.round(width/2.75);
            this.parent(width);
            this.setHeight(calculatedHeight);
        }
    });
});