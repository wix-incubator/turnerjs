define.experiment.newClass('wysiwyg.common.components.dropdownmenu.viewer.traits.MenuPropertiesHandler.Dropdownmenu', function(classDefinition) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.methods({

        initialize: function() {
            this._buttonsWidthMap = {};
            this._initDebouncer();
        },

        _initDebouncer: function(){
            var rate = 200,
                options = {'leading': true, 'trailing': false};

            this._debounceHandleTextAlign = _.debounce(this._handleTextAlign, rate, options);
            this._debounceHandleTextWidth = _.debounce(this._handleTextWidth, rate, options);
            this._debounceHandleButtonsAlign = _.debounce(this._handleButtonsAlign, rate, options);
            this._debounceHandleStretch = _.debounce(this._handleStretch, rate, options);
            this._debounceMoveButtonsToAndFromMoreSubMenuIfNeeded = _.debounce(this._moveButtonsToAndFromMoreSubMenuIfNeeded, rate, options);
        },

        setMenuProperty: function(propertyItem, fieldName, fieldValue) {
            switch(fieldName) {
                case 'alignButtons':
                    this._debounceHandleStretch();
                    this._debounceHandleButtonsAlign();
                    break;
                case 'alignText':
                    this._debounceHandleStretch();
                    this._debounceHandleTextAlign();
                    break;
                case 'stretchButtonsToMenuWidth':
                    this._debounceHandleStretch();
                    this._debounceHandleButtonsAlign();
                    this._debounceHandleTextAlign();
                    break;
                case 'sameWidthButtons':
                    this._debounceHandleTextWidth();
                    this._debounceHandleTextAlign();
                    break;
            }

            this._debounceMoveButtonsToAndFromMoreSubMenuIfNeeded();
        },
        _handleButtonsAlign: function(){
            var stretch = this.getComponentProperty('stretchButtonsToMenuWidth'),
                buttonsAlign = this.getComponentProperty('alignButtons');

            if (stretch) {
                this.setState('buttons-stretch', 'buttonsStretch');
            } else {
                this.setState('buttons-shrink', 'buttonsStretch');
                this.setState('buttons-align-' + buttonsAlign, 'buttonsAlignment');
            }

        },
        _handleTextAlign: function(){
            var buttons = this._menuContainer.getChildren(),
                properties = {
                    alignText: this.getComponentProperty('alignText'),
                    stretch: this.getComponentProperty('stretchButtonsToMenuWidth'),
                    sameWidth: this.getComponentProperty('sameWidthButtons')
                },
                widestButton = this._getWidestButton(buttons),
                widestButtonWidth = this._getButtonWidth(widestButton),
                menuWidth = properties.stretch ? this.getWidth() : this._getButtonsTotalWidth(buttons),
                buttonWidth = properties.sameWidth && !properties.stretch ? widestButtonWidth : menuWidth / buttons.length;

            buttons.forEach(function(button){
                this._setButtonPadding(button, buttonWidth, properties);
            }.bind(this));
        },
        _setButtonPadding: function(button, buttonWidth, properties){
            var titleWidth = this._getButtonWidth(button),
                totalRequiredPadding = buttonWidth -  titleWidth,
                paddingLeft = 0,
                paddingRight = 0;

            if(properties.stretch || properties.sameWidth){
                switch(properties.alignText){
                    case 'left':
                        paddingLeft = totalRequiredPadding;
                        break;
                    case 'right':
                        paddingRight = totalRequiredPadding;
                        break;
                    case 'center':
                        paddingLeft = totalRequiredPadding / 2;
                        paddingRight = totalRequiredPadding / 2;
                        break;
                }
            }

            button.setStyles({
                'padding-right': paddingLeft,
                'padding-left': paddingRight
            });
        },
        _handleTextWidth: function(){
            var buttons = this._menuContainer.getChildren(),
                sameWidth = this.getComponentProperty('sameWidthButtons'),
                widestButton = this._getWidestButton(buttons),
                widestButtonWidth = this._getButtonWidth(widestButton);

            this._removeAlignTextStateIfNeeded();

            this.setState(sameWidth ? 'same-width' : 'auto-width', 'buttonsWidth');
            buttons.forEach(function(button){
                var currentButtonWidth = this._getButtonMinWidthTextOnly(button);
                button.setStyle('min-width', sameWidth ? widestButtonWidth : currentButtonWidth);
            }.bind(this));
        },
        /**
         * We cannot use minWidth since it's being updated when "sameWidth" is set, and we want ALWAYS to get the real min width
         * */
        _getButtonMinWidthTextOnly: function(button){
            var buttonIdentifier = this._getButtonIdentifier(button);

            if(!this._buttonsWidthMap[buttonIdentifier].minWidthTextOnly){
                button.setStyle('display', 'inline-block');
                this._buttonsWidthMap[buttonIdentifier].minWidthTextOnly = this._getButtonWidth(button);
                button.setStyle('display', null);
            }
            return this._buttonsWidthMap[buttonIdentifier].minWidthTextOnly;
        },
        _getWidestButton: function(buttons) {
            return _.max(buttons, function(button) {
                return this._getButtonWidth(button);
            }.bind(this));
        },
        _handleStretch: function() {
            var stretch = this.getComponentProperty('stretchButtonsToMenuWidth'),
                alignButtons = this.getComponentProperty('alignButtons'),
                alignText = this.getComponentProperty('alignText');

            this.setState('text-align-' + alignText, 'textAlignment');
            if (stretch) {
                this.setState('buttons-stretch', 'buttonsStretch');
                this.setState('buttons-align-ignore', 'buttonsAlignment');
            } else {
                this.setState('buttons-shrink', 'buttonsStretch');
                this.setState('buttons-align-' + alignButtons, 'buttonsAlignment');
            }

            this._removeAlignTextStateIfNeeded();
        },
        _removeAlignTextStateIfNeeded: function(){
            var stretch = this.getComponentProperty('stretchButtonsToMenuWidth'),
                sameWidth = this.getComponentProperty('sameWidthButtons');

            if(!stretch && !sameWidth){
                this.setState('text-align-ignore', 'textAlignment');
            }
        },
        _handleMoreButtonLabelProperty: function(fieldValue) {
            var moreButton = this._menuContainer.getLast();
            this._handleButtonLabelChange(fieldValue, moreButton);
        },
        _getButtonsTotalWidth: function(buttons) {
            if (buttons.length === 1) {
                return this._getButtonWidth(buttons[0]);
            }
            return _(buttons).reduce(function(sum, button) {
                if (typeof sum !== 'number') {
                    sum = this._getButtonWidth(sum);
                }
                return sum + this._getButtonWidth(button);
            }.bind(this));
        },

        _getButtonWidth: function(button){
            var firstChild = button.getFirst(),
                firstChildWithLabelClass = button.getElement('.label'),
                labelWidth = firstChildWithLabelClass ? firstChildWithLabelClass.getWidth() : firstChild.getWidth(),
                margins = button.getStyles('margin-left', 'margin-right'),
                leftMargin = parseInt(margins['margin-left'], 10),
                rightMargin = parseInt(margins['margin-right'], 10);

            return labelWidth + leftMargin + rightMargin;
        }
    });
});