define.experiment.newClass('wysiwyg.common.components.dropdownmenu.viewer.traits.MenuDomBuilder.Dropdownmenu', function (classDefinition) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.common.components.basicmenu.viewer.traits.MenuDomBuilder');

    def.methods({
        buildItemList: function () {
            this._menuContainer.set('html', '');
            this._buildMenuDomAccordingToData(this._menuDataNP.get('items'), this._menuContainer);
            this._renderLinks(this._menuContainer.getChildren(), this._menuDataNP.get('items'));
            this._setMenuMinHeight();
            this._setSelectedButton(this.getSelectedLinkId());
            this._menuContainer.on('click', this, this._onMenuClicked);

            this._debounceMarkWideSubmenus();
        },

        _arrangeItem: function(itemElement, parent) {
            itemElement.removeAttribute('skinpart');
            itemElement.insertInto(parent);
        },

        _markEmptySubMenu: function (subMenuContainer) {
            subMenuContainer.parentNode.addClass('emptySubMenu');
        },

        _markWideSubmenus: function () {
            var children = this._menuContainer.getChildren(), submenuNode,
                alignButtons = this.getComponentProperty('alignButtons'),
                stretch = this.getComponentProperty('stretchButtonsToMenuWidth'),
                buttonsAlignmentCenterOrStretch = alignButtons === 'center' || stretch;

            children.forEach(function (node) {
                submenuNode = node.getElement('.subMenu');
                if (!submenuNode) {
                    return;
                }

                if (buttonsAlignmentCenterOrStretch && submenuNode.getWidth() > node.getWidth()) {
                    submenuNode.addClass('submenuWide');
                    this._centerSubmenu(node, submenuNode);
                } else {
                    submenuNode.removeClass('submenuWide');

                    if (stretch) {
                        this._setSubmenuLeftRight(submenuNode, null, null);
                    } else {
                        switch (alignButtons) {
                            case 'left':
                                this._setSubmenuLeftRight(submenuNode, 0, null);
                                break;
                            case 'right':
                                this._setSubmenuLeftRight(submenuNode, null, 0);
                                break;
                            default:
                                this._setSubmenuLeftRight(submenuNode, null, null);
                                break;
                        }
                    }
                }
            }.bind(this));
        },

        _centerSubmenu: function (node, submenuNode) {
            var leftPosition = (node.getWidth() - submenuNode.getWidth()) / 2;
            this._setSubmenuLeftRight(submenuNode, leftPosition, null);
        },

        _setSubmenuLeftRight: function (submenuNode, left, right) {
            submenuNode.setStyles({'left': left, 'right': right});
        }
    });
});