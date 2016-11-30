define.experiment.component('wysiwyg.editor.components.dialogs.LinkDialog.CustomSiteMenu', function (componentDefinition,experimentStrategy) {

    var def = componentDefinition,
        strategy = experimentStrategy;

    def.methods({

        initialize: strategy.around(function(originalFunction, compId, viewNode, args){
            this._initializeLinkButtonsDataItem();
            originalFunction(compId, viewNode, args);
            this._customizeLinkOrder(args.customLinksOrder);
        }),

        _initializeLinkButtonsDataItem: function(){
            this._linkButtonsDataItem = this.resources.W.Data.getDataByQuery("#LINK_BUTTONS_TYPE");
        },

        _getSchemaDataTypes: function () {
            return this._linkButtonsDataItem._data.dataSchemaByType;
        },

        _customizeLinkOrder: function(newOrder){
            var itemsCurrentOrder = this._linkButtonsDataItem.get('items'),
                itemsNewOrder = [];

            if(!newOrder){
                this._linkItemsInCustomOrder = itemsCurrentOrder;
                return;
            }

            newOrder.forEach(function(itemInNewOrder){
                var item = _.find(itemsCurrentOrder, function(item){
                    return item.linkType === itemInNewOrder;
                });

                if(item){
                    itemsNewOrder.push(item);
                }
            });

            this._linkItemsInCustomOrder = itemsNewOrder.length > 0 ? itemsNewOrder : itemsCurrentOrder;
        },

        _createLinkDialog: function () {
            this._hideBackButton();

            var dialog = this;
            var content = this.addInputGroupField(function (panel) {
                var items = panel._linkItemsInCustomOrder;
                var btn, label;

                this.setNumberOfItemsPerLine(2, '5px');
                //Build buttons
                if (dialog._isCompBlackListForAnchors()){
                    items = _.filter(items,function (data){
                        return !_.contains(data.linkType,"ANCHOR");
                    });
                }
                items.forEach(function (item) {
                    label = this.resources.W.Resources.getCur(item.buttonLabel);
                    btn = this.addButtonField(null, label, null, {
                            iconSrc: 'icons/link_icons.png',
                            iconSize: {width: 16, height: 18},
                            spriteOffset: item.spriteOffset
                        }, null, '95px'
                    ).addEvent(Constants.CoreEvents.CLICK, function () {
                            var linkType = item.linkType;
                            panel._setState(dialog._dataTypes[linkType]);
                        }.bind(this));

                    if (item.onCreateCB) {
                        item.onCreateCB.apply(panel, [btn]);
                    }
                }.bind(this));

                //If the component data contains a link or a link was created by the dialog and not saved yet - show "remove link" button
                if (dialog._isPreviewDataHasLink() || this._data) {
                    this.addBreakLine('20px');
                    this.setNumberOfItemsPerLine(1);
                    this.addButtonField("", this.resources.W.Resources.getCur('LINK_DLG_REMOVE_LINK'), null, null, 'linkRight')
                        .addEvent(Constants.CoreEvents.CLICK, panel._onRemoveLink);
                }
            });

            this._dialogParts.push(content);
        }


    });

});
