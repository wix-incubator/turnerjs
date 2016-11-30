define.component('wysiwyg.editor.components.panels.SvgShapePanel', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.resources(['W.Data', 'W.Utils', 'W.Resources', 'W.Editor', 'W.Commands']);
    def.traits(['core.editor.components.traits.DataPanel']);

    def.binds(['_mediaGalleryCallback']);

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
        },

        _createFields: function () {
            var panel = this;

            this.addInputGroupField(function () {
                panel.shapeInput = this.addShapeField(this._translate('SVGSHAPE_SELECT_SKIN'), panel._mediaGalleryCallback, 'panel');
            });

            this.addInputGroupField(function () {
                this.addCheckBoxField(this._translate('SVGSHAPE_MAINTAIN_ASPECTRATIO')).bindToProperty('maintainAspectRatio');
            });

            this.addInputGroupField(function () {
                var proxyInputs = [];

                panel.fillColorSelector = panel.createColorSelector(proxyInputs, this, this._translate('fillcolor'), 'fillcolor');
                panel.strokeSelector = panel.createColorSelector(proxyInputs, this, this._translate('stroke'), 'stroke');
            });

            this.addInputGroupField(function () {
                panel.strokeWidthSlider = this.createSlider(this._translate('strokewidth'), 0, 15, 1, false, 'strokewidth');
            });

            this.addAnimationButton();
        },

        _mediaGalleryCallback: function (rawData) {
            this._previewComponent._mediaGalleryCallback(rawData);
        }
    });

});
