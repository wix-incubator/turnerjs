define.component('wysiwyg.viewer.components.FiveGridLine', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.resources(['W.Viewer', 'W.Config', 'W.Commands']);

    def.propertiesSchemaType('FiveGridLineProperties');


    def.skinParts({
        line: {type: 'htmlElement'}
    });

    def.statics({
        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: true
            },
            mobile: {
                allInputsHidden: true
            }
        }
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._rotatable = true;
            this.setMaxW(2500);
            this._resizableSides = [Constants.BaseComponent.ResizeSides.LEFT, Constants.BaseComponent.ResizeSides.RIGHT];
            this._setXOriginal = this.setX.bind(this); //duplicate this function
            this.setWidthOriginal = this.setWidth.bind(this); //duplicate this function
            this._firstInitialization = true;
            var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
            var isMobileMode = this.resources.W.Config.env.$viewingDevice === Constants.ViewerTypesParams.TYPES.MOBILE;
            window[eventMethod]("resize",function(){
                var currMobileMode = this.resources.W.Config.env.$viewingDevice === Constants.ViewerTypesParams.TYPES.MOBILE;
                if (currMobileMode == isMobileMode ){
                    if(this.$view)
                        this._fixWidth();
                }
            }.bind(this));
        },

        isRenderNeeded: function (invalidations) {
            var renderTriggers = [
                this.INVALIDATIONS.SKIN_CHANGE,
                this.INVALIDATIONS.WIDTH_REQUEST,
                this.INVALIDATIONS.DATA_CHANGE,
                this.INVALIDATIONS.FIRST_RENDER
            ];
            return invalidations.isInvalidated(renderTriggers);
        },

        setWidth: function (value) {
            var numberOfKnobs = this._getNumberOfKnobs();
            this.width = value;
            this.parent(value);
        },

        _onRender: function (renderEvent) {
            var contentHeight = this._skinParts.line.$measure.height,
                invalidations = renderEvent.data.invalidations,
                isFullWidthMode = this.getComponentProperty('fullScreenModeOn');

            this.setHeight(contentHeight);
            if (this._firstInitialization) {
                this._firstInitialization = false;
                if (isFullWidthMode) {
                    this._fixWidth();
                    this._lockLineXPosition();
                }
            }
            this._updateEditBoxUI();
            if (invalidations.isInvalidated([ this.INVALIDATIONS.WIDTH_REQUEST ])) {
                this._fixWidth();
            }

            this.isContainable();
        },

        _getNumberOfKnobs: function () {
            var value = 0;
            if (this._skinParts) {
                if (this._skinParts.rightKnob) {
                    value++;
                }
                if (this._skinParts.leftKnob) {
                    value++;
                }
                if (this._skinParts.middleKnob) {
                    value++;
                }
            }

            return value;
        },
        _getNewPosition: function () {
            var newPosition = (( this.resources.W.Viewer.getDocWidth() - document.body.clientWidth ) / 2) - 1;
            return ( newPosition >= 0 ) ? 0 : newPosition;
        },
        _fixWidth: function () {
            var newWidth = document.body.clientWidth,
                newLeft = this._getNewPosition(),
                isFullWidthMode = this.getComponentProperty('fullScreenModeOn'),
                isMobileMode = this.resources.W.Config.env.$viewingDevice === Constants.ViewerTypesParams.TYPES.MOBILE;
            if (isFullWidthMode) {
                if (isMobileMode) {
                    this._rotatable = false;
                    newWidth = W.Viewer.getDocWidth();
                    newLeft = 0;
                }
                var CurrWidth = this.$view&&this.$view.style ? this.$view.style.minWidth :"";
                if (newWidth+'px' === CurrWidth){
                    return;
                }
                this.setWidthOriginal(newWidth);
                this._setXOriginal(newLeft);
            }
        },
        isContainable: function (logic) {
            var isFullWidthMode = this.getComponentProperty('fullScreenModeOn');

            if (logic !== undefined) {
                if (isFullWidthMode && logic.className === "core.components.Container") {
                    return false;
                }
            }
            else {
                if (isFullWidthMode) {
                    return false;
                }
            }

            return true;
        },

        _updateEditBoxUI: function () {
            var isFullWidthMode = this.getComponentProperty('fullScreenModeOn');
            var isMobileMode = this.resources.W.Config.env.$viewingDevice === Constants.ViewerTypesParams.TYPES.MOBILE;
            if (isFullWidthMode) {
                this._rotatable = false;
                this._resizableSides = [];
                this._moveDirections=["VERTICAL_MOVE"];
            }
            else {
                this._unlockLineXPosition();
                this._rotatable = true;
                this._resizableSides = [Constants.BaseComponent.ResizeSides.LEFT, Constants.BaseComponent.ResizeSides.RIGHT];
                this._moveDirections=["HORIZONTAL_MOVE", "VERTICAL_MOVE"];
            }
            W.Commands.executeCommand('WEditorCommands.UpdateRotatableProperties',{},this);
        },
        _lockLineXPosition: function () {
            this.setX = function () {
            };
            this.setWidth = function () {
            };

        },
        _unlockLineXPosition: function () {
            this.setX = this._setXOriginal;
            this.setWidth = this.setWidthOriginal;
        }

    });
});
