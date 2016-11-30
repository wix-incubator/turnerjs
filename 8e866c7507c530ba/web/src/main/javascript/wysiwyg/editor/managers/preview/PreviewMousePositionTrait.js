/**
 * @class wysiwyg.editor.managers.preview.PreviewMousePositionTrait
 * @lends wysiwyg.editor.managers.WPreviewManager
 */
define.Class('wysiwyg.editor.managers.preview.PreviewMousePositionTrait', function(classDefinition){
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;


    def.resources(['W.Utils']);

    /** @lends wysiwyg.editor.managers.WPreviewManager */
    def.methods({

        initialize: function() {


        },

        previewToEditorCoordinates: function(position, considerScroll) {
            //Add preview panel's position
            var previewPosition = this.getPreviewPosition();

            position.x += previewPosition.x;
            position.y += previewPosition.y;

            if(considerScroll){
                position.x -= window.pageXOffset;
                position.y -= window.pageYOffset;
            }
            return position;
        },

        editorToPreviewCoordinates: function(position) {
            //Add preview panel's position
            var previewPosition = this.getPreviewPosition();
            var previewScroll = window.getScroll();
            position.x -= previewPosition.x;
            position.y -= previewPosition.y;
            position.y += previewScroll.y;
            return position;
        },

        getGlobalRefNodePositionInEditor: function(component, considerScroll){
            var position = component.getGlobalPositionRefNode();
            return this.previewToEditorCoordinates(position, considerScroll);
        },

        translateEditorClickPosition: function(clickPosition){
            clickPosition = clickPosition || {x:0, y:0};
            var translatedPosition = {};
            this._previewPosition = this._previewPosition || this.getPreviewPosition();
            translatedPosition.x = clickPosition.x - this._previewPosition.x;
            translatedPosition.y = clickPosition.y - this._previewPosition.y;

            return translatedPosition;
        },

        getNodeGlobalPosition: function(htmlNode) {
            var position = htmlNode.getPosition();
            return this.previewToEditorCoordinates(position);
        },


        selectionFilter:function(comp) {
            if(!comp.isSelectable() || !comp.getIsDisplayed()){
                return false;
            }
            return true;

        },

        allComponentsFromGlobalCoordinates: function(x, y, filterFunc, margin) {
            return this._componentFromGlobalCoordinates(x, y, this.getPreviewManagers().Viewer.getSiteNode(), filterFunc, true, true, margin);
        },

        componentInScopeFromGlobalCoordinates: function(x, y, filterFunc, scope) {
            return this._componentFromGlobalCoordinates(x, y, scope, filterFunc, false);
        },

        componentFromGlobalCoordinates: function(x, y, filterFunc) {
            return this._componentFromGlobalCoordinates(x, y, this.getPreviewManagers().Viewer.getSiteNode(), filterFunc, true, false);
        },

        _componentFromGlobalCoordinates: function(x, y, scope, filterFunc, isRecursive, isMultipleResults, margin) {
            x += window.pageXOffset;
            y += window.pageYOffset;

            var previewComponent = this.getPreviewComponent();
            var previewPosition = previewComponent.getPosition();

            return this._componentFromGlobalCoordinatesRecurse(x, y, scope, filterFunc, isRecursive, isMultipleResults, margin, previewPosition);
        },

        _componentFromGlobalCoordinatesRecurse: function(x, y, scope, filterFunc, isRecursive, isMultipleResults, margin, previewPosition) {
            var results = [], children, offset;

            var logic = (scope && scope.getLogic) ? scope.getLogic() : null;
            if (logic && logic.IS_CONTAINER) {
                children = this._calcContainerChildren(logic, children);
                offset = this._calcContainerOffset(logic, previewPosition);
            }
            else {
                children = scope.getChildren("[comp]").reverse();
                offset = this.getNodeGlobalPosition(scope);
            }


            var curChild, curComponent, compDimensions, recursiveResult;
            for (var i = 0; i < children.length; i++) {
                curChild = children[i];
                curComponent = curChild.getLogic && curChild.getLogic();
                if (!curComponent) { // protect against unwixified comps
                    continue;
                }

                if (isRecursive && curComponent.IS_CONTAINER) {
                    var childrenContainer;
                    if (curChild.$logic.getCurrentChildren) {
                        childrenContainer = curChild;
                    } else {
                        childrenContainer = curChild.$logic.getInlineContentContainer();
                    }

                    recursiveResult = this._componentFromGlobalCoordinatesRecurse(x, y, childrenContainer, filterFunc, isRecursive, isMultipleResults, margin, previewPosition);
                    if (recursiveResult) {
                        if (isMultipleResults) {
                            results = results.concat(recursiveResult)
                        } else {
                            return recursiveResult;
                        }
                    }
                }

                compDimensions = this._calcComponentDimensions(offset, curComponent, previewPosition, margin);
                var passedFilters = (!filterFunc || filterFunc(curComponent));

                if (passedFilters && this._isClickOnComponent(x, y, compDimensions, curComponent)) {
                    if (isMultipleResults) {
                        results.push(curComponent);
                    } else {
                        return curComponent;
                    }
                }

            }

            if (isMultipleResults) {
                return results;
            } else {
                return null;
            }
        },

        _calcComponentDimensions: function (offset, curComponent, previewPosition, margin) {
            var compX = offset.x + curComponent.getSelectableX();
            var compY = offset.y + curComponent.getSelectableY();
            var compWidth = curComponent.getSelectableWidth();

            // if(typeof component.getLayoutMode === 'function' && component.getLayoutMode() === 'FIXED'){
            if (typeof curComponent.shouldBeFixedPosition === 'function' && curComponent.shouldBeFixedPosition()) {
                compY -= offset.y - window.pageYOffset - previewPosition.y;
                compX -= offset.x;
            }

            curComponent.flushPhysicalHeightCache();
            var compHeight = curComponent.getSelectableHeight();

            var minComponentMeasurementForSelection = 21;
            if (compWidth < minComponentMeasurementForSelection) {
                compX -= Math.round((minComponentMeasurementForSelection - compWidth) / 2);
                compWidth = minComponentMeasurementForSelection;
            }
            if (compHeight < minComponentMeasurementForSelection) {
                compY -= Math.round((minComponentMeasurementForSelection - compHeight) / 2);
                compHeight = minComponentMeasurementForSelection;
            }

            if (!isNaN(margin)) {
                //increase the component width & height by the input margin - simulate a larger element than reality
                compX -= margin;
                compWidth += (margin * 2);

                compY -= margin;
                compHeight += (margin * 2);
            }

            return {compX: compX, compY: compY, compWidth: compWidth, compHeight: compHeight, minComponentMeasurementForSelection: minComponentMeasurementForSelection};
        },

        _isClickOnComponent: function(mouseClickX, mouseClickY, compDimensions, component){
            if (component.getAngle() === 0){
                return this._isClickOnHorizontalComponent(mouseClickX, compDimensions.compX, compDimensions.compWidth, mouseClickY, compDimensions.compY, compDimensions.compHeight);
            } else {
                return this._isClickOnRotatedComponent(mouseClickX, compDimensions.compX, compDimensions.compWidth, mouseClickY, compDimensions.compY, compDimensions.compHeight, component);
            }
        },

        _isClickOnHorizontalComponent: function(mouseClickX, compX, compWidth, mouseClickY, compY, compHeight){
            if (mouseClickX > compX && mouseClickX < (compX + compWidth) &&
                mouseClickY > compY && mouseClickY < (compY + compHeight)) {
                return true;
            } else {
                return false;
            }
        },

        _isClickOnRotatedComponent: function(mouseClickX, compX, compWidth, mouseClickY, compY, compHeight, component){
            var compCenter = {
                x: compX + compWidth/2,
                y: compY + compHeight/2
            };

            var clickLocation = {
                x: mouseClickX,
                y: mouseClickY
            };
            var clickCalculationTriangle = {
                A: clickLocation,
                B: compCenter
            };

            var dy = clickLocation.y - compCenter.y;
            var dx = clickLocation.x - compCenter.x;
            clickCalculationTriangle.hypotenuse = Math.pow(Math.pow(dx, 2) + Math.pow(dy, 2),0.5);
            if (dx === 0) {
                clickCalculationTriangle.ABHorizontalXangle = (dy > 0) ? Math.PI / 2 : -Math.PI / 2;
            } else {
                clickCalculationTriangle.ABHorizontalXangle = Math.atan(dy / dx);
            }
            var compRotationAngel =  this.resources.W.Utils.Math.degreesToRadians(component.getAngle());
            clickCalculationTriangle.ABComponentXangle = clickCalculationTriangle.ABHorizontalXangle - compRotationAngel;
            var clickComponentDx = Math.abs(clickCalculationTriangle.hypotenuse * Math.cos(clickCalculationTriangle.ABComponentXangle));
            var clickComponentDy = Math.abs(clickCalculationTriangle.hypotenuse * Math.sin(clickCalculationTriangle.ABComponentXangle));

            if (clickComponentDx < compWidth / 2 && clickComponentDy < compHeight / 2){
                return true;
            }
            return false;
        },

        _calcContainerOffset: function (logic, previewPosition) {
            var offset = logic.getGlobalPositionRefNode();

            offset.x += previewPosition.x;
            offset.y += previewPosition.y;
            return offset;
        },

        _calcContainerChildren: function (logic, children) {
            if (logic.getCurrentChildren) {
                children = logic.getCurrentChildren().reverse();
            } else {
                children = logic.getChildComponents().reverse();
            }
            return children;
        }
    });
});
