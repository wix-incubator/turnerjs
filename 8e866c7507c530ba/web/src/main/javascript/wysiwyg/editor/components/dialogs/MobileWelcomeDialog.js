define.component("wysiwyg.editor.components.dialogs.MobileWelcomeDialog", function(componentDefinition){
    //@type core.managers.component.ComponentDefinition
    var def = componentDefinition;
    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');

    def.skinParts({
        content   : {type: 'htmlElement'}
    });

    def.resources(['W.Preview', 'W.Resources', 'W.Components', 'W.Editor', 'W.Commands']);

    def.binds(['_openMobilePanel']);

    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this._dialogWindow = args.dialogWindow;
        },

        _createFields: function(){
            var panel = this;

            this.setSkinSet('FLOATING_DIALOG');

            this.addLabel(panel._translate("MOBILE_WELCOME_TITLE"), null, null, null, null, null, null, {"color": "#0099ff"});

            this.addBreakLine('14px');

            this.addInputGroupField(function(panel){
                this.addLabel(panel._translate("MOBILE_WELCOME_DESCRIPTION"), null, 'bold');
                this.addBreakLine('8px');

                this.addInputGroupField(function () {
                    this.setNumberOfItemsPerLine(0);
                    this.addIcon('mobile/first_time_illustration.png', null, {width: "150px", height: "40px"});
                }, 'skinless', null, null, null, 'center');

                this.addBreakLine('10px');
                this.addLabel(panel._translate("MOBILE_WELCOME_DESCRIPTION_HEADER"), {height: '24px'});
                this.addLabel(panel._translate("MOBILE_WELCOME_DESCRIPTION_L1"), null, 'default', 'mobile/black_bullet_icon.png', {x: 0, y: "-2px"}, {width: "7px", height: "20px"}, null, {'margin-bottom': '0', 'width': '440px', 'vertical-align': 'top'});
                this.addLabel(panel._translate("MOBILE_WELCOME_DESCRIPTION_L2"), null, 'default', 'mobile/black_bullet_icon.png', {x: 0, y: "-2px"}, {width: "7px", height: "20px"}, null, {'margin-bottom': '0', 'width': '440px', 'vertical-align': 'top'});
                this.addBreakLine('14px');
                this.addLabel(panel._translate("MOBILE_WELCOME_NOTE"), {height: '20px'});
            }, 'skinless');

            this.addBreakLine('20px');

            this.addInputGroupField(function () {
                this.setNumberOfItemsPerLine(0);
                this.addButtonField(null, panel._translate("MOBILE_WELCOME_BUTTON"), null, null, 'blue', "120px")
                    .addEvent(Constants.CoreEvents.CLICK, panel._dialogWindow.closeDialog);
            }, 'skinless', null, null, null, 'center');

            this.addBreakLine('20px');

            this.addInputGroupField(function () {
                this.setNumberOfItemsPerLine(0);
                this.addIcon('mobile/first_time_settings_icon.png', null, {width:'29px', height:'29px'});
                this.addInlineTextLinkField(null,
                        panel._translate("MOBILE_WELCOME_LINK_PREFIX"),
                        panel._translate("MOBILE_WELCOME_LINK_TEXT"),
                        panel._translate("MOBILE_WELCOME_LINK_SUFFIX"),
                        null, null, null, null, null, {width:'420px'}
                    ).addEvent(Constants.CoreEvents.CLICK, panel._openMobilePanel);
            }, 'skinless');

        },

        _openMobilePanel: function (e) {
            this._dialogWindow.closeDialog();
            this.injects().Commands.executeCommand('WEditorCommands.MobileSettings');
            this.injects().Commands.executeCommand('WEditorCommands.ShowMobileViewSelector');
        }


    });
});








