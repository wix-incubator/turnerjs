define.component('wysiwyg.viewer.components.AdminLoginButton', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.viewer.components.SiteButton');

    def.resources(['W.Commands']);

    def.skinParts({
        label: {type: 'htmlElement'},
        link: {type: 'htmlElement'}
    });

    def.dataTypes(['LinkableButton']);

    def.propertiesSchemaType("ButtonProperties");

    def.statics({
        EDITOR_META_DATA:{
            general:{
                settings    : true,
                design      : true
            },
            mobile: {
                allInputsHidden: true
            }
        }
    });

    def.methods({
        initialize: function(compId, viewNode, attr) {
            this.parent(compId, viewNode, attr);
        },

        isPartiallyFunctionalInStaticHtml: function(){
            return true;
        },

        _onClick:function(){
            //AdminLoginButton will no longer use the links mechanism (linkType = "ADMIN_LOGIN") to fire the command on click
            //It will do it by itself (as part of the component login)
            this.resources.W.Commands.executeCommand('WViewerCommands.AdminLogin.Open');
        }
    });

});
