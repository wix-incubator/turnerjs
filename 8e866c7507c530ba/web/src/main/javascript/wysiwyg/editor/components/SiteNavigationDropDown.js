//This file was auto generated when experiment PagesDropDown.New was promoted to feature (Mon Jul 30 15:58:23 IDT 2012)

define.component('wysiwyg.editor.components.SiteNavigationDropDown', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.traits(['wysiwyg.editor.components.traits.DropDownComponent']);

    def.resources(['W.Commands']);

    def.binds(['_initMenu', '_populateDropDown', '_updateSelection', '_gotoSelectedPage', '_updatePageName', '_onOptionClick']);

    def.skinParts({
        label: { type: 'htmlElement', autoBindDictionary: "NAVIGATION_DROP_DOWN_LABEL" },
        select: { type: 'htmlElement' },
        options: { type: 'htmlElement' }
    });
    def.statics({
        CLASS_NAME_CHILD: 'child',
        CLASS_NAME_SELECTED: 'selected',
        CLASS_NAME_BOLD: 'bold',
        _onFocusBIEvent: wixEvents.OPEN_PAGES_NAVIGATOR
    });
    def.states({mouse: ['selected']});
    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._selectedOption = null;
            this._menuData = null;
        },

        /**
         * Initialize menu data or wait for site ready
         */
        _onAllSkinPartsReady: function () {
            if (this.injects().Preview.isSiteReady()) {
                this._menuData = this.injects().Preview.getPreviewManagers().Data.getDataByQuery("#MAIN_MENU");
                this._initMenu();
            } else {
                this._initOnSiteReady();
            }
        },

        /**
         * if invoked before the site is ready (== before #MAIN_MENU is ready)
         * listen to site ready and only then continue.
         */
        _initOnSiteReady: function () {
            var readyCommand = this.resources.W.Commands.getCommand('EditorCommands.SiteLoaded');
            if (!readyCommand) {
                this.resources.W.Commands.registerCommandAndListener('EditorCommands.SiteLoaded', this, this._initMenu);
            } else {
                readyCommand.registerListener(this, this._initMenu);
            }
        },

        /**
         * get menu data, populate the menu and register listeners
         */
        _initMenu: function(){
            this._menuData = this._menuData || this.injects().Preview.getPreviewManagers().Data.getDataByQuery("#MAIN_MENU");
            this._populateDropDown();

            this._menuData.addEvent(Constants.DataEvents.DATA_CHANGED, this._populateDropDown);
            this.injects().Editor.addEvent(Constants.EditorEvents.SITE_PAGE_CHANGED, this._updateSelection);

            this._skinParts.select.addEvent(Constants.CoreEvents.CHANGE, this._gotoSelectedPage);
            this._skinParts.select.addEvent(Constants.CoreEvents.MOUSE_DOWN, this._onFocus);
            this._skinParts.options.addEvent(Constants.CoreEvents.CLICK, this._onOptionClick);
        },

        getSelectedOption: function() {
            return this._selectedOption;
        },

        getOptions: function() {
            return this._skinParts.options.getChildren();
        },

        setSelected: function(option) {
            this._setSelected(option);
        },

        setActiveState: function(isActive) {
            isActive ? this.setState('selected', 'mouse') : this.removeState('selected', 'mouse');
        },
        /**
         * handle click on an option
         * @param event
         */
        _onOptionClick: function (event) {
            event = event || {};
            var option = event.target,
                value = option.getAttribute('value');
            if(!value){
                return;
            }
            this._setSelected(option);
            this._skinParts.select.fireEvent(Constants.CoreEvents.CHANGE, {value: value});
            this._onBlur(event);
        },

        /**
         * handle option selection
         * @param option
         */
        _setSelected: function (option) {
            var select = this._skinParts.select;
            var options = this._skinParts.options;
            var prevOption = this._skinParts.options.getElement('.' + this.CLASS_NAME_SELECTED);

            if (prevOption) {
                prevOption.removeClass(this.CLASS_NAME_SELECTED);
            }

            option = option || this._skinParts.options.getFirst();
            option.addClass(this.CLASS_NAME_SELECTED);

            select.setAttribute('value', option.getAttribute('value'));
            select.set('html', option.get('html'));

            var optionPos = option.getPosition(options).y;
            var scrollPos = options.getScroll().y;

            if (optionPos > options.getSize().y + scrollPos || optionPos < 0) {
                options.scrollTo(0, optionPos);
            }
            this._selectedOption = option;
        },

        /**
         * repopulate the options list on #MAIN_MENU changes
         */
        _populateDropDown: function () {
            var i, j, k, l, subItems;
            var items = this._menuData.getItems();
            this._skinParts.select.empty();
            this._skinParts.options.empty();

            for (i = 0, l = items.length; i < l; i++) {

                this._insertOptionByDataItem(items[i], false);

                subItems = items[i].get('items');
                for (j = 0, k = subItems.length; j < k; j++) {
                    this._insertOptionByDataItem(subItems[j], true);
                }
            }
            this._updateSelection();
        },

        /**
         * Create new option element
         * @param label - the option's displayed label
         * @param value - the option's value
         * @param isChild - true for sub menu
         */
        _createOption: function (label, optionValue, isChild) {
            var option = new Element('span', {
                'html': label
            });
            if (isChild) {
                option.addClass(this.CLASS_NAME_CHILD);
            } else {
                option.addClass(this.CLASS_NAME_BOLD);
            }
            option.setAttribute('value', optionValue);
            return option;
        },

        /**
         * Insert individual options and register changeEvent on page names
         * @param item - dataItem
         * @param isChild
         */
        _insertOptionByDataItem: function (item, isChild) {
            var ref = item.get('refId');
            var refItem = this.injects().Preview.getPreviewManagers().Data.getDataByQuery(ref);
            refItem.addEvent(Constants.DataEvents.DATA_CHANGED, this._updatePageName);
            var label = refItem.get('title') || '';
            var optionValue = (ref.indexOf('#') === 0) ? ref.substr(1) : ref;
            var newOption = this._createOption(label, optionValue, isChild);
            newOption.insertInto(this._skinParts.options);
        },

        /**
         * Return an option element with the value "value"
         * @param value
         * @return {Element}
         */
        _getOptionByValue: function (value) {
            return this._skinParts.options.getElement('[value="' + value + '"]');
        },

        /**
         * Update page names on change
         * @param data
         */
        _updatePageName: function (data) {
            var refId = data.get('id');
            var option = this._getOptionByValue(refId);
            var select = this._skinParts.select;
            var title = data.get('title') || '';

            option.set('html', title);
            if (select.getAttribute('value') === refId) {
                select.set('html', title);
            }
        },

        /**
         * Switch to page in 'value' on change
         */
        _gotoSelectedPage: function () {
            var id = this._skinParts.select.getAttribute('value');
            this.injects().Commands.executeCommand("EditorCommands.gotoSitePage", id);
        },

        /**
         * Change the selection according to the current page
         */
        _updateSelection: function () {
            var currentPageId = this.injects().Preview.getPreviewManagers().Viewer.getCurrentPageId();
            var option = this._getOptionByValue(currentPageId);
            this._setSelected(option);
        },

        /**
         * On dispose - remove all data bindings
         */
        _removeAllDataEvents: function () {
            var i, j, k, l, subItems;
            var items = this._menuData.getItems();
            for (i = 0, l = items.length; i < l; i++) {

                items[i].get('refId').removeEvent(Constants.DataEvents.DATA_CHANGED, this._updatePageName);
                subItems = items[i].get('items');

                for (j = 0, k = subItems.length; j < k; j++) {
                    subItems[j].get('refId').removeEvent(Constants.DataEvents.DATA_CHANGED, this._updatePageName);
                }
            }
            this._menuData.removeEvent(Constants.DataEvents.DATA_CHANGED, this._populateDropDown);
        },

        /**
         * Override the default behavior to allow actions like copy/paste, etc.
         *
         * @returns {boolean}
         */
        stopPropagationOnDropdown: function() {
            return false;
        },

        /**
         * @override
         */
        dispose: function () {
            this._removeAllDataEvents();
            this.parent();
        }
    });

});
