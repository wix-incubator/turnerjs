define.component('wysiwyg.editor.components.ComponentsMenu', function(componentDefinition) {

    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.resources(['W.Utils', 'W.Editor', 'W.Config']);

    def.skinParts({
        container: { type:'htmlElement' },
        button: { type:'wysiwyg.editor.components.WButton', argObject: { label:"SELECT_HIDDEN_ELEMENTS_TEXT", labelType:'langKey' } },
        list: { type:'htmlElement' },
        item: { type:'wysiwyg.editor.components.WButton', autoCreate: false }
    });

    def.states({
        'horizontalOpenSide': ['openFromRight', 'openFromLeft']
    });

    def.fields({
        mouseOverTimeout: 500,
        mouseOutTimeout: 700
    });

    def.methods({
        /**
         *
         * @param compId
         * @param viewNode
         * @param extraArgs
         */
        initialize: function(compId, viewNode, extraArgs) {
            this.parent(compId, viewNode, extraArgs);
            this.getViewNode().on(Constants.CoreEvents.MOUSE_ENTER, this, this.openList);
            this.getViewNode().on(Constants.CoreEvents.MOUSE_LEAVE, this, this.closeList);
            this._componentsArray = [];
            this._tween = W.Utils.Tween;
            this._mouseMotionTimeoutID = null;
        },

        /**
         * Builds the DOM elements according to the given components array
         * @param {Array} components
         */
        buildList: function(components) {
            this._componentsArray = components || [];
            this._setComponentLabelPrefix(components.length);
            this._clearComponentsListFromDOM();
            this._buildComponentsView();
        },

        /**
         * Open the components list
         */
        openList: function() {
            window.clearTimeout(this._mouseMotionTimeoutID);
            this._mouseMotionTimeoutID = setTimeout(function() {
                if(!this._skinParts.list.isDisplayed()) {
                    LOG.reportEvent(wixEvents.HIDDEN_ELEMENT_MENU_OPENED);
                    this._skinParts.list.uncollapse();
                    this._computeListPosition();
                    this._tween.to(this._skinParts.list, 0.0, { opacity: 1.0, ease: "swing" });
                    this.trigger('open', { });
                }
            }.bind(this), this.mouseOverTimeout)
        },

        /**
         * Close the components list
         */
        closeList: function() {
            window.clearTimeout(this._mouseMotionTimeoutID);
            this._mouseMotionTimeoutID = setTimeout(function() {
                this._tween.to(this._skinParts.list, 0.2, { opacity: 0.0, ease: "swing", onComplete: function(tweenObj) {
                    tweenObj._target.collapse();
                    this.trigger('closed', { });
                }.bind(this)});
            }.bind(this), this.mouseOutTimeout)
        },

        /**
         * Clear the components list from DOM
         * @private
         */
        _clearComponentsListFromDOM: function() {
            this._skinParts.list.empty();
        },

        /**
         * Add the size of the components list as a button's label prefix
         * @param size
         * @private
         */
        _setComponentLabelPrefix: function(size) {
            this._skinParts.button.modifyLabelPrefix("(" + size + ") ");
        },

        /**
         * Builds the components list and insert to DOM
         * @private
         */
        _buildComponentsView: function() {
            var componentButtonLogic, componentButtonView;

            _.forEach(this._componentsArray, function(component) {
                componentButtonLogic = this._createInnerComponent(this.getSkinPartDefinition('item'), null, true);
                componentButtonView = componentButtonLogic.getViewNode();

                // Set Label
                componentButtonLogic.setLabel(this._createButtonLabel(component));

                // Set Icon
                var componentIconProperties = this.resources.W.Utils.ComponentIcon.getIconProperties(component);
                componentButtonLogic.setIcon(componentIconProperties.iconSrc, componentIconProperties.iconSize, componentIconProperties.spriteOffset);

                this._registerHiddenElementsEvents(componentButtonView, component);

                if(this._isEditedComponent(component)) {
                    this._modifyEditedComponentButtonStyle(componentButtonLogic);
                }

                componentButtonView.insertInto(this._skinParts.list);
            }, this);
        },

        /**
         * Register and fire events
         * @param componentButtonView
         * @param component
         * @private
         */
        _registerHiddenElementsEvents: function(componentButtonView, component) {
            componentButtonView.on(Constants.CoreEvents.CLICK, this, function(e) {
                LOG.reportEvent(wixEvents.HIDDEN_ELEMENT_SELECTED, {
                        c1: component.getComponentId(),
                        c2: this.resources.W.Editor.getComponentScope(component),
                        g1: this.resources.W.Config.env.$viewingDevice
                    }
                );
                this.trigger('componentClicked', { component: component, clickPos: e.page});
            });
            componentButtonView.on(Constants.CoreEvents.MOUSE_OVER, this, function() {
                this.trigger('componentOver', { component: component });
            });
            componentButtonView.on(Constants.CoreEvents.MOUSE_OUT, this, function() {
                this.trigger('componentOut', { component: component });
            });
        },

        /**
         * Creates button label by appending its component's friendly to its preview text (if exists)
         * @param comp
         * @returns {*}
         * @private
         */
        _createButtonLabel: function(comp){
            var name = this.resources.W.Editor.getComponentFriendlyName(comp.$className, comp.getDataItem());
            var previewText = '';
            var componentCommands = this.resources.W.Editor.getComponentMetaData(comp) || {};

            if (componentCommands.mobile && componentCommands.mobile.previewTextDataField){
                previewText = comp.getDataItem().get(componentCommands.mobile.previewTextDataField);
            }

            if (previewText){
                name += ': ' + previewText;
            }

            name = this.resources.W.Utils.removeHtmlTagsFromString(name); //Clear all HTML tags
            name = this.resources.W.Utils.removeBreaklinesFromString(name); //Remove /n and /r
            return name.trim();
        },

        /**
         * Handles the edited component view
         * @param componentButtonLogic
         * @private
         */
        _modifyEditedComponentButtonStyle: function(componentButtonLogic) {
            componentButtonLogic._skinParts.label.setStyles({
                "color": "#000000"
            });
            componentButtonLogic.getViewNode().setStyles({
                "background": "#D5EFFE"
            });
        },

        /**
         * Adjusts the components list position
         * @private
         */
        _computeListPosition: function() {
            var listDimensions = this._skinParts.list.getDimensions(),
                windowSize = this.resources.W.Utils.getWindowSize();

            this._setHorizontalOpenPosition(listDimensions, windowSize);
            this._setListVerticalPosition(listDimensions, windowSize);
        },

        /**
         * Sets the horizontal open position state
         * @param listDimensions
         * @param windowSize
         * @private
         */
        _setHorizontalOpenPosition: function(listDimensions, windowSize) {
            var buttonDimensions = this._skinParts.button.getViewNode().getDimensions(),
                buttonPosition = this.resources.W.Utils.getPositionRelativeToWindow( this._skinParts.button.getViewNode());

            if((buttonPosition.x + buttonDimensions.width) + listDimensions.width >= windowSize.width) {
                this.setState('openFromLeft', 'horizontalOpenSide');
            } else {
                this.setState('openFromRight', 'horizontalOpenSide');
            }
        },

        /**
         * Sets the components list vertical position
         * @param listDimensions
         * @param windowSize
         * @private
         */
        _setListVerticalPosition: function(listDimensions, windowSize) {
            var listPosition = this.resources.W.Utils.getPositionRelativeToWindow(this._skinParts.list),
                mainBarHeight = this.resources.W.Editor.getEditorUI().getMainBarHeight(),
                firstItemView = this._skinParts.list.getFirst(),
                marginOffset = 0;

            var adjustVerticalMargin = function(marginTop) {
                this._skinParts.list.setStyles({
                    'margin-top': marginTop + "px"
                });
            }.bind(this);

            adjustVerticalMargin(marginOffset);

            if(firstItemView) {
                listPosition = this.resources.W.Utils.getPositionRelativeToWindow(this._skinParts.list);
                if(listPosition.y + listDimensions.height >= windowSize.height)  { // Overflow bottom
                    marginOffset += (windowSize.height - (listPosition.y + listDimensions.height));
                    adjustVerticalMargin(marginOffset);
                } else if (listPosition.y <=  mainBarHeight) {  // Overflow top
                    marginOffset += (mainBarHeight - listPosition.y);
                    adjustVerticalMargin(marginOffset);
                }
            }
        },

        /**
         * Checks if the given components equals the edited component
         * @param component
         * @returns {boolean}
         * @private
         */
        _isEditedComponent: function(component) {
            var editedComponent = this.resources.W.Editor.getEditedComponent();
            return _.isEqual(component, editedComponent);
        }
    });
});
