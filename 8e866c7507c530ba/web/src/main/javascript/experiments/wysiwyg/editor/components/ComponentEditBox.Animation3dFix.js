define.experiment.component('wysiwyg.editor.components.ComponentEditBox.Animation3dFix', function (compDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = compDefinition,
        strategy = experimentStrategy;

    def.methods({
        _rotateComponent: function(angle){

            var transformPrefix = W.Utils.getCSSBrowserFeature('transform');
            if (!transformPrefix && angle !== 0){
                // For IE 8 that doesn't support transform
                this._rotateIEComponent();
                return;
            }
            if (angle === 0){
                this._skinParts.rotatablePart.style[transformPrefix] = '';
            } else {
                this._skinParts.rotatablePart.style[transformPrefix] = 'rotate(' + angle + 'deg) translate3d(0,0,0)';
            }
        }
    });
});
