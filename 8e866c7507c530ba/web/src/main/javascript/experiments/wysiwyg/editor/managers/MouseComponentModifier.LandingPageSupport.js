define.experiment.Class('wysiwyg.editor.managers.MouseComponentModifier.LandingPageSupport', function (def, strategy) {
    def.methods({
        _isVisibleComp: function (comp) {
            return this.resources.W.Editor.isComponentVisibleInViewport(comp) && comp.$view.isVisible();
        },
        _isSelectedComponentLocked: strategy.around(function(originalFunc){
            var editedComp = W.Editor.getSelectedComp();
            return originalFunc() || !(editedComp.isHorizontallyMovable() || editedComp.isVerticallyMovable());
        })
    });

});
