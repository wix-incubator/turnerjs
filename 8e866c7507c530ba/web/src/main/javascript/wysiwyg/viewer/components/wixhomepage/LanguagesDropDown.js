/**
 * @Class wysiwyg.viewer.components.wixhomepage.LanguagesDropDown
 * @extends mobile.core.components.base.BaseComponent
 */
define.component('wysiwyg.viewer.components.wixhomepage.LanguagesDropDown', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("mobile.core.components.base.BaseComponent");

    def.binds([
        '_initMenu', '_populateDropDown', '_updateSelection', '_changeLanguage',
        '_onFocus', '_onBlur', '_onOptionClick', '_onKeyPress', '_changeLanguageSuccess', '_changeLanguageFailed'
    ]);

    def.skinParts({
        select : { type: 'htmlElement' },
        options: { type: 'htmlElement' }
    });

    def.states({mouse: ['selected']});

    def.statics({
        CLASS_NAME_SELECTED: 'selected',
        CLASS_NAME_OPTION_CONTAINER: 'optionContainer'
    });

    /**
     * @lends wysiwyg.viewer.components.wixhomepage.LanguagesDropDown
     */
    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this._selectedOption = null;

            // try to take the data from a global variable that was embeded into the page
            if (window['wixhomepage'] && window['wixhomepage']['languagesDropDownData'])
            {
                this._menuData = window['wixhomepage']['languagesDropDownData'];
            }
            else
            {
                this._menuData = [
                    {languageCode:'en', languageSubdomain:'www', iconURL:'', languageLabel:'English'},
                    {languageCode:'de', languageSubdomain:'de',  iconURL:'', languageLabel:'Deutsch'},
                    {languageCode:'es', languageSubdomain:'es',  iconURL:'', languageLabel:'Español'},
                    {languageCode:'fr', languageSubdomain:'fr',  iconURL:'', languageLabel:'Français'},
                    {languageCode:'it', languageSubdomain:'it',  iconURL:'', languageLabel:'Italiano'},
                    {languageCode:'pl', languageSubdomain:'pl',  iconURL:'', languageLabel:'Polski'},
                    {languageCode:'pt', languageSubdomain:'pt',  iconURL:'', languageLabel:'Português'},
                    {languageCode:'ru', languageSubdomain:'ru',  iconURL:'', languageLabel:'Pусский'}
                ];
            }
        },

        _onAllSkinPartsReady: function(){
            this._initMenu();
        },

        /**
         * get menu data, populate the menu and register listeners
         */
        _initMenu: function(){
            this._populateDropDown();

            this._skinParts.select.addEvent(Constants.CoreEvents.CHANGE, this._changeLanguage);
            this._skinParts.select.addEvent(Constants.CoreEvents.CLICK, this._onFocus);
            this._skinParts.options.addEvent(Constants.CoreEvents.CLICK, this._onOptionClick);
        },

        /**
         * on select click
         * @param event
         */
        _onFocus: function(event){
            event.stopPropagation();
            if (this.getState('mouse') == 'selected'){
                this._onBlur(event);
                return;
            }
            this.setState('selected', 'mouse');
            document.body.addEvent(Constants.CoreEvents.CLICK, this._onBlur);
            document.body.addEvent(Constants.CoreEvents.KEY_DOWN, this._onKeyPress);
        },

        /**
         * hide the select list
         * @param event
         */
        _onBlur: function(event){
            event.stopPropagation();
            this.removeState('selected', 'mouse');
            document.body.removeEvent(Constants.CoreEvents.CLICK, this._onBlur);
            document.body.removeEvent(Constants.CoreEvents.KEY_DOWN, this._onKeyPress);
        },

        /**
         * handle click on an option
         * @param event
         */
        _onOptionClick: function(event){
            event = event || {};

            var option = event.target;
            // looking for the real option (This is where out data is)
            while (option!==this._skinParts.options && option.hasClass(this.CLASS_NAME_OPTION_CONTAINER)==false)
            {
                option = option.parentNode;
            }

            var newSubDomain = option.getAttribute('data-subdomain');
            var languageCode = option.getAttribute('data-languagecode');
            var currentLanguage = this._getLanguage();

            this._setSelected(option);

            // Fire the event only on the site viewMode.
            if (window.viewMode == "site" && newSubDomain && languageCode && languageCode != currentLanguage) {
                this._skinParts.select.fireEvent(Constants.CoreEvents.CHANGE, {value: newSubDomain});
            }

            this._onBlur(event);
        },

        /**
         * handle keyboard navigation
         * @param event
         */
        _onKeyPress: function(event){
            event.stopPropagation();

            switch (event.key){
                case 'up':
                    var previous = this._selectedOption.getPrevious();
                    if (!previous){
                        previous = this._skinParts.options.getLast();
                    }
                    this._setSelected(previous);
                    event.preventDefault();
                    break;
                case 'down':
                    this._setSelected(this._selectedOption.getNext());
                    event.preventDefault();
                    break;
                case 'enter':
                case 'space':
                    event.target = this._selectedOption;
                    this._onOptionClick(event);
                    break;
                case 'esc':
                case 'tab':
                    this._onBlur(event);
                    break;
            }
        },

        /**
         * handle option selection
         * @param option
         */
        _setSelected: function(option){
            var select = this._skinParts.select;
            var options = this._skinParts.options;
            var prevOption = this._skinParts.options.getElement('.' + this.CLASS_NAME_SELECTED);

            if (prevOption){
                prevOption.removeClass(this.CLASS_NAME_SELECTED);
            }

            option = option || this._skinParts.options.getFirst();
            option.addClass(this.CLASS_NAME_SELECTED);

            select.setAttribute('data-subdomain', option.getAttribute('data-subdomain'));
            select.setAttribute('data-languagecode', option.getAttribute('data-languagecode'));
            select.set('html', option.get('html'));

            var optionPos = option.getPosition(options).y;
            var scrollPos = options.getScroll().y;

            if (optionPos > options.getSize().y + scrollPos || optionPos < 0){
                options.scrollTo(0, optionPos);
            }
            this._selectedOption = option;
        },

        /**
         * repopulate the options list on #MAIN_MENU changes
         */
        _populateDropDown: function(){
            var i, j, k, l, subItems;
            this._skinParts.select.empty();
            this._skinParts.options.empty();

            for (i = 0, l = this._menuData.length; i < l; i++){
                this._insertOption(this._menuData[i]);
            }
            this._updateSelection();
        },

        /**
         * Insert individual options and register changeEvent on page names
         * @param item
         * the item in #MAIN_MENU
         */
        _insertOption: function(item){
            var option = new Element('li', { 'html': item.languageLabel });
            var icon = new Element('image');
            //            var span = new Element('span', { 'html': item.languageLabel });

            option.addClass(this.CLASS_NAME_OPTION_CONTAINER);

            if (item.iconURL)
            {
                icon.setAttribute('src', item.iconURL);
                icon.inject(option);
            }
            //            span.inject(option);

            option.insertInto(this._skinParts.options);
            option.setAttribute('data-subdomain', item.languageSubdomain);
            option.setAttribute('data-languagecode', item.languageCode);

            option.addEvent(Constants.CoreEvents.CLICK, this._onOptionClick);
        },

        /**
         * Return an option element with the data-subdomain "subDomain"
         * @param subDomain
         * @return {Element}
         */
        _getOptionBySubDomain: function(subDomain){
            return this._skinParts.options.getElement('[data-subdomain="' + subDomain + '"]');
        },

        /**
         * Change the language was successful
         */
        _changeLanguageSuccess: function () {
            var newSubDomain = this._skinParts.select.getAttribute('data-subdomain');
            var hostNoSubDomain = location.hostname.substring(location.hostname.indexOf('.'));

            var newURL = location.protocol + "//" + newSubDomain + hostNoSubDomain + location.pathname + location.search + location.hash;

            // Refreshing the page (If it's the same URL)
            if (location.href.toLowerCase() == newURL.toLowerCase()) {
                location.reload();
            } else {
                location.href = newURL;
            }
        },

        /**
         * Change the language failed
         */
        _changeLanguageFailed: function (xhrObj) {
        },

        /**
         * Change the language
         */
        _changeLanguage: function(){
            var languageCode = this._skinParts.select.getAttribute('data-languagecode');

            if (window['userApi'])
            {
                window['userApi'].setLanguage(languageCode, this._changeLanguageFailed, this._changeLanguageSuccess);
            }
            else
            {
                LOG.reportError(wixErrors.USER_MANAGER_NOT_FOUND, "LanguagesDropDown", '_changeLanguage')();
            }
        },

        /**
         * get the current language
         */
        _getLanguage: function(){
            if (window['userApi'])
            {
                return window['userApi'].getLanguage();
            }
            else
            {
                LOG.reportError(wixErrors.USER_MANAGER_NOT_FOUND, "LanguagesDropDown", '_getLanguage')();
                return 'en';
            }
        },

        /**
         * Change the selection according to the current subdomain
         */
        _updateSelection: function(){
            var subDomain;
            if (window['userApi'])
            {
                subDomain = window['userApi'].getLanguage();
            }
            else
            {
                subDomain = 'www';
            }
            var option = this._getOptionBySubDomain(subDomain);
            this._setSelected(option);
        },

        /**
         * On dispose - remove all external event bindings
         */
        _removeAllDomEvents: function(){
            document.body.removeEvent(Constants.CoreEvents.CLICK, this._onBlur);
            document.body.removeEvent(Constants.CoreEvents.KEY_DOWN, this._onKeyPress);
        },

        /**
         * @override
         */
        dispose: function(){
            this._removeAllDomEvents();
            this.parent();
        }
    });
});