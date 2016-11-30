define.experiment.component('wysiwyg.viewer.components.MobileMediaZoomDisplayer.ExitMobileMode', function(componentDefinition, experimentStrategy){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;
    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.methods({
        _setZoomModeFontSize: function () {
//            this._mobileConfig.calculateInitZoom();
            this._mobileConfig._deviceInitZoom = this._initZoom = this._mobileConfig.getMobileScreenWidth() / document.body.offsetWidth;
            var ratio = this._isMobilePreviewMode ? 1 : this._initZoom / this._mobileConfig.getZoom();
            var fontMultiplier;
            switch (this.getState('displayDevice')) {
                case 'desktop' :
                    fontMultiplier = (this._mobileConfig.isMobile() && window.publicModel.adaptiveMobileOn) ? this.FONT_MULTIPLIER.MOBILE_SITE : this.FONT_MULTIPLIER.DESKTOP_SITE;
                    break;
                case 'tablet':
                    fontMultiplier = this.FONT_MULTIPLIER.TABLET_SITE;
                    break;
                case 'mobile':
                    fontMultiplier = this.FONT_MULTIPLIER.MOBILE_SITE;
                    break;
                default:
                    fontMultiplier = this.FONT_MULTIPLIER.DESKTOP_SITE;
                    break;
            }

            var zoomModeFontSize = fontMultiplier * ratio;
            if (this._mobileConfig.isPortrait()) {
                zoomModeFontSize = zoomModeFontSize * this._fontSizeCorrectionWhenOpenZoomInPortrait;
            }

            this._view.setStyle('font-size', zoomModeFontSize + 'px');
        }
    });

});
