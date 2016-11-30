/**
 * @class wysiwyg.viewer.components.VerticalRepeater
 */
define.component('wysiwyg.viewer.components.VerticalRepeater', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.utilize(['wysiwyg.viewer.utils.ComponentSequencer']);

    def.dataTypes(['','ImageList']);

    def.binds(['_sequencingHook']);

    def.skinParts( {
        inlineContent:{type:'htmlElement'}
    });

    def.methods({

        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._sequencer = new this.imports.ComponentSequencer();
            if(args && args.sequencingHook) {
                this._sequencer.resolveItem = this._sequencingHookWrapper(args.sequencingHook);
            } else {
                this._sequencer.resolveItem = this._sequencingHookWrapper(this._sequencingHook);
            }
        },
        _sequencingHookWrapper: function(hook) {
            return function(dataItem, itemIndex, dataList) {
                return hook(dataItem, itemIndex, dataList);
            };
        },
        getSequencer: function() {
            return this._sequencer;
        },
        _sequencingHook : function () {
            //TODO: change to actual skin
            return { comp:'wysiwyg.viewer.components.Displayer', skin: this._skin.compParts.imageItem.skin };
        },
        setSequencingHook : function(func){
            this._sequencer.resolveItem = this._sequencingHookWrapper(func);
        },
        _onAllSkinPartsReady : function(){
            this._sequencer.addEvent('productionFinished', function (event) {
                this._markChildren(event.elements);
            }.bind(this));
        },
        render : function() {
            if(!this._data)
            {
                return;
            }
            this._newItems = [];
            this._sequencer.createComponents(this._skinParts.inlineContent, this._data.get("items"));
        },
        _markChildren: function(children) {
            children.each(function (child, itemIndex, list) {
                child.set("isfirst", itemIndex == 0 ? "true" : "false");
                child.set("iseven", itemIndex % 2 == 1 ? "true" : "false");
                child.set("islast", itemIndex == list.length - 1 ? "true" : "false");
            });
        }

    });
});