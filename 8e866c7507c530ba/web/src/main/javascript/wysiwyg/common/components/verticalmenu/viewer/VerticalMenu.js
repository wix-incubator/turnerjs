define.component('wysiwyg.common.components.verticalmenu.viewer.VerticalMenu', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.common.components.basicmenu.viewer.BasicMenu');

    def.traits(['wysiwyg.common.components.verticalmenu.viewer.traits.MenuDataHandler']);

    def.binds(['_onSelectedPageChanged']);

    def.propertiesSchemaType('VerticalMenuProperties');

    def.dataTypes(['MenuDataRef', 'Menu']);  //MenuDataRef is defined in BasicMenuItemDataSchema (it point to  menuRef: "#MAIN_MENU" by default)

    def.skinParts({
        menuContainer: {type: 'htmlElement'}
    });

    def.states({
        itemsAlignment: ['items-align-right', 'items-align-left', 'items-align-center'],
        subItemsAlignment: ['subItems-align-right', 'subItems-align-left', 'subItems-align-center'],
        subMenuOpenSide: ['subMenuOpenSide-left', 'subMenuOpenSide-right'],
        subMenuOpenDirection: ['subMenuOpenDir-down', 'subMenuOpenDir-up'],
        itemsWidth: ['itemsWidth-fixed', 'itemsWidth-notFixed'],
        subItemsWidth: ['subItemsWidth-fixed', 'subItemsWidth-notFixed']
    });

    def.statics({
        _previouseItemHeight: 45  //Default item height
    });

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._menuContainer = null;
            this.resources.W.Viewer.addEvent('pageTransitionStarted', this._onSelectedPageChanged);
        },

        /**
         * Overridden in editor part
         * @param renderEvent
         * @private
         */
        _onRender: function(renderEvent) {
            this.parent(renderEvent);
            var invalidations = renderEvent.data.invalidations;

            if (invalidations.isInvalidated([
                this.INVALIDATIONS.FIRST_RENDER
            ])) {
                this._setItemsHeight();  //dontRecalculateHeight = true (use the default item height)
                this._updateComponentAccordingToProperties();
            }

            if (invalidations.isInvalidated([this.INVALIDATIONS.POSITION])) {
                this._setDirectionToOpenSubMenu();
            }
        },

        isRenderNeeded: function(invalidations) {
            var renderTriggers = [
                this.INVALIDATIONS.FIRST_RENDER,
                this.INVALIDATIONS.SKIN_CHANGE,
                this.INVALIDATIONS.DATA_CHANGE,
                this.INVALIDATIONS.HEIGHT_REQUEST,
                this.INVALIDATIONS.STYLE_PARAM_CHANGE,
                this.INVALIDATIONS.PART_SIZE,
                this.INVALIDATIONS.SIZE,
                this.INVALIDATIONS.POSITION
            ];
            return invalidations.isInvalidated(renderTriggers);
        },

        /**
         * Just a wrapper function: Set alignment and opening direction according to properties
         * @private
         */
        _updateComponentAccordingToProperties: function() {
            var componentProperties = this.getComponentProperties();
            this._setItemsAlignment(componentProperties.get('itemsAlignment'));
            this._setSideToOpenSubMenu(componentProperties.get('subMenuOpenSide'));
        },

        /**
         * Set the text alignment inside menu items and sub-menu items
         * @param {String} dir
         * @private
         */
        _setItemsAlignment: function(dir) {
            this.setState('items-align-' + dir, 'itemsAlignment');
            this.setState('subItems-align-' + dir, 'subItemsAlignment');
        },

        /**
         * Handler for 'pageTransitionStarted' event
         * @param selectedPageId
         * @private
         */
        _onSelectedPageChanged: function(selectedPageId) {
            var selectedLinkId = this.getSelectedLinkId(selectedPageId);
            this._setSelectedButton(selectedLinkId);
        },

        /**
         * Sets height (on items nodes) and line-height (on label nodes) according to component height
         * @param {Boolean=} dontRecalculateHeight - if true we use this._previouseItemHeight
         * @private
         */
        _setItemsHeight: function (dontRecalculateHeight) {
            var allItems = this._skinParts.menuContainer.getElements('li');
            var topLevelItemsCount = this._skinParts.menuContainer.getChildren().length;
            if(topLevelItemsCount === 0) { return; }
            var separatorHeight = this._getSkinParamValue('separatorHeight');
            var borderHeight = this._getSkinParamValue('brw') * 2;
            var isSepNotIncludedInLineHeight = !!this._getSkinStaticMember('separatorNotIncludedInLineHeight');
            var isBorderNotIncludedInLineHeight = !!this._getSkinStaticMember('borderNotIncludedInLineHeight');
            var height = this.getHeight();
            var itemHeight = (dontRecalculateHeight) ? this._previouseItemHeight : Math.floor((height + separatorHeight)/ topLevelItemsCount);

            // Adding an extra 2 pixels to accommodate for the font's own line height not being exactly centered
            var labelLineHeight = 2 + itemHeight -
                (isSepNotIncludedInLineHeight ? separatorHeight : 0) -
                (isBorderNotIncludedInLineHeight ? borderHeight : 0);

            //Distribute height equally between top-level item. Child items get the same height
            _.forEach(allItems, function (item) {
                var labelElement = this.getLabelElement(item);
                item.setStyle('height', itemHeight + 'px');
                labelElement.setStyle('line-height', labelLineHeight + 'px');
            }, this);

            // Set arrow-head borders sizes
            // TODO - uncomment when Arrow skin is ready
            //this._setArrowsHeight(itemHeight);

            //Adjust component size if top level items count changed
            //We can't count on the ComponentMeasurer to fix the component (view node) height
            //Because it can't make the component smaller (because of min-height attribute)
            //Also adjust the size if teh required calculated size is different than the current one
            var newHeight = topLevelItemsCount*itemHeight - separatorHeight;
            if(this._previouseTopLevelItemsCount !== topLevelItemsCount || newHeight !== height) {
                this.setHeight(newHeight);
            }

            this._previouseItemHeight = itemHeight;
            this._previouseTopLevelItemsCount = topLevelItemsCount;
        },

        /**
         * Set arrow-head borders sizes
         * Applies to skins containing arrows (Arrow skin)
         * @param itemHeight
         * @private
         */
        _setArrowsHeight: function(itemHeight) {
            var arrows = this._skinParts.menuContainer.getElements('.arrow .inner');
            if (arrows && arrows.length) {
                var triangleVerticalBorderWidth = Math.ceil(itemHeight / 2);

                _.forEach(arrows, function(inner) {
                    inner.setStyle('border-top-width', triangleVerticalBorderWidth + 'px');
                    inner.setStyle('border-bottom-width', triangleVerticalBorderWidth + 'px');
                }, this);
            }
        },

        /**
         * Set the opening direction of sub-menus
         * @param {String=} sideToOpen left|right
         * @private
         */
        _setSideToOpenSubMenu: function (sideToOpen) {
            sideToOpen = sideToOpen || this.getComponentProperties().get('subMenuOpenSide');
            this.setState('subMenuOpenSide-' + sideToOpen, 'subMenuOpenSide');
        },

        /**
         * Decides the direction (up/down) to open the sub-menu:
         * If the component is on the upper half of the screen - open the sub-menu downwards, and vise-versa
         * @private
         */
        _setDirectionToOpenSubMenu: function () {
            var viewPortHeight = this._getScreenHeight();
            var viewPortMiddle = Math.floor(viewPortHeight / 2);
            var menuPosY = this.getGlobalPosition().y;
            var directionToOpen = ((viewPortMiddle - menuPosY) > 0) ? 'down' : 'up';
            this._directionToOpen = directionToOpen;
            this.setState('subMenuOpenDir-' + directionToOpen, 'subMenuOpenDirection');
        },

        /**
         * Helper function: Returns the value of a given skin parameter (return 0 if it doesn't exist)
         * @param paramName
         * @returns {_amount|*|core.utils.css.Size._amount|number}
         * @private
         */
        _getSkinParamValue: function (paramName) {
            var skin = this.getSkin();
            var paramValueObj = skin.getParamValue(paramName);
            return (paramValueObj) ? paramValueObj._amount : 0;
        },

        /**
         * Helper function: Returns the value of a given static member (return null if it doesn't exist)
         * @param name
         * @returns {*|null}
         * @private
         */
        _getSkinStaticMember: function (name) {
            var skin = this.getSkin();
            return skin[name] || null;
        },

        /**
         * Helper function: Returns the screen width
         * @returns {Number|number}
         * @private
         */
        _getScreenWidth: function () {
            return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        },

        /**
         * Helper function: Returns the screen height
         * @returns {Number|number}
         * @private
         */
        _getScreenHeight: function () {
            return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        }
    });
});