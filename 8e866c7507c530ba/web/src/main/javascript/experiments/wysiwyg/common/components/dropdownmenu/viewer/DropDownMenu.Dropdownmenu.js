define.experiment.newComponent('wysiwyg.viewer.components.menus.DropDownMenu.Dropdownmenu', function (componentDefinition, inheritStrategy) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition,
        strategy = inheritStrategy;

    def.inherits('wysiwyg.common.components.basicmenu.viewer.BasicMenu');

    def.resources(['W.Commands']);

    def.propertiesSchemaType('HorizontalMenuProperties');

    def.dataTypes(['MenuDataRef', 'Menu']);

    def.traits([
        'wysiwyg.common.components.dropdownmenu.viewer.traits.MenuPropertiesHandler',
        'wysiwyg.common.components.dropdownmenu.viewer.traits.MenuDataHandler',
        'wysiwyg.common.components.dropdownmenu.viewer.traits.MoreButtonHandler',
        'wysiwyg.common.components.dropdownmenu.viewer.traits.MenuDomBuilder'
    ]);

    def.states({
        buttonsAlignment: ['buttons-align-center', 'buttons-align-right', 'buttons-align-left', 'buttons-align-ignore'],
        textAlignment: ['text-align-right', 'text-align-left', 'text-align-center', 'text-align-ignore'],
        buttonsWidth: ['same-width', 'auto-width'],
        buttonsStretch: ['buttons-stretch', 'buttons-shrink'],
        subMenuOpenDirection: ['subMenuOpenDir-down', 'subMenuOpenDir-up']
    });

    def.skinParts({
        menuContainer: {type: 'htmlElement'},
        limitAspectRatio: {type: 'htmlElement', optional: true},
        hasExtraDecorations: {type: 'htmlElement', optional: true}
    });

    def.statics({
        LINK_ELEMENT_TAG: 'a',
        MORE_ELEMENT_TAG: 'span',
        MORE_ELEMENT_SELECTOR: 'moreButton',
        ASPECT_RATIO_LIMIT: 0.4
//        TAN_30: 0.577
    });

    def.binds(['_onSelectedPageChanged', '_setDirectionToOpenSubMenu']);

    def.methods({

        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._menuContainer = null;
            this.resources.W.Viewer.addEvent('pageTransitionStarted', this._onSelectedPageChanged);
            this._debounceDirection = _.debounce(this._setDirectionToOpenSubMenu, 100);
            this._debounceMarkWideSubmenus = _.debounce(this._markWideSubmenus, 500);

            window.addEvent('scroll', this._debounceDirection);
        },

        dispose: function(){
            window.removeEvent('scroll', this._debounceDirection);
            this.parent();
        },

        /*override*/
        isItemVisible: function (itemDataNode) {
            var linkId = itemDataNode.get('link'),
                href, pageData;

            if (!linkId) {
                return true;
            }
            href = this.resources.W.Data.getDataByQuery(linkId).get('pageId');
            if (!href) {
                return true;
            }
            pageData = this.resources.W.Data.getDataByQuery(href);
            return !pageData.get('hidePage');
        },

        /*@override*/
        getSelectedLinkId: function (pageId) {
            var linkItems = this._getAllMenuLinkDataItems(),
                currentPageLinkItem = this._getLinkDataItemOfCurrentPage(linkItems, pageId);
            return currentPageLinkItem && ('#' + currentPageLinkItem.get('id'));
        },

        _getAllMenuLinkDataItems: function () {
            var linkItems = [];

            if(this._menuContainer){
                _.forEach(this._menuContainer.getElements('li'), function (button) {
                    var linkId = button.get('linkId');
                    if (linkId !== 'undefined') {
                        linkItems.push(this.resources.W.Data.getDataByQuery(linkId));
                    }
                }, this);
            }

            return linkItems;
        },

        _getLinkDataItemOfCurrentPage: function (linkItems, pageId) {
            var currentPageId = '#' + (pageId || this.resources.W.Viewer.getCurrentPageId());
            return _.find(linkItems, function (item) {
                return item && item.get('pageId') === currentPageId;
            });
        },

        isRenderNeeded: function (invalidations) {
            var renderTriggers = [
                this.INVALIDATIONS.SKIN_CHANGE,
                this.INVALIDATIONS.DATA_CHANGE,
                this.INVALIDATIONS.WIDTH_REQUEST,
                this.INVALIDATIONS.HEIGHT_REQUEST,
                this.INVALIDATIONS.FIRST_RENDER,
                this.INVALIDATIONS.POSITION,
                this.INVALIDATIONS.STYLE_PARAM_CHANGE
            ];
            return invalidations.isInvalidated(renderTriggers);
        },

        _onRender: function (renderEvent) {
            var invalidations = renderEvent.data.invalidations;
            this.parent(renderEvent);
            this._debounceMarkWideSubmenus();
            if (invalidations.isInvalidated([this.INVALIDATIONS.FIRST_RENDER, this.INVALIDATIONS.POSITION])) {
                this._setDirectionToOpenSubMenu();
                this._setLineHeight(this.getHeight());
            }

            if (invalidations.isInvalidated([this.INVALIDATIONS.DATA_CHANGE])) {
                this._moveButtonsToAndFromMoreSubMenuIfNeeded();
            }
        },

        /*override*/
        _handleSkinChange: function () {
            this.parent();
            this._initButtonsWidthMap(this._menuContainer.getElements('li'));
            this._updateComponentAccordingToProperties();
            this._arrangeMenuAccordingToNewWidth(this.getWidth());
            this._setLineHeight(this.getHeight());
            this._setMenuNodeStyleParameters();
        },

        _initButtonsWidthMap: function (buttonList) {
            buttonList = buttonList || this._menuContainer.getElements('li');
            _.forEach(buttonList, function (button) {
                var buttonIdentifier = this._getButtonIdentifier(button);
                if (!this._buttonsWidthMap[buttonIdentifier]) {
                    this._buttonsWidthMap[buttonIdentifier] = {};
                }

                this._saveButtonMinWidth(button, buttonIdentifier);
                this._saveButtonExtraWidth(button, buttonIdentifier);
            }, this);
        },

        _getButtonIdentifier: function (button) {
            var linkItem, identifier, buttonLinkId = button.get('linkId');
            if (buttonLinkId === 'undefined') {
                return (_.toArray(this.getLabelElement(button).classList).contains(this.MORE_ELEMENT_SELECTOR) && this.MORE_ELEMENT_SELECTOR);
            }
            linkItem = this.resources.W.Data.getDataByQuery(buttonLinkId);
            identifier = linkItem && linkItem.get('pageId');
            return identifier && identifier.substring(1);
        },

        _saveButtonMinWidth: function (button, buttonIdentifier) {
            this._buttonsWidthMap[buttonIdentifier].minWidth = this._getButtonWidthIncludingMargins(button);
        },

        _saveButtonExtraWidth: function (button, buttonIdentifier) {
            if (!_.toArray(button.getParent().classList).contains('subMenu')) {
                var labelElement = this.getLabelElement(button);
                if(!this._buttonsWidthMap[buttonIdentifier]){
                    return;
                }
                this._buttonsWidthMap[buttonIdentifier].extraWidth = this._getButtonWidthIncludingMargins(button) - labelElement.getWidth();
            }
        },

        _getButtonWidthIncludingMargins: function(button){
            var marginsString = button.getStyles(['margin-left', 'margin-right']),
                marginLeft = parseInt(marginsString['margin-left'], 0),
                marginRight = parseInt(marginsString['margin-right'], 0);

            return this._getButtonWidth(button) + marginLeft + marginRight;
        },

        _arrangeMenuAccordingToNewWidth: function (newWidth) {
            this._moveButtonsToAndFromMoreSubMenuIfNeeded(newWidth);
            this._updateComponentAccordingToProperties();
            if (this._menuContainer.getChildren().length === 1) {
                this._setMenuMinWidth();
            }
        },

        _setLineHeight: function (newHeight) {
            this._menuContainer.getChildren().forEach(function(node){
                var label = node.getElement('.label');
                if(label){
                    label.setStyle('line-height', newHeight);
                }
            });
        },

        _updateComponentAccordingToProperties: function () {
            var componentProperties = this.getComponentProperties(),
                propertiesSchema = componentProperties.getSchema();
            _(propertiesSchema).forEach(function (propertyValue, propertyName) {
                this.setMenuProperty(componentProperties, propertyName, componentProperties.get(propertyName));
            }, this);
        },

        _setMenuMinWidth: function () {
            var visibleButton = this._menuContainer.getFirst(),
                buttonMinWidth = this._getButtonMinWidth(visibleButton);

            this.setMinW(buttonMinWidth);
            //set width for ellipsis
            //            this.getLabelElement(visibleButton).setStyle('width', visibleButton.getWidth() - (parseFloat(visibleButton.getStyle('padding-left')) * 2));
        },

        _getButtonMinWidth: function (button, buttonList) {
            buttonList = buttonList || this._menuContainer.getChildren();
            if (this._properties.get('sameWidthButtons')) {
                buttonList = buttonList.indexOf(button) === -1 ? buttonList.concat(button) : buttonList;
                button = _.max(buttonList, function (child) {
                    return this._buttonsWidthMap[this._getButtonIdentifier(child)].minWidth;
                }, this);
            }
            return this._buttonsWidthMap[this._getButtonIdentifier(button)].minWidth;
        },

        //is this needed???
        _setMenuNodeStyleParameters: function () {
            this._view.setStyle('min-width', this.getWidth());
        },

        /*override*/
        getLabelElemTag: function (dataItem) {
            var linkId = dataItem.get('link');
            if (!linkId) {
                return this.MORE_ELEMENT_TAG;
            }
            return this.LINK_ELEMENT_TAG;
        },

        /*override*/
        getLabelElementsIdentifiers: function () {
            return [this.LINK_ELEMENT_TAG, '.moreButton'];
        },

        /*override*/
        getLabelElemParams: function (dataItem) {
            var linkId = dataItem.get('link'),
                href;
            if (!linkId) {
                return {html: this._properties.get('moreButtonLabel'), "class": 'label moreButton'};
            }
            href = this.resources.W.Data.getDataByQuery(linkId).get('pageId');
            return {html: dataItem.get('label'), href: href, 'class': 'label'};
        },

        /*@override*/
        getItemLabel: function (mainMenuData) {
            if (!mainMenuData) {
                return '';
            }
            var href = this._getHrefValue(mainMenuData),
                pageData;
            if (!href || !href.indexOf || href.indexOf('#') !== 0) {
                return '';
            }

            pageData = this.resources.W.Data.getDataByQuery(href);
            return pageData.get('title');
        },

        _onSelectedPageChanged: function (selectedPageId) {
            var linkId = this.getSelectedLinkId(selectedPageId);
            this._setSelectedButton(linkId);
        },
        /**
         * Decides the direction (up/down) to open the sub-menu:
         * If the component is on the upper half of the screen - open the sub-menu downwards, and vise-versa
         * @private
         */
        _setDirectionToOpenSubMenu: function () {
            var viewPortHeight = this._getScreenHeight(),
                viewPortMiddle = Math.floor(viewPortHeight / 2),
                menuPosY = this.getGlobalPosition().y - window.scrollY,
                directionToOpen = viewPortMiddle > menuPosY ? 'down' : 'up';

            this._directionToOpen = directionToOpen;
            this.setState('subMenuOpenDir-' + directionToOpen, 'subMenuOpenDirection');   
        },
        /**
         * Helper function: Returns the screen height
         * @returns {Number|number}
         * @private
         */
        _getScreenHeight: function () {
            return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        },

        setHeight: function(height){
            this.parent(height);
            this._setLineHeight(height);
        }

    });
});