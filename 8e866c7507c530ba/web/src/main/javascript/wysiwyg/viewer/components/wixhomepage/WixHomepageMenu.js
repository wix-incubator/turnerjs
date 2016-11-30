/**
 * @Class wysiwyg.viewer.components.wixhomepage.WixHomepageMenu
 * @extends mobile.core.components.base.BaseComponent
 */
define.component('wysiwyg.viewer.components.wixhomepage.WixHomepageMenu', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("mobile.core.components.base.BaseComponent");

    def.binds(['_populateMenu','_getData']);

    def.skinParts({
        buttonsContainer: { type: 'htmlElement' },
        buttonTemplate: { type: 'htmlElement' }
    });

    def.states(["topMenu", "bottomMenu"]);

    def.dataTypes(['WixHomepageMenu']);

    /**
     * @lends wysiwyg.viewer.components.wixhomepage.WixHomepageMenu
     */
    def.methods({
        render: function(){
            this._getData();
            this._populateMenu();
            this._setMenuType();
        },

        _setMenuType: function() {
            var menuType = this._data.get("menuDataSource");
            this.setState(menuType);
        },

        _getData: function() {
            var dataName = this._data.get("menuDataSource");
            var currentLangCode = this._getLanguage();

            // try to take the data from a global variable that was embeded into the page
            if (window['wixhomepage'] && window['wixhomepage'][dataName] && window['wixhomepage'][dataName][currentLangCode])
            {
                this._menuData = window['wixhomepage'][dataName][currentLangCode];
            }
            else
            {
                // We didn't find the menu, create something (For QA)
                this._menuData = [
                    {label:'Create',    link:'/create/website'},
                    {label:'Explore',   link:'/sample/website'},
                    {label:'Features',  link:'/about/features'},
                    {label:'My Account',link:'/create/my-account'},
                    {label:'Premium',   link:'/upgrade/website'},
                    {label:'Support',   link:'/support/'}
                ];
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
                // We have a fallback to the error (returning 'en'), so I didn't using the () at the end of this call to the LOG
                LOG.reportError(wixErrors.USER_MANAGER_NOT_FOUND, "WixHomepageMenu", '_getLanguage');
                return 'en';
            }
        },

        _insertButton: function(item){
            var button = this._skinParts.buttonTemplate.cloneNode(true);
            button.setAttribute("isTemplate", "false");

            var aElement = button.getElements('.buttonLink')[0];
            aElement.setAttribute("href", item.link);
            aElement.innerHTML = item.label;
            button.insertInto(this._skinParts.buttonsContainer);
        },

        _populateMenu: function(){
            var i;
            this._skinParts.buttonsContainer.empty();

            for (i = 0, l = this._menuData.length; i < l; i++){
                this._insertButton(this._menuData[i]);
            }
        }
    });
});
