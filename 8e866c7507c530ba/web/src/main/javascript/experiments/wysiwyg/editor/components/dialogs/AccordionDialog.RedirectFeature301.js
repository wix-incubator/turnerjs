define.experiment.newComponent("wysiwyg.editor.components.dialogs.AccordionDialog.RedirectFeature301", function (componentDefinition, experimentStrategy) {

    //@type core.managers.component.ComponentDefinition
    var def = componentDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.binds(['toggleCollapseGroup']);
    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.traits(['core.editor.components.traits.DataPanel']);

    def.resources(['W.Commands', 'W.Resources', 'W.Utils']);

    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this._dialogWindow = args.dialogWindow;
            this._dialogItems = args.dialogItems;
        },

        _onAllSkinPartsReady : function() {
            this.parent();
            this._skinParts.content.addEvent(Constants.CoreEvents.MOUSE_WHEEL, this.resources.W.Utils.stopMouseWheelPropagation);
        },

        _createFields: function(){
            var shouldStartCollapsed = false;
            _.forEach(this._dialogItems, function (item, index, collection) {
                this.addBreakLine('10px');
                var dialog = this._addField(
                    'wysiwyg.editor.components.dialogs.AccordionItemContainer',
                    'wysiwyg.editor.skins.panels.base.AutoPanelSkin',
                    {
                        dialogWindow: this._dialogWindow,
                        dialogItem: item,
                        shouldStartCollapsed: shouldStartCollapsed
                    }
                );
                shouldStartCollapsed = true;
                dialog.runWhenReady(function(logic){
                    collection[index] = logic;
                    logic.on('toggleCollapse', this, this.toggleCollapseGroup);
                }.bind(this));
            }, this);
        },

        toggleCollapseGroup:function(ev){
            if(ev.target.isGroupCollapsed()){
                ev.target.uncollapseGroup();
            }
            else{
                ev.target.collapseGroup();
            }
            _.forEach(this._dialogItems, function (item) {
                if(item !== ev.target){
                    item.collapseGroup();
                }
            });
        }
    });
});
