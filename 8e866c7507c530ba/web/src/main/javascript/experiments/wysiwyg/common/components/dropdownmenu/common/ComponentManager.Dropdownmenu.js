/**
 * @class core.managers.component.ComponentManager
 */
define.experiment.Class('core.managers.component.ComponentManager.Dropdownmenu', function(classDefinition, experimentStrategy){
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition,
        strategy = experimentStrategy;

    def.methods({
        _getStyleIdArray: function(compClassName, numberOfStyles) {
            var styleIdArray = [];
            //style array was already created
            if (typeOf(numberOfStyles) === 'array') {
                return;
            }

            for (var i = 0; i < numberOfStyles; i++) {
                // #WOH-9021: Converting new dropdown menu style id to be the same as the old style id.
                if(compClassName === 'DropDownMenu') {
                    styleIdArray[i] = 'ddm' + (i + 1);
                } else {
                    styleIdArray[i] = compClassName + '_' + (i + 1);
                }
            }

            return styleIdArray;
        }
    });
});

