define.experiment.component('wysiwyg.editor.components.inputs.Link.CustomSiteMenu', function (componentDefinition, experimentStrategy) {

    var def = componentDefinition,
        strategy = experimentStrategy;

    def.states(strategy.customizeField(function(fields){
        fields.boldLabel = ['bold'];

        return fields;
    }));

    def.methods({

        initialize: strategy.after(function (compId, viewNode, args) {
            this._customLinksOrder = args.customLinksOrder;
            this.setBoldLabel(args.boldLabel);
        }),

        setBoldLabel: function(boldLabel){
            if(boldLabel){
                this.setState('bold', 'boldLabel');
            }
        },

        setPreviewData: function(previewData){
            this._previewData = previewData;
        },

        _openLinkDialog:function(e){
            var pos = this.resources.W.Utils.getPositionRelativeToWindow(this._skinParts.view);
            var undoRedoManager = this.resources.W.UndoRedoManager;
            undoRedoManager.isActionSupportedByURM = undoRedoManager.checkIfDataChangeSupportedByURM(e);

            var params = {
                data            : this._previewData,
                closeCallback   : this._onLinkDialogClosed,
                top             : pos.y,
                left            : pos.x,
                customLinksOrder: this._customLinksOrder
            };

            this.resources.W.Commands.executeCommand('WEditorCommands.OpenLinkDialogCommand', params);
        }
    });
});