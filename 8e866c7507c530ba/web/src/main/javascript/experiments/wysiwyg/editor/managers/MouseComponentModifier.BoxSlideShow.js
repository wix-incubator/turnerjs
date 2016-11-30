define.experiment.Class('wysiwyg.editor.managers.MouseComponentModifier.BoxSlideShow', function (def,experimentStrategy) {

    var strategy = experimentStrategy;

    def.methods({
        _resizeMouseMoveHandler: strategy.before (function (comp) {
            if (W.Editor._editedComponent.waitTillMeasureToPreformLayoutChanges()){
                this.resources.W.Preview.getPreviewManagers().Layout.updateLayoutAction(true);
            }
        }),
        _resizeMouseUpHandler: strategy.before (function() {
            if (W.Editor._editedComponent.waitTillMeasureToPreformLayoutChanges()){
                this.resources.W.Preview.getPreviewManagers().Layout.updateLayoutAction(false);
            }
        })
    });

});





