//define.experiment.Class('wysiwyg.viewer.components.menus.DropDownController.FixMoreButton.New', function(compDefinition, experimentStrategy) {
//    /**@type core.managers.component.ComponentDefinition*/
//    var def = compDefinition;
//    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
//    var strategy = experimentStrategy;
//
//    def.methods({
//        _setDropDownWidth:function() {
//            var i;
//            var button;
//            var widest = this._dropOwnerButton.getMinimalDropdownWidth();
//
//            for (i=0; i<this._dropButtons.length; i++){
//                button = this._dropButtons[i];
//                widest = Math.max(widest, button.getMinimalWidth());
//            }
//
//            var dropExtraPixels = this._menu.getMenuExtraPixels(true);
//            this._dropWrapper.setStyle("width", dropExtraPixels.left+dropExtraPixels.right+widest+"px");
//        }
//    })
//});
//
