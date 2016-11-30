define.Class('wysiwyg.editor.managers.wedit.MultiSelectProxy', function(classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;
    def.resources(['W.Editor']);
    def.inherits('bootstrap.utils.Events');
    def.fields({
        _behaviors: false
    });

    def.statics({
        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: false,
                animation: true
            },
            custom: [
                /*{
                 label   : null,                 //Button Label,
                 command : null,                 //Command names
                 commandParameter : null         //Command parameters
                 commandParameterDataRef: 'SELF' //pass this._data as commandParameter:data
                 }*/
            ],
            mobile: {
                disablePropertySplit: true
            }
        }
    });

    def.methods({
        initialize: function() {
        },
        isMultiSelect: true,

        setSelectedComps: function(selected) {
            LOG.reportEvent(wixEvents.MULTI_SELECT_DONE, {i1: selected.length});
            // Save reference to component list
            this._selectedComps = selected;
            // Save component list delta
            var basePosition = this.getPosition();
            this._selectedPosDelta = [];
            for (var i = 0; i < selected.length; ++i) {
                this._selectedPosDelta.push({'x': selected[i].getX() - basePosition.x, 'y': selected[i].getY() - basePosition.y});
            }
            this.EDITOR_META_DATA.general.animation = this._getAnimationStateFromComponents();
            this._behaviors = this._isOneCompHasBehaviors();
            this.$view = this.getViewNode();
        },

        getSelectedComps: function() {
            return this._selectedComps;
        },

        /**
         * return an array of all selected components unique ids
         * @returns {Array}
         */
        getSelectedCompsIds: function() {
            var ids = [];
            for (var i = 0; i < this._selectedComps.length; i++) {
                ids.push(this._selectedComps[i].getComponentId());
            }
            return ids;
        },

        /**
         * NOTE: this function differs from the component getBehaviors by that it only return true or false
         * To get behaviors of selected components iterate over them.
         * @returns {Boolean}
         */
        getBehaviors: function() {
            this._behaviors = this._isOneCompHasBehaviors();
            return this._behaviors;
        },

        /**
         * return an array of all selected components classNames
         * @returns {Array}
         */
        getSelectedCompsClassNames: function() {
            var classNames = [];
            for (var i = 0; i < this._selectedComps.length; i++) {
                classNames.push(this._selectedComps[i].$className);
            }
            return classNames;
        },

        saveCurrentCoordinates: function() {
            for (var i = 0; i < this._selectedComps.length; ++i) {
                this._selectedComps[i].saveCurrentCoordinates();
            }
        },

        saveCurrentDimensions: function() {
            for (var i = 0; i < this._selectedComps.length; ++i) {
                this._selectedComps[i]._lastDimensions = {
                    w: this._selectedComps[i].getWidth(),
                    h: this._selectedComps[i].getHeight()
                };
            }
        },

        setX: function(x) {
            var moveX = x;
            for (var i = 0; i < this._selectedComps.length; ++i) {
                var selectedComp = this._selectedComps[i];
                var newX = this._selectedPosDelta[i].x + moveX;
                selectedComp.setX(newX);
            }
        },
        setY: function(y) {
            var moveY = y;
            for (var i = 0; i < this._selectedComps.length; ++i) {
                var selectedComp = this._selectedComps[i];
                var newY = this._selectedPosDelta[i].y + moveY;
                selectedComp.setY(newY);
            }
        },
        getViewNode: function() {
            return this._selectedComps[0].getViewNode();
        },
        getParentComponent: function() {
            return this._selectedComps[0].getParentComponent();
        },
        getX: function() {
            var minX = Number.MAX_VALUE;
            for (var i = 0; i < this._selectedComps.length; i++) {
                minX = Math.min(minX, this._selectedComps[i].getX());
            }
            return minX;
        },
        getY: function() {
            var minY = Number.MAX_VALUE;
            for (var i = 0; i < this._selectedComps.length; i++) {
                minY = Math.min(minY, this._selectedComps[i].getY());
            }
            return minY;
        },
        getWidth: function() {
            var maxRight = -Number.MAX_VALUE;
            for (var i = 0; i < this._selectedComps.length; i++) {
                maxRight = Math.max(maxRight, this._selectedComps[i].getX() + this._selectedComps[i].getWidth());
            }
            return maxRight - this.getX();
        },

        getPhysicalHeight: function() {
            return this.getSelectableHeight();
        },

        getHeight: function() {
            return this.getPhysicalHeight();
        },

        getAngle: function() {
            return 0;
        },

        getBoundingX: function() {
            return this.getX();
        },

        getBoundingY: function() {
            return this.getY();
        },

        getBoundingWidth: function() {
            return this.getWidth();
        },

        getBoundingHeight: function() {
            return this.getHeight();
        },

        getGlobalPosition: function() {
            var offset = this.getViewNode().getParent().getPosition();
            return {x: offset.x + this.getX(), y: offset.y + this.getY()};
        },
        getGlobalPositionRefNode: function() {
            return this.getGlobalPosition();
        },

        getSelectableWidth: function() {
            var maxRight = -Number.MAX_VALUE;
            for (var i = 0; i < this._selectedComps.length; i++) {
                maxRight = Math.max(maxRight, this._selectedComps[i].getBoundingX() + this._selectedComps[i].getBoundingWidth());
            }
            return maxRight - this.getSelectableX();
        },

        getSelectableHeight: function() {
            var maxBottom = -Number.MAX_VALUE;
            for (var i = 0; i < this._selectedComps.length; i++) {
                maxBottom = Math.max(maxBottom, this._selectedComps[i].getBoundingY() + this._selectedComps[i].getBoundingHeight());
            }
            return maxBottom - this.getSelectableY();
        },

        getSelectableX: function() {
            var minLeft = Number.MAX_VALUE;
            for (var i = 0; i < this._selectedComps.length; i++) {
                minLeft = Math.min(minLeft, this._selectedComps[i].getBoundingX());
            }
            return minLeft;
        },

        getSelectableY: function() {
            var minTop = Number.MAX_VALUE;
            for (var i = 0; i < this._selectedComps.length; i++) {
                minTop = Math.min(minTop, this._selectedComps[i].getBoundingY());
            }
            return minTop;
        },

        getSizeRefNode: function() {
            return {y: this.getPhysicalHeight(), x: this.getWidth()};
        },

        isRotatable: function() {
            return false;
        },

        getDataItem: function() {
            return null;
        },
        useLayoutOnDrag: function() {
            for (var i = 0; i < this._selectedComps.length; i++) {
                if (this._selectedComps[i].useLayoutOnDrag()) {
                    return true;
                }
            }
            return false;
        },
        isResizable: function() {
            return false;
        },
        isHorizontallyMovable: function() {
            return true;
        },
        isVerticallyMovable: function() {
            return true;
        },
        getPosition: function() {
            return {y: this.getY(), x: this.getX(), height: this.getPhysicalHeight(), width: this.getWidth()};
        },
        getHorizontalGroup: function() {
            return null;
        },

        isContainable: function(parentContainerLogic) {
            var value = true;
            for (var i = 0; i < this._selectedComps.length; ++i) {
                value = value && this._selectedComps[i].isContainable(parentContainerLogic);
            }

            return value;
        },
        getSizeLimits: function() {
            return {minW: 10, maxW: 10000, minH: 10, maxH: 10000};
        },
        getExtraPixels: function() {
            return {top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0};
        },
        getResizableSides: function() {
            return [];
        },
        isSelectable: function() {
            return true;
        },
        isMultiSelectable: function() {
            return true;
        },

        isHorizResizable: function() {
            return false;

        },

        onMovement: function() {
            this.fireEvent('componentMoved');
        },

        isVertResizable: function() {
            return false;
        },
        isDeleteable: function() {
            return true;
        },
        isDuplicatable: function() {
            return true;
        },

        dispose: function() {
            for (var i = 0; i < this._selectedComps.length; i++) {
                this._selectedComps[i].dispose();
            }
        },
        isDeleteableRecurse: function() {
            for (var i = 0; i < this._selectedComps.length; i++) {
                if (!this._selectedComps[i].isDeleteableRecurse()) {
                    return false;
                }
            }
            return true;
        },
        getMinDragY: function() {
            var minY = -Number.MAX_VALUE;
            var thisY = this.getY();
            for (var i = 0; i < this._selectedComps.length; i++) {
                var minYFromComp = this._selectedComps[i].getMinDragY(this.getSelectedComps()) - this._selectedComps[i].getY() + thisY;
                minY = Math.max(minY, minYFromComp);
            }
            return minY;
        },

        isInstanceOfClass: function(className) {
            return false;
        },

        getShowOnAllPagesChangeability: function() {
            for (var i = 0; i < this._selectedComps.length; i++) {
                if (!this._selectedComps[i].getShowOnAllPagesChangeability()) {
                    return false;
                }
            }
            return true;
        },

        /**
         * @desc Checks if all of the components are descendants of the header which is fixed position.
         *      Actually, it stops after the first true- since you cannot multiselect components from different scopes (i.e. different parents)
         * @returns {boolean}
         */
        isChildOfFixedPositionHeader: function() {
            for (var i = 0; i < this._selectedComps.length; i++) {
                if (this._selectedComps[i].isChildOfFixedPositionHeader()) {
                    return true;
                }
            }
            return false;
        },

        /**
         * @desc Checks if all of the components are descendants of the footer.
         *      Actually, it stops after the first true- since you cannot multiselect components from different scopes (i.e. different parents)
         * @returns {boolean}
         */
        isChildOfFooter: function() {
            for (var i = 0; i < this._selectedComps.length; i++) {
                if (this._selectedComps[i].isChildOfFooter()) {
                    return true;
                }
            }
            return false;
        },

        /**
         * @desc For fixed position components compatibility. Currently, MultiSelect can never select more than one fixed position component.
         *       If we allow more fixed position components in the future, this will need to be changed to check the multi selected components.
         * @returns {boolean}
         */
        canBeFixedPosition: function() {
            return false;
        },

        setShowOnAllPagesChangeability: function(value) {
            for (var i = 0; i < this._selectedComps.length; i++) {
                this._selectedComps[i].setShowOnAllPagesChangeability(value);
            }
        },

        getComponentProperties: function() {
        },
        canMoveToOtherScope: function() {
            return true;
        },

        isSiteSegment: function() {
            return false;
        },

        disableReportLayoutChange: function() {
            for (var i = 0; i < this._selectedComps.length; i++) {
                this._selectedComps[i].disableReportLayoutChange();
            }
        },

        enableReportLayoutChange: function() {
            for (var i = 0; i < this._selectedComps.length; i++) {
                this._selectedComps[i].enableReportLayoutChange();
            }
        },

        isDraggable: function() {
            for (var i = 0; i < this._selectedComps.length; i++) {
                if (!this._selectedComps[i].isDraggable()) {
                    return false;
                }
            }
            return true;
        },

        isFixedPositioned: function() {
            return false;
        },
        shouldBeFixedPosition: function() {
            return false;
        },

        /**
         * Returns true only if only all
         * of it's _selectedComps can be dragged...
         *
         * @returns {boolean}
         */
        canBeDraggedIntoContainer: function(){
            var i, len = this._selectedComps.length;

            for(i = 0 ; i < len ; i++){
                if(!this._selectedComps[i].canBeDraggedIntoContainer()){
                    return false;
                }
            }

            return true;
        },

        /**
         * disable or enable animation on multiselect by animation state of selected components
         * if one or more components has animation, show the animation button.
         * @returns {boolean}
         * @private
         */
        _getAnimationStateFromComponents: function() {
            var componentCommands;
            var comp;
            var isAnimation = false;

            for (var i = 0; i < this._selectedComps.length; i++) {
                comp = this._selectedComps[i];
                componentCommands = this.resources.W.Editor.getComponentMetaData(comp) || {};
                if (componentCommands.general && componentCommands.general.animation !== false) {
                    isAnimation = true;
                    break;
                }
            }

            return isAnimation;
        },

        /**
         * if at least one component has a behavior, return true
         * @returns {boolean}
         * @private
         */
        _isOneCompHasBehaviors: function() {
            var behaviors;
            var comp;
            var hasAnimation = false;
            for (var i = 0; i < this._selectedComps.length; i++) {
                comp = this._selectedComps[i];
                behaviors = comp.getBehaviors();
                if (behaviors) {
                    hasAnimation = true;
                    break;
                }
            }
            return hasAnimation;
        }
    });
});
