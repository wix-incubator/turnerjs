define.Class('wysiwyg.editor.layoutalgorithms.mobileonlycomponents.TinyMenuLayoutHandler', function (classDefinition) {

    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.statics({
        DEFAULT_CONTAINER_ID: 'SITE_HEADER',
        ADD_BY_DEFAULT: true,
        ON_HIDDEN_LIST_WHEN_NOT_EXIST: true,
        IS_SINGLETON: true,
        COMPONENT_ID: "TINY_MENU",
        DATA_QUERY: "#MAIN_MENU",
        COMPONENT_TYPE: "wysiwyg.viewer.components.mobile.TinyMenu",
        DEFAULT_SKIN: "wysiwyg.viewer.skins.mobile.TinyMenuSkin",
        DEFAULT_STYLE_ID: "tm1",
        TYPE: "Component"
    });

    def.inherits('wysiwyg.editor.layoutalgorithms.mobileonlycomponents.MobileOnlyComponentLayoutHandler');

    def.methods({

        getDefaultLayout: function() {
            return {
                height: this._config.TINY_MENU_SIZE,
                width: this._config.TINY_MENU_SIZE,
                x: this._config.MOBILE_WIDTH - (this._config.TINY_MENU_SIZE + this._config.SITE_SEGMENT_PADDING_X),
                y: this._config.COMPONENT_MOBILE_MARGIN_Y
            };
        },


        getReservedSpace: function() {
            var defaultLayout = this.getDefaultLayout();
            return {
                containerId: this.getDefaultContainerId(),
                height: defaultLayout.height,
                width: defaultLayout.width,
                x: defaultLayout.x,
                y: defaultLayout.y
            };
        },

        getAdditionalStyles: function() {
            return {
                'tm2': {
                    'comp': 'wysiwyg.viewer.components.mobile.TinyMenu',
                    'skin': 'wysiwyg.viewer.skins.mobile.TinyMenuSkin',
                    'properties' : {
                        'bg': 'color_11',
                        'bgh': 'color_13',
                        'bgs': 'color_18',
                        'txts': 'color_15',
                        'txt': 'color_15'
                    }
                }
            };
        },

        addToStructure: function(structure) {
            var compData = this.getComponentDefaultData();
            var compContainerId = this.getDefaultContainerId();
            var containerComponent = this._utils.getComponentByIdFromStructure(compContainerId, structure);
            this._utils.addComponentsToContainer(containerComponent, [compData]);
            return true;
        }






});
});
