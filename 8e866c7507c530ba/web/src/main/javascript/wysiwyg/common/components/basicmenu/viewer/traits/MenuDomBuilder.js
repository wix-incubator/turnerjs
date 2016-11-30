define.Class('wysiwyg.common.components.basicmenu.viewer.traits.MenuDomBuilder', function(classDefinition) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.methods({

        buildItemList: function() {
            this._menuContainer.set('html', '');
            this._buildMenuDomAccordingToData(this._menuDataNP.get('items'), this._menuContainer);
            this._renderLinks(this._menuContainer.getChildren(), this._menuDataNP.get('items'));
            this._setMenuMinHeight();
            this._setSelectedButton(this.getSelectedLinkId());
            this._menuContainer.on('click', this, this._onMenuClicked);
        },

        _onMenuClicked: function(evt) {
            var targetElement = evt.target,
                targetButton = targetElement.tagName.toLowerCase() === 'li' ? targetElement : targetElement.getParent('li'),
                linkId = targetButton.get('linkId'),
                linkItem, pageId;

            if(linkId && linkId !== 'undefined'){
                linkItem = this.resources.W.Data.getDataByQuery(linkId);
                pageId = linkItem.get('pageId').substring(1);
                this.resources.W.Viewer.goToPage(pageId);
            }
        },

        _buildMenuDomAccordingToData: function(itemDataList, parent) {
            var item, subMenuContainer;
            for (var i=0; i<itemDataList.length; i++) {
                var itemDataNode = itemDataList[i];
                if (this.isItemVisible(itemDataNode)) {
                    item = this._buildItem(itemDataNode, parent);
                    subMenuContainer = this.getListElement(item);
                    if (this._containsVisibleItem(itemDataNode.get('items'))) {
                        this._buildMenuDomAccordingToData(itemDataNode.get('items'), subMenuContainer);
                    }
                    else {
                        this._markEmptySubMenu(subMenuContainer);
                    }
                }
            }
        },

        _containsVisibleItem: function (itemArr) {
            return _.any(itemArr, this.isItemVisible, this);
        },

        _markEmptySubMenu: function(subMenuContainer) {
            subMenuContainer.addClass('emptySubMenu');
        },

        isItemVisible: function(itemDataNode) {
            return true;
        },

        _buildItem: function(dataItem, parent) {
            var elementInstance = this._getElementInstanceAccordingToTemplate(parent);
            var parsedElement = this.parseElement(elementInstance);

            this._arrangeLabel(parsedElement.label, dataItem);
            this._arrangeList(parsedElement.list);
            this._arrangeLinkAttribute(parsedElement.item, dataItem.get('link'));
            this._arrangeItem(parsedElement.item, parent);

            return parsedElement.item;
        },

        _getElementInstanceAccordingToTemplate: function(parent) {
            var template;
            if (parent.hasClass('subMenu') && this._skinParts.subMenuItem) {
                template = this._skinParts.subMenuItem.outerHTML;
            }
            else {
                template = this._skinParts.menuItem.outerHTML;
            }
            var container = new Element('div', {html: template});
            return container.getFirst();
        },

        _arrangeLabel: function(labelElement, dataItem) {
            var labelElemTag = this.getLabelElemTag(dataItem);
            var labelElemParams = this.getLabelElemParams(dataItem, labelElemTag);

            labelElement.setProperties(labelElemParams);
            if (labelElement.tagName.toLowerCase() !== labelElemTag) {
                this._replaceElementTag(labelElement, labelElemTag);
            }
        },

        getLabelElemTag: function(href) {
            return 'a';
        },

        getLabelElemParams: function(dataItem) {
            return { html: dataItem.get('label'), "class": 'label' };
        },

        _replaceElementTag: function(element, tagName) {
            var attrKeys = _.map(element.attributes, function(attr) {return attr.nodeName;});
            var attrValues = _.map(element.attributes, function(attr) {return attr.nodeValue;});
            var attrObject = _.zipObject(attrKeys, attrValues);
            attrObject.html = element.innerHTML;
            new Element(tagName, attrObject).replaces(element);
        },

        _arrangeList: function(listElement) {
            listElement.addClass('subMenu');
        },

        _arrangeItem: function(itemElement, parent) {
            itemElement.removeAttribute('skinpart');
            itemElement.insertInto(parent);

            if (parent.hasClass('subMenu')) {
                itemElement.setStyle('line-height', itemElement.getHeight()); //center label vertically
            }
        },

        _arrangeLinkAttribute: function (itemElement, linkId) {
            itemElement.setAttribute('linkId', linkId);
        },

        _setMenuMinHeight: function() {
            var itemElm = this._menuContainer.getFirst();
            if(!itemElm) { return; }
            var labelElm = this.getLabelElement(itemElm);
            if(!labelElm) { return; }
            var labelHeight = labelElm.getHeight();
            this.setMinH(labelHeight);
        },

        getLabelElementsIdentifiers: function() {
            return ['a'];
        },

        _setSelectedButton: function(selectedLinkId) {
            if (!this._menuContainer || !selectedLinkId) {
                return;
            }
            var oldSelectedButtons = this._menuContainer.getElements('li.selected, li.selectedContainer');
            _.forEach(oldSelectedButtons, function(button) {
                button.hasClass('selected') ? button.removeClass('selected') : button.removeClass('selectedContainer');
            });

            var newSelectedButtons = this._getViewNodesByLinkId(selectedLinkId);
            _.forEach(newSelectedButtons, function(button) {
                button.addClass('selected');
                _.forEach(button.getParents('li'), function(subMenuContainer) {
                    subMenuContainer.addClass('selectedContainer');
                });
            });
        },

        _getViewNodesByLinkId: function(linkId) {
            return this._menuContainer.getElements('li[linkId="' + linkId +'"]');
        },

        //TODO: Consider removing if not used by NBC_Dropdown menu
        //_getViewNodesByLinkId replaces this function
        _getViewNodesByHref: function(href) {
            href = href[0] === '#' ? href.substring(1) : href;
            return _.filter(this._menuContainer.getElements('li'), function(button) {
                return this._getButtonIdentifier(button) === href;
            }, this);
        },

        _getButtonIdentifier: function(button) {
            var labelElement = this.getLabelElement(button);
            return labelElement && labelElement.getAttribute('href');
        }
    });
});