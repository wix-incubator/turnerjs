define.experiment.newComponent("wysiwyg.editor.components.dialogs.AccordionItemContainer.RedirectFeature301", function (componentDefinition, experimentStrategy) {

    //@type core.managers.component.ComponentDefinition
    var def = componentDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');

    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this._dialogWindow = args.dialogWindow;
            this.dialogItem = args.dialogItem;
            this._fieldsGroup = null;
            this._toggleButton = null;
            this._isCollapsed = args.shouldStartCollapsed;
            this._itemHeader = null;
            this._itemTitle = null;
            this._dialogField = null;
        },

        _createFields: function(){
            if(!this.dialogItem){
                return;
            }
            var that = this;
            this.addInputGroupField(function(){
                var inputGroup = this;
                that._createItemHeader(inputGroup);
                _.defer(function () {
                    that._createItem(inputGroup);
                });
            });
        },

        _createItemHeader:function(container){
            var that = this;
            this._itemHeader = container.addInputGroupField(function() {
                var inputGroup = this;
                inputGroup.setNumberOfItemsPerLine(0, '3px');
                that._createToggleCollapseBtn(inputGroup);
                that._itemTitle = that._createTitle(inputGroup);
                that._itemTitle.runWhenReady(function(logic){
                    that._itemTitle = logic;
                });
            }, 'skinless');

            that._itemHeader.runWhenReady(function(logic){
                that._itemHeader = logic;
                that._itemHeader.$view.setStyle('cursor', 'pointer');
                that._itemHeader.$view.addEvent(Constants.CoreEvents.CLICK, function(ev){
                    that.trigger('toggleCollapse');
                });
            }.bind(that));
        },

        _createItem: function (container) {
            var data = W.Data.getDataByQuery(this.dialogItem.dataType);
            this._fieldsGroup = container.addInputGroupField(function (panel) {
                panel._dialogField = this._addField(
                    panel.dialogItem.compName,
                    panel.dialogItem.skinName,
                    {
                        dialogWindow: panel._dialogWindow,
                        dialogData: data
                    }
                );
                panel._dialogField.runWhenReady(function(dialogField){
                    panel._dialogField = dialogField;
                });

            }, 'skinless', null, null, null, null, null, null, {'margin-left':'5px'});

            this._fieldsGroup.runWhenReady(function(logic){
                this._fieldsGroup = logic;
                if(this._isCollapsed){
                    this.collapseGroup();
                }
            }.bind(this));

        },

        _createToggleCollapseBtn: function(buttonContainer) {
            var btnIconSrc = this.isGroupCollapsed() ? 'buttons/imagemanager_moveright.png' : 'buttons/imagemanager_movedown.png';
            var that = this;
            return buttonContainer.addButtonField(null, null, false, {iconSrc: btnIconSrc, iconSize: {width: 12, height: 14}, spriteOffset: {x: 0, y: 0}}, 'imageManager', null, null)
                .runWhenReady(function(btnLogic){
                    that._toggleButton = btnLogic;
                });
        },

        _createTitle:function(container){
            return container.addTitle(this._translate(this.dialogItem.title))
                    .runWhenReady(function(labelLogic){
                        labelLogic._skinParts.label.setStyles({'margin-left': '4px', 'margin-bottom': '2px', 'padding': '.2em 0', 'font-size': '15px'});
                    });
        },

        collapseGroup:function(){
            if(!this._isCollapsed && this._dialogField && this._dialogField.onDialogCollapse) {
                this._dialogField.onDialogCollapse();
            }
            this._isCollapsed = true;
            this._fieldsGroup.collapseGroup();
            if(this._toggleButton && this._toggleButton.setIcon){
                this._toggleButton.setIcon('buttons/imagemanager_moveright.png');
                this._itemTitle._skinParts.label.setStyle('color', 'rgb(55, 154, 207)');
            }
        },

        uncollapseGroup:function(){
            this._isCollapsed = false;
            this._fieldsGroup.uncollapseGroup();
            if(this._dialogField) {
                if(this._dialogField.isLimitReached && this._dialogField.isLimitReached()) {
                    this._dialogField.handleLimit();
                }

                if (this._dialogField.setDialogFocus) {
                    this._dialogField.setDialogFocus();
                }
                if (this._dialogField.onDialogUncollapse) {
                    this._dialogField.onDialogUncollapse();
                }
            }
            if(this._toggleButton && this._toggleButton.setIcon){
                this._toggleButton.setIcon('buttons/imagemanager_movedown.png');
                this._itemTitle._skinParts.label.setStyle('color', '#404040');
            }
        },

        isGroupCollapsed:function(){
            return this._isCollapsed;
        }
    });
});
