define.Class('wysiwyg.editor.layoutalgorithms.mobileonlycomponents.BackToTopLayoutHandler', function (classDefinition, experimentStrategy) {

    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.resources(['W.Resources']);

    def.statics({
        DEFAULT_CONTAINER_ID: "SITE_STRUCTURE",
        ADD_BY_DEFAULT: false,
        ON_HIDDEN_LIST_WHEN_NOT_EXIST: false,
        IS_SINGLETON: true,
        COMPONENT_ID: "BACK_TO_TOP_BUTTON",
        DATA_QUERY: null,
        COMPONENT_TYPE: "wysiwyg.common.components.backtotopbutton.viewer.BackToTopButton",
        DEFAULT_SKIN: "wysiwyg.common.components.backtotopbutton.viewer.skins.BackToTopButtonSkin",
        DEFAULT_STYLE_ID: "",
        TYPE: "Component"
    });

    def.inherits('wysiwyg.editor.layoutalgorithms.mobileonlycomponents.MobileOnlyComponentLayoutHandler');

    def.methods({

        initialize: function(modules) {
            this.parent(modules);
            this._modules = modules;
        },


        getDefaultLayout: function() {
            return {
                height: 0,
                width: 0,
                x: 0,
                y: 0
            };
        },

        getReservedSpace: function() {
            return null;
        },

        getAdditionalStyles: function() {
            return {};
        },

        //new
        addToStructure: function (structure) {
            // TODO: (HACK) - stay with the public method
            if(this._modules.$utils.addComponentsToContainer) {
                this._modules.$utils.addComponentsToContainer(structure, [this._getComponentData()]);
            } else {
                this._modules.$utils._addComponentsToContainer(structure, [this._getComponentData()]);
            }
        },

        _getComponentData: function() {
            return {
                id: this.COMPONENT_ID,
                type: "Component",
                componentType: this.COMPONENT_TYPE,
                skin: this.DEFAULT_SKIN,
                styleId: this.DEFAULT_STYLE_ID,
                layout: this.getDefaultLayout()
            };
        }



    });
});
