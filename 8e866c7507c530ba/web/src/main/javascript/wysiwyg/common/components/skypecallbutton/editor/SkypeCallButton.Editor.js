define.component('Editor.wysiwyg.common.components.skypecallbutton.viewer.SkypeCallButton', function(componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;
    var strategy = experimentStrategy;

    def.panel({
        logic: 'wysiwyg.common.components.skypecallbutton.editor.SkypeCallButtonPanel',
        skin: 'wysiwyg.common.components.skypecallbutton.editor.skins.SkypeCallButtonPanelSkin'
    });

    def.binds(['_showPlaceholderTooltip']);

    def.styles(1);

    def.helpIds({
        componentPanel: '/node/18990'
    });

    def.statics({
        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: false
            }
        }
    });

    def.methods({
        initialize: strategy.after(function (compId, viewNode, args) {
            this._resizableSides = [];
        }),
        _onFirstRender: strategy.after(function () {
            var placeholder = this._skinParts.placeholder;

            placeholder.addEvent('click', this._showPlaceholderTooltip);
            placeholder.addEvent('mouseenter', this._showPlaceholderTooltip);
        }),
        _showPlaceholderTooltip: function () {
            W.Commands.executeCommand('CustomPreviewBehavior.interact', {
                tooltipId: "Skypecallbutton_Enter_Skypename_ttid",
                component: this
            }, this);
        }
    });

});
