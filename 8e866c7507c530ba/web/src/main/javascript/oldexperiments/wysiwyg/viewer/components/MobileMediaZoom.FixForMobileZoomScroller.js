define.experiment.component('wysiwyg.viewer.components.MobileMediaZoom.FixForMobileZoomScroller', function (componentDefinition, experimentStrategy){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    var strategy = experimentStrategy;

    def.resources(strategy.merge(['W.Utils']));

    def.methods({
        _getDisplayerCallback: function (htmlElement) {
            if (!htmlElement.getParent('[skinpart="virtualContainer"]')) {
                htmlElement.insertInto(this._skinParts.virtualContainer);
            }
            this._changeImageNoTransition(htmlElement);
            if (document.body.getAttribute('preview') !== 'edit') {
                if (this._enableZoomScroll) {
                    document.body.addClass("wixappsFullScreenMode");

                    window.setTimeout(function () {
                        var windowWidth = this.resources.W.Utils.getWindowSize().width;
                        htmlElement.getLogic().setWidth(windowWidth);
                    }.bind(this), 10);


                    this._view.setStyles({position: 'absolute', top: 0});
                    this._skinParts.blockingLayer.setStyles({position: 'static', 'overflow-x': 'hidden'});

                    // in old browsers (native on s2,s3), the bar is hiding the zoom, so we're closing it
                    if (window.WQuickActions && this._mobileConfig.isAndroidOldBrowser()) {
                        window.WQuickActions.hideBar();
                    }
                }
                window.scrollTo(0, 0);

                var params = {
                    height: this._skinParts.blockingLayer.getHeight(),
                    top: 0
                };
                this.resources.W.Commands.executeCommand('WPreviewCommands.resetCustomScrollbar', params);
            }

            this._currentDisplayer = htmlElement.getLogic();
        }
    });

});
