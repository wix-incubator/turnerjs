define.component('Editor.wysiwyg.viewer.components.mobile.TinyMenu', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.statics({
        FIXED_POSITION_MAX_Y: 250,
        EDITOR_META_DATA:{
            general:{
                settings:true,
                design:false
            },
            mobile:{
                custom:[
                    {
                        label:'FPP_DESIGN_LABEL',
                        command: 'WEditorCommands.ShowMobileMenuPanel'
                    },
                    {
                        label:'FPP_NAVIGATE_LABEL',
                        command:'WEditorCommands.Pages'
                    }
                ],
                disablePropertySplit: true
            }
        }
    });

    def.methods({

        setY: function(requestedValue) {
            var currentGlobalValue = this.getGlobalPosition().y;
            var RequestedGlobalValue = parseInt(requestedValue, 10) + currentGlobalValue - this.getY();
            var menuOutOfView = false;
            var isMenuFixed = this.isFixedPositioned();

            if (isMenuFixed && RequestedGlobalValue > this.FIXED_POSITION_MAX_Y) {
                requestedValue -= RequestedGlobalValue-this.FIXED_POSITION_MAX_Y;
                menuOutOfView = true;
            }
            this.parent(requestedValue);
            if (menuOutOfView) {
                this.trigger('menuOutOfView');
            }
        }
    });
});
