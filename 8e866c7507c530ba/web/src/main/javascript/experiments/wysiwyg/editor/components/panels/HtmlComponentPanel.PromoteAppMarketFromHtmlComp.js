define.experiment.component('wysiwyg.editor.components.panels.HtmlComponentPanel.PromoteAppMarketFromHtmlComp', function(componentDefinition, experimentStrategy){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    var strategy = experimentStrategy;
    /**
     * @lends wysiwyg.editor.components.panels.HtmlComponentPanel
     */
    def.methods({
        _createFields: strategy.before(function(){
            this.addInputGroupField(function () {

                    this.addInlineTextLinkField(null, this._translate('PromoteCheckedOut'),this._translate('AppMarket'),
                        this._translate('PromoteServiceExists'), null, null, null, 'WEditorCommands.Market', { origin: 'html-comp' });

                    this.addBreakLine('10px');

                    this.addInlineTextLinkField(null, null,this._translate('PromoteTakeMeThere'), null, null, null, null, 'WEditorCommands.Market', { origin: 'html-comp-2' });
                },
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                {'font-size':'13px', 'line-height': '1.3em'});
        })
    });
})