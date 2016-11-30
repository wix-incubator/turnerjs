define.experiment.component('wysiwyg.editor.components.dialogs.LinkDialog.DisableAnchorForTPA', function (componentDefinition,experimentStrategy) {


    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;
    var strategy = experimentStrategy;


    def.methods({

        //TEMP - need to be removed
        _isCompBlackListForAnchors : function(){
            var editedComp = this.resources.W.Editor.getEditedComponent();
            var blackList = ["tpa.viewer.components.TPA3DCarousel","tpa.viewer.components.TPA3DGallery"];
            if (editedComp){
                var compClass = editedComp.className;
                if (compClass){
                    return _.contains(blackList,compClass);
                }
            }
            return false;
        },

        _createLinkDialog: function () {
            this._dialogWindow.setTitle(this.resources.W.Resources.getCur('LINK_DIALOG_DEFAULT_TITLE'));
            this._dialogWindow.setDescription(this.resources.W.Resources.getCur('LINK_DIALOG_DESCRIPTION'));

            this._hideBackButton();

            var dialog = this;
            var content = this.addInputGroupField(function (panel) {
                this.resources.W.Data.getDataByQuery("#LINK_BUTTONS_TYPE", function (dialogButtons) {
                    var items = dialogButtons.get('items');
                    var btn, label;

                    this.setNumberOfItemsPerLine(2, '5px');
                    //Build buttons
                    if (dialog._isCompBlackListForAnchors()){
                        items = _.filter(items,function (data){
                            return !_.contains(data.linkType,"ANCHOR");
                        });
                    };
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
                }.bind(this));
            });

            this._dialogParts.push(content);
        }


    });

});
