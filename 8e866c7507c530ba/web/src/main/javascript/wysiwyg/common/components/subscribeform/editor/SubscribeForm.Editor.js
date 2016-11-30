define.component('Editor.wysiwyg.common.components.subscribeform.viewer.SubscribeForm', function(componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition,
        strategy = experimentStrategy;

    def.panel({
        logic: 'wysiwyg.common.components.subscribeform.editor.SubscribeFormPanel',
        skin: 'wysiwyg.common.components.subscribeform.editor.skins.SubscribeFormPanelSkin'
    });

//    def.traits(strategy.merge([
//        'wysiwyg.viewer.components.traits.CustomPreviewBehavior'
//    ]));

    def.utilize(strategy.merge(['wysiwyg.viewer.components.traits.CustomPreviewBehavior']));

    def.statics({
        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: true
            },
            mobile: {
                allInputsHidden: true
            }
        }
    });

    def.styles(1);

    def.helpIds({
        componentPanel: '/node/21782',
        advancedStyling: '',
        chooseStyle: ''
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._customPreviewBehavior = new this.imports.CustomPreviewBehavior();
            this._customPreviewBehavior.getViewNode = this.getViewNode.bind(this);
        },
        _onRender: strategy.after(function(renderEvent){
            if(('skinChange' in renderEvent.data.invalidations._invalidations) && this._customPreviewBehavior._overlayElement) this._customPreviewBehavior._overlayElement = null;
            this._customPreviewBehavior._createClickOverlayForPreviewMode('Subscribe_Form_Only_On_Public');
        })
    });
});