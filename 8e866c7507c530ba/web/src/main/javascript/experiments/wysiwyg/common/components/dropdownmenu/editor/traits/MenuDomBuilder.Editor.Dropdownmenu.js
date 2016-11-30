define.experiment.newClass('wysiwyg.common.components.dropdownmenu.editor.traits.MenuDomBuilder.Dropdownmenu', function(classDefinition) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.common.components.dropdownmenu.viewer.traits.MenuDomBuilder');

    def.methods({

        buildItemList: function() {
            var menuRef = this._data.get('menuRef');

            if (menuRef === '#MAIN_MENU' || menuRef === 'MAIN_MENU') {
                this._removePagesEventListeners();
                this._removeHiddenPagesEventListeners();
                this._build();
                this._addPagesEventListeners();
                this._addHiddenPagesEventListeners();
            }
            else {
                this._build();
            }
        },

        _build: function() {
            this._menuContainer.set('html', '');
            this._buildMenuDomAccordingToData(this._menuDataNP.get('items'), this._menuContainer);
            this._renderLinks(this._menuContainer.getChildren(), this._menuDataNP.get('items'));
            this._setMenuMinHeight();
            this._setSelectedButton(this.getSelectedLinkId());
            this._menuContainer.on('click', this, this._onMenuClicked);

            this._debounceMarkWideSubmenus();
        }
    });
});