define.component('wysiwyg.common.components.multiselection.viewer.MultiSelection', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.traits(['wysiwyg.editor.components.traits.DropDownComponent']);

    def.propertiesSchemaType('MultiSelectionProperties');

    def.resources(["W.Commands"]);

    def.binds(['_onWixified', '_createItem', '_addLabel', '_onComponentClicked', '_onInputChanged', '_onKeyPressed', '_onInputFocus', '_onInputBlur']);

    def.dataTypes(['MultiSelectableList']);

    def.skinParts({
        content: { type: 'htmlElement' },
        items: { type: 'htmlElement' },
        input: {  type: 'htmlElement' },
        placeholder: {  type: 'htmlElement' },
        dropdown: {type: 'htmlElement'}
    });

    def.fields({
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);

            this.on(Constants.ComponentEvents.WIXIFIED, this, this._onWixified);
        },

        getOptions: function () {
            return this._skinParts.dropdown.getChildren();
        },

        getSelectedOption: function () {
            return this._skinParts.dropdown.getElement('.selected');
        },

        _onInputChanged: function (e) {
            if (this._skinParts.input.textContent.length > this.getComponentProperty('maxTextLength')) {
                this._skinParts.input.textContent = this._skinParts.input.textContent.substring(0, this.getComponentProperty('maxTextLength'));
                this._setCaretAtTheEndOfInput();
            }
            this._populateDropDown(this._skinParts.input.textContent.length > 0);
        },

        _onOptionClick: function (event) {
            if (event.key !== 'enter'){
                return;
            }
            event.preventDefault();
            if (event.target) {
                event.target.click();
            }
            else {
                this._addItem(this._skinParts.input.textContent);
            }
        },

        setSelected: function (option) {
            this._setDropDownVisibility(true);
            var prevOption = this.getSelectedOption();
            if (prevOption) {
                prevOption.removeClass('selected');
            }

            if (option) {
                option.addClass('selected');
                var options = this._skinParts.dropdown;

                var optionPos = option.getPosition(options).y;
                var scrollPos = options.getScroll().y;

                if (optionPos > options.getSize().y + scrollPos || optionPos < 0) {
                    options.scrollTo(0, optionPos);
                }
            }
        },

        _setDropDownPosition: function () {
            var contentPosition = this._skinParts.content.getPosition();
            this._skinParts.dropdown.setPosition({x: contentPosition.x, y: contentPosition.y + this._skinParts.content.getHeight() - window.pageYOffset});
        },

        _setDropDownVisibility: function (show, immediate) {
            var dropdown = this._skinParts.dropdown;
            var needToShow = show && dropdown.getChildren().length !== 0;
            if (needToShow) {
                this._setDropDownPosition();
            }
            // change the visibility with set time out so clicks on the dropdown
            // will occur before the blur
            setTimeout(function () {
                if (needToShow) {
                    this.resources.W.Commands.executeCommand('WEditorCommands.StartEditingMultiSelection');
                    dropdown.uncollapse();
                } else {
                    this.resources.W.Commands.executeCommand('WEditorCommands.StopEditingMultiSelection');
                    dropdown.collapse();
                }
            }.bind(this), show || immediate || dropdown.getChildren().length === 0 ? 0 : 150);
        },

        _emptyDropDown: function () {
            var dropdown = this._skinParts.dropdown;
            _.each(dropdown.getChildren(), function (element) {
                element.exterminate();
            });

            dropdown.empty();
        },

        _populateDropDown: function (show) {
            if (!show) {
                this._setDropDownVisibility(show, true);
            }

            var text = this._skinParts.input.textContent;

            var self = this;
            var newElements = _(this._getItems()).filter(function (item) {
                var data = item.getData();
                return self._startsWith(data.text, text) && !data.selected;
            }).sortBy(function (item) {
                return item.getData().text;
            }).map(function (item) {
                return self._addDropDownOption(item.getData().text, false);
            }).value();

            if (text && !this._getItemByText(this._getItems(), text) && !this.getComponentProperty('selectionOnly')) {
                var theNewOption = this._addDropDownOption(text, true);
                theNewOption.addClass('theNewOption');
                newElements.push(theNewOption);
            }

            this._emptyDropDown();
            _.each(newElements, function (element) {
                self._skinParts.dropdown.appendChild(element);
            });

            if (show) {
                this._setDropDownVisibility(this._skinParts.dropdown.getChildren().length > 0);
            }
        },

        _addDropDownOption: function (text, isNew) {
            var li = new Element('li');
            li.set('html', text + (isNew ? ' ' + this.getComponentProperty('newItemText') : ''));
            li.on(Constants.CoreEvents.CLICK, this,function () {
                this._addItem(text);
            }).on(Constants.CoreEvents.MOUSE_OVER, this, function () {
                this.setSelected(li);
            });
            return li;
        },

        setActiveState: function (isActive) {
            if (isActive) {
                this._skinParts.dropdown.setStyle('width', this._skinParts.content.getWidth());
                this._populateDropDown(this.getComponentProperty('selectionOnly'));
            } else {
                //this._setDropDownVisibility(false);
            }
        },

        _getItemByText: function (list, text) {
            var findIndex = _.findIndex(list, function (x) {
                return x.getData().text === text;
            });
            return findIndex !== -1 ? list[findIndex] : null;
        },

        _resetInput: function () {
            this._populateDropDown(false);
            this._skinParts.input.empty();
        },

        _startsWith: function (text, searchFor) {
            return text.toLowerCase().indexOf(searchFor.toLowerCase()) === 0;
        },

        _setCaretAtTheEndOfInput: function () {
            if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
                var range = document.createRange();
                range.selectNodeContents(this._skinParts.input);
                range.collapse(false);
                var sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            } else if (typeof document.body.createTextRange != "undefined") {
                var textRange = document.body.createTextRange();
                textRange.moveToElementText(this._skinParts.input);
                textRange.collapse(false);
                textRange.select();
            }
        },

        _onComponentClicked: function (args) {
            this._skinParts.input.focus();
            this._setCaretAtTheEndOfInput();
        },

        _onInputFocus: function (args) {
            this._skinParts.content.addClass('focused');
            this._hideInputPlaceholder();
            this.trigger('focus');
        },

        _onInputBlur: function (args) {
            this._skinParts.content.removeClass('focused');
            var self = this;
            setTimeout(function () {
                if (!self._skinParts.content.hasClass('focused')) {
                    self._resetInput();
                    self._refreshInputPlaceholder();
                }
            }, 200);
        },

        _refreshInputPlaceholder: function () {
            this._hideInputPlaceholder();
            this._showInputPlaceholder();
        },

        _showInputPlaceholder: function () {
            if (this._getSelected().length === 0 && !this._skinParts.input.textContent) {
                this._skinParts.placeholder.uncollapse();
            }
        },

        _hideInputPlaceholder: function () {
            this._skinParts.placeholder.collapse();
        },

        _addItem: function (text) {
            if (!text) {
                return;
            }

            var item = this._getItemByText(this._getItems(), text);

            if (!item) {
                if (!this.getComponentProperty('selectionOnly')) {
                    item = this._createItem(text, true);
                    this._getItems().push(item);
                    this.trigger('itemCreated', {item: item});
                    this._addLabel(item);
                    this._resetInput();
                }
            }
            else if (!item.getData().selected) {
                item.getData().selected = true;
                this.trigger('itemSelected', {item: item});
                this._addLabel(item);
                this._resetInput();
            }
        },

        _onKeyPressed: function (e) {
            if (e.code == 8) {
                if (!this._skinParts.input.textContent) {
                    this._removeLastLabel();
                    this._populateDropDown(false);
                }
            }
        },

        _onWixified: function () {
            this._skinParts.dropdown.collapse();
            this._onCompDataChanged();
            this._onCompPropertiesChanged();

            this._skinParts.input.on(Constants.CoreEvents.INPUT, this, this._onInputChanged)
                .on(Constants.CoreEvents.KEY_PRESS, this, this._onKeyPressed)
                .on(Constants.CoreEvents.KEY_DOWN, this, this._onKeyPressed)
                .on(Constants.CoreEvents.FOCUS, this, this._onInputFocus)
                .on(Constants.CoreEvents.BLUR, this, this._onInputBlur)
                .on(Constants.CoreEvents.FOCUS, this, this._onFocus)
                .on(Constants.CoreEvents.BLUR, this, this._onBlur);
            this._skinParts.content.on(Constants.CoreEvents.CLICK, this, this._onComponentClicked);
        },

        _onCompDataChanged: function () {
            this._resetInput();
            this._refreshInputPlaceholder();
            _(this._skinParts.items.getChildren()).each(function (element) {
                element.getLogic().dispose();
            });
            _.each(this._getSelected(), this._addLabel);
        },

        _onCompPropertiesChanged: function () {
            this._skinParts.placeholder.textContent = this.getComponentProperty('placeholder');
        },

        _createItem: function (text, isSelected) {
            return W.Data.createDataItem(
                {
                    type: 'SelectOption',
                    value: this.generateGUID(),
                    text: text,
                    selected: isSelected || false
                });
        },

        _addLabel: function (item) {
            var element = W.Components.createComponent(
                'wysiwyg.common.components.multiselectionitem.viewer.MultiSelectionItem',
                'wysiwyg.common.components.multiselectionitem.viewer.skins.MultiSelectionItemSkin',
                item);

            element.getLogic().on('removeItem', this, this._onRemoveItem);

            this._skinParts.items.appendChild(element);
        },

        _getSelected: function () {
            return _.filter(this._getItems(), function (item) {
                return item.getData().selected;
            });
        },

        _getItems: function () {
            return this.getDataItem().get('items');
        },

        _removeItem: function (comp) {
            var removedItem = _(this._getItems()).filter(function (x) {
                return x.getData().value === comp.getValue();
            }).first();
            removedItem.getData().selected = false;
            comp.dispose();
            this._populateDropDown(true);
            this.trigger('itemRemoved', {item: removedItem});
        },

        _onRemoveItem: function (args) {
            var comp = args.data.comp;
            this._removeItem(comp);
        },

        _removeLastLabel: function () {
            var lastLabel = this._skinParts.items.lastChild;
            if (lastLabel) {
                this._removeItem(lastLabel.getLogic());
            }
        },

        isEnabled: function () {
            return true;
        },

        generateGUID: function () {
            var S4 = function () {
                return Math.floor(
                    Math.random() * 0x10000 /* 65536 */
                ).toString(16);
            };

            return (
                S4() + S4() + "-" +
                    S4() + "-" +
                    S4() + "-" +
                    S4() + "-" +
                    S4() + S4() + S4()
                );
        }
    });
});
