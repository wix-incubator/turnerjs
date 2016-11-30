define.Class('wysiwyg.editor.layoutalgorithms.mobileonlycomponents.MobileOnlyComponentLayoutHandler', function (classDefinition) {

    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.methods({

        initialize: function(modules) {
            this._config = modules.$config;
            this._utils = modules.$utils;
        },

        getDefaultContainerId: function() {
            return this.DEFAULT_CONTAINER_ID;
        },

        isAddByDefault: function() {
            return this.ADD_BY_DEFAULT;
        },

        isOnHiddenListWhenNotExist: function() {
            return this.ON_HIDDEN_LIST_WHEN_NOT_EXIST;
        },

        isSingleton: function() {
            return this.IS_SINGLETON;
        },

        getComponentId: function() {
            return this.COMPONENT_ID;
        },

        getDataQuery: function() {
            return this.DATA_QUERY;
        },

        getComponentType: function() {
            return this.COMPONENT_TYPE;
        },

        getDefaultSkin: function() {
            return this.DEFAULT_SKIN;
        },

        getDefaultStyleId: function() {
            return this.DEFAULT_STYLE_ID;
        },

        getType: function() {
            return this.TYPE;
        },

        getComponentDefaultData: function() {
            return {
                    componentType: this.getComponentType(),
                    id: this.getComponentId(),
                    dataQuery: this.getDataQuery(),
                    layout: this.getDefaultLayout(),
                    skin: this.getDefaultSkin(),
                    styleId: this.getDefaultStyleId(),
                    type: this.getType()
                };
        },

        createAdditionalStylesIfNeeded: function() {
            var theme = W.Preview.getPreviewManagers().Theme;
            var additionalStyles = this.getAdditionalStyles();

            for (var styleId in additionalStyles) {
                var curStyleProperties = additionalStyles[styleId];

                if(theme.isStyleAvailable(styleId)){
                    var styleData = theme.getDataByQuery("#" + styleId);
                    var style = styleData.get('style');
                    if(style && !_.isEmpty(style.properties)){
                        continue;
                    }
                }

                theme.createStyle(styleId, curStyleProperties.comp, curStyleProperties.skin, function(styleObj){
                    for (var curStyleProperty in curStyleProperties.properties) {
                        styleObj.setProperty(curStyleProperty, curStyleProperties.properties[curStyleProperty]);
                    }
                });
            }
        },

        existsInStructure: function(structure) {
            return this._utils.isComponentExistInStructure(this.getComponentId(), structure);
        }


    });
});
