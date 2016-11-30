define.experiment.newClass('wysiwyg.common.components.dropdownmenu.editor.traits.MenuDataHandler.Dropdownmenu', function(classDefinition) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.common.components.dropdownmenu.viewer.traits.MenuDataHandler');

    def.methods({

        _onMainMenuDataChange: function() {
            this._updateMenuData();

            var numOfButtonsBeforeMenuBuilding = this._menuContainer.getElements('li').length;
            if (this._isMoreButtonVisible) {
                numOfButtonsBeforeMenuBuilding--;
                this._resetMoreButton();
            }

            //call later to prevent ugly jumps
            this.resources.W.Utils.callLater(function() {
                this.buildItemList();

                var numOfButtonsAfterMenuBuilding = this._menuContainer.getElements('li').length;
                if (numOfButtonsBeforeMenuBuilding < numOfButtonsAfterMenuBuilding) {
                    this._initButtonsWidthMap(this._menuContainer.getElements('li'));
                }
                else {
                    this._updateComponentAccordingToLayoutAffectingProperties();
                }

                this._arrangeMenuAccordingToNewWidth();
            }, [], this);
        },

        _updateMenuData: function() {
            this._menuDataNP = this._createMenuNonPersistentData(this._mainMenuData);
            this._updateHrefToDataNodeMap();
        },

        _handlePageDataChange: function(dataInfo) {
            var buttonViewNode;
            var dataItem = dataInfo.data.dataItem;
            var field = dataInfo.data.field;
            var value = dataItem.get(field);

            if (field === 'hidePage') {
                this.buildItemList();
                if (value == false) {
                    buttonViewNode = this._getViewNodeByHref(dataItem.get('id'));
                    var buttonLabelElement = this.getLabelElement(buttonViewNode);
                    var buttonWidthObject = this._buttonsWidthMap[this._getButtonIdentifier(buttonViewNode)];
                    this._updateButtonsWidthMap(buttonViewNode, buttonLabelElement.getWidth() + (buttonWidthObject ? buttonWidthObject.extraWidth : 0));
                }
                this._updateComponentAccordingToLayoutAffectingProperties();
            }
            else if (field === 'title') {
                var dataNode = this._hrefToDataNodeMap['#' + dataItem.get('id')];
                dataNode.set('label', value);
                if (!dataItem.get('hidePage')) {
                    buttonViewNode = this._getViewNodeByHref(dataItem.get('id'));
                    this._handleButtonLabelChange(value, buttonViewNode);
                }
            }
        },

        _handleButtonLabelChange: function(title, viewNode) {
            var labelElement = this.getLabelElement(viewNode);
            labelElement.set('text', title);
            this._setMenuWidthAfterLabelChange(viewNode, labelElement);
        },

        _setMenuWidthAfterLabelChange: function(viewNode, labelElement) {
            var buttonWidthObject = this._buttonsWidthMap[this._getButtonIdentifier(viewNode)];
            this._updateButtonsWidthMap(viewNode, labelElement.getWidth() + (buttonWidthObject ? buttonWidthObject.extraWidth : 0));
            this.setWidth(this._currentWidth);
        }
    });
});