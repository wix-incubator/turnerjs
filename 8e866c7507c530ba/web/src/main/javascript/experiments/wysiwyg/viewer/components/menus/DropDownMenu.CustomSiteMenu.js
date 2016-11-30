/**
 * @class wysiwyg.viewer.components.menus.DropDownMenu
 */
define.experiment.component('wysiwyg.viewer.components.menus.DropDownMenu.CustomSiteMenu', function (componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition,
        strategy = experimentStrategy;

    def.skinParts({
        'repeaterButton': { type: 'core.components.MenuButton', repeater: true, inlineDataField: 'items', repeaterDataQueryField: 'id', container: 'itemsContainer', argObject: {listSubType: 'PAGES'} },
        'moreButton': { type: 'core.components.MenuButton' },
        'itemsContainer': { type: 'htmlElement' },
        'moreContainer': { type: 'htmlElement' },
        'dropWrapper': { type: 'htmlElement' }
    });

    def.resources(['W.Viewer']);

    def.methods({

        _selectActiveButton: function (pageID) {
            var i, button;
            if (this._flatButtons) {
                for (i = 0; i < this._flatButtons.length; i++) {
                    button = this._flatButtons[i];
                    if (button._data && button._data.isLinkedToType('PageLink') && button._data.isValueInLinkedDataItem('#' + pageID)) {
                        button.setSelected(true);
                    } else {
                        button.setSelected(false);
                    }
                    this.injects().Utils.forceBrowserRepaint(button.getViewNode());
                }

            }
        },

        _constructButtonsTree: function () {
            var i, j, rootButtons = this._data.get('items'), owner, children, buttonDef, creationList = [], count;

            for (i = 0; i < rootButtons.length; i++) {
                owner = null;
                for (j = 0; j < this._rootButtons.length; j++) {
                    if (this._rootButtons[j].compareId(rootButtons[i].get('id'))) {
                        owner = this._rootButtons[j];
                        break;
                    }
                }
                if (owner) {
                    owner.children = [];
                    children = rootButtons[i].getItems();
                    for (j = 0; j < children.length; j++) {
                        buttonDef = Object.clone(this._repeaterDefinitions[0]);
                        buttonDef.dataQuery = '#' + children[j].get("id");
                        creationList.push({owner: owner, def: buttonDef});
                    }
                }
            }
            count = creationList.length;
            if (count === 0) {
                this._constructionDone();
            } else {
                for (i = 0; i < creationList.length; i++) {
                    var itemDefinition = creationList[i].def;
                    creationList[i].owner.createSubButton(this._createComponentbyDefinition.bind(this), itemDefinition, function (logic) {
                        this._registerButton(logic);
                        this._flatButtons.push(logic);
                        count--;
                        if (count === 0) {
                            this._constructionDone();
                        }
                    }.bind(this));
                }
            }
        },

        _arrangeButtonAccordingToData: function (buttons) {
            var dataItems = this._data.get("items");
            var arrangedButtons = [];
            for (var i = 0; i < dataItems.length; i++) {
                var dataId = dataItems[i].get('id');
                arrangedButtons.push(
                    this._rootButtons.filter(function (button) {
                        return button.getDataItem().get('id') === dataId;
                    }.bind(this))[0]
                );
            }
            this._rootButtons = arrangedButtons;
        },

        _onRepeaterItemReady:function (repeaterDefinition, itemLogic, itemData, newItem) {
            this._rootButtons.push(itemLogic);
            this._flatButtons.push(itemLogic);
            itemLogic.getViewNode().setStyle("visibility", "hidden");
            this._registerButton(itemLogic);
            this.parent(repeaterDefinition, itemLogic, itemData, newItem);
        },

        _registerButton:function (button) {
            var buttonView = button.getViewNode(),
                dataItem = button.getDataItem();

            button.setMenu(this);
            button.addEvent("dataChanged", this._onButtonDataChange);
            button.dropdownMode = true;

            if(dataItem && dataItem.getLinkedDataItem()){
                this.resources.W.Viewer.getLinkRenderer().renderLink(buttonView, dataItem.getLinkedDataItem(), button, true);
            }
        },

        _getDisplayedButtons:function () {
            var displayedButtons = [];
            for (var i = 0; i < this._rootButtons.length; i++) {
                if (this._rootButtons[i].getDataItem().isVisible()) {
                    displayedButtons.push(this._rootButtons[i]);
                }
            }
            return displayedButtons;
        },
    });

});