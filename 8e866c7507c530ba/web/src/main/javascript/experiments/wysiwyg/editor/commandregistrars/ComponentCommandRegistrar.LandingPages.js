define.experiment.Class('wysiwyg.editor.commandregistrars.ComponentCommandRegistrar.LandingPages', function (def, strategy) {

    def.methods({
        _isSelectedComponentLocked: strategy.around(function(originalFunc, coordinates){
            var editedComp = coordinates.editedComponent || W.Editor.getSelectedComp();
            return originalFunc() || !(editedComp.isHorizontallyMovable() || editedComp.isVerticallyMovable());
        })
    });
});

