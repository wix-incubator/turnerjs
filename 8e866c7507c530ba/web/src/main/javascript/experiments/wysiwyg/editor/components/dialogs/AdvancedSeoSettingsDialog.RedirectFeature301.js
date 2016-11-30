define.experiment.component("wysiwyg.editor.components.dialogs.AdvancedSeoSettingsDialog.RedirectFeature301", function (componentDefinition, experimentStrategy) {

    //@type core.managers.component.ComponentDefinition
    var def = componentDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.dataTypes(['']);
    def.resources(['W.Commands', 'W.Resources']);

    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this._dialogWindow = args.dialogWindow;
        },

        _createFields: function(){
            var that = this;
            _.defer(function () {
                that.addAccordionDialog();
            });
        },

        addAccordionDialog:function(){
            var headerMetaTags = {
                compName:'wysiwyg.editor.components.dialogs.HeaderMetaTags',
                skinName:'wysiwyg.editor.skins.panels.base.AutoPanelSkin',
                title: 'ADVANCED_SEO_PANEL_TITLE',
                dataType:'#USER_META_TAGS'
            };
            var redirect301 = {
                compName:'wysiwyg.editor.components.dialogs.Redirect301',
                skinName:'wysiwyg.editor.skins.panels.base.AutoPanelSkin',
                title: 'ADVANCED_SEO_301_TITLE',
                dataType:'#SITE_SETTINGS'
            };
            return this._addField(
                'wysiwyg.editor.components.dialogs.AccordionDialog',
                'wysiwyg.editor.skins.panels.base.AutoPanelSkin',
                {
                    dialogWindow: this._dialogWindow,
                    dialogItems: [headerMetaTags, redirect301]
                }
            );
        },
        _onCloseDialogButtonClick:function(){
            //empty on purpose, to override the default of the original file
        }
    });
});
