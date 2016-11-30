define.experiment.component('wysiwyg.viewer.components.WSiteStructure.LesserWidthIssue', function (def) {
    def.methods({
        _createDesktopBackgroundNode: function () {
            var bgNodeAttributes = {
                'id': 'desktopBgNode',
                'comp': 'wysiwyg.viewer.components.background.DesktopBackground',
                'skin': 'wysiwyg.viewer.skins.background.BackgroundSkin',
                'min-width': this.resources.W.Viewer.getDocWidth() + "px"
            };
            this._bgNode = this._createBgNode(bgNodeAttributes);
        }
    });
});
