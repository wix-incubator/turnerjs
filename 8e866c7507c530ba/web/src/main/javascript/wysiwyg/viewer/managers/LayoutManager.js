/**
 * @class wysiwyg.viewer.managers.LayoutManager
 */
define.Class('wysiwyg.viewer.managers.LayoutManager', function (classDefinition) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.utilize(['wysiwyg.common.managers.classdata.Anchor']);

    def.inherits('bootstrap.managers.BaseManager');

    def.fields({
        LOCK_THRESHOLD: 70,
        DEFAULT_MARGIN: 10,
        SUGGEST_ANCHOR_MARGIN: 20,
        FLAG_DIRTY_TOP: 1,
        FLAG_DIRTY_BOTTOM: 2
    });

    def.binds(['_getAnchoredY', '_getAnchoredH', '_updateLayout','_countToValidate']);

    def.resources(['W.Utils', 'W.Viewer', 'W.Experiments']);

    /** @lends wysiwyg.viewer.managers.LayoutManager */
    def.methods({
        initialize: function () {
            this._AnchorClass = this.imports.Anchor;
            this._isReady = true;

            this._changedByHGroup = [];
            this._emptyArr = [];
            this._nextRenderId;
        },
        setSavedAnchor: function (anchors) {
            this._savedAnchors = anchors;
        },
        attachSavedAnchors: function (optionalScope) {
            this._addMissingAnchors();
            for (var each in this._savedAnchors) {
                if (this._savedAnchors[each]) {
                    var htmlElement = $(each);
                    if (optionalScope && !optionalScope.contains(htmlElement)) {
                        continue;
                    }
                    if (htmlElement && htmlElement.getLogic && htmlElement.getLogic().getAnchors().length === 0) {
                        if (this.attachSavedAnchorsToComponent(htmlElement.getLogic(), this._savedAnchors[each])) {
                            delete this._savedAnchors[each];
                        }
                    }
                }
            }
        },
        _addMissingAnchors: function() {
            if (!this._savedAnchors) {
                this._savedAnchors = {};
            }
            if (!this._savedAnchors.SITE_PAGES || this._savedAnchors.SITE_PAGES.length==0) {
                this._savedAnchors.SITE_PAGES = [
                    {
                        distance: 0,
                        locked: true,
                        originalValue: 0,
                        targetComponent: "PAGES_CONTAINER",
                        type: "BOTTOM_PARENT"

                    }
                ];
            }
            if (!this._savedAnchors.PAGES_CONTAINER || this._savedAnchors.PAGES_CONTAINER.length == 0) {
                this._savedAnchors.PAGES_CONTAINER = [
                    {
                        distance: 10,
                        locked: true,
                        originalValue: 0,
                        targetComponent: "SITE_FOOTER",
                        type: "BOTTOM_TOP"
                    }
                ];
            }
        },
        attachSavedAnchorsToComponent: function (component, savedAnchors) {
            var newAnchors = [];
            var hGroup = [];
            var anchor;
            for (var i = 0; i < savedAnchors.length; i++) {
                anchor = this.deserializeAnchor(savedAnchors[i], component);
                if(!anchor){
                    continue;
                }
                if (anchor.type == anchor.ANCHOR_LOCK_BOTTOM) {
                    hGroup.push(anchor);
                } else {
                    newAnchors.push(anchor);
                }
            }

            this._setComponentAnchors(component, newAnchors);
            if (hGroup.length > 0) {
                var baseAnchor = new this._AnchorClass();
                baseAnchor.distance = 0;
                baseAnchor.originalValue = 0;
                baseAnchor.topToTop = 0;
                baseAnchor.type = baseAnchor.ANCHOR_LOCK_BOTTOM;
                baseAnchor.fromComp = component;
                baseAnchor.toComp = component;
                hGroup.unshift(baseAnchor);
                for (i = 0; i < hGroup.length; i++) {
                    hGroup[i].toComp.setHorizontalGroup(hGroup);
                }
            }
        },

//        findAndEnforceInvalidatedAnchors: function (compLogic) {
//            if (!compLogic.getChildComponents)
//                return;
//
//            var childComps = compLogic.getChildComponents();
//            var invalidated = [];
//            for (var i = 0; i < childComps.length; i++) {
//                this.findAndEnforceInvalidatedAnchors(childComps[i].getLogic());
//                if (childComps[i].getLogic().isAnchorsInvalidated && childComps[i].getLogic().isAnchorsInvalidated()) {
//                    invalidated.push(childComps[i].getLogic());
//                }
//            }
//            this.enforceAnchors(invalidated);
//        },

        _setComponentAnchors: function (component, newAnchors) {
            var oldAnchors = component.getAnchors();
            component.setAnchors(newAnchors);
            this._notifyComponentAnchorsChanged(component, newAnchors, oldAnchors);
        },

        _notifyComponentAnchorsChanged: function (component, newAnchors, oldAnchors) {
            var serializedOldAnchors = this.serializeAnchors(oldAnchors);
            var serializedNewAnchors = this.serializeAnchors(newAnchors);
            if (!this.resources.W.Utils.areObjectsEqual(serializedOldAnchors, serializedNewAnchors)) {
                this.fireEvent('updateAnchors', {
                    data: {
                        changedComponentIds: [component.getComponentId()],
                        oldAnchors: serializedOldAnchors,
                        newAnchors: serializedNewAnchors,
                        sender: 'layoutmanager'
                    }
                });
            }
        },

        serializeAnchors: function (anchors) {
            var serializedAnchors = [];
            var that = this;

            anchors.each(function (anchor) {
                serializedAnchors.push(that.serializeAnchor(anchor));
            });

            return serializedAnchors;
        },

        serializeAnchor: function (anchor) {
            var serializedAnchor = {};
            serializedAnchor.type = anchor.type;
            serializedAnchor.targetComponent = anchor.toComp.getComponentId();
            serializedAnchor.locked = anchor.locked;
            serializedAnchor.distance = anchor.distance;
            serializedAnchor.topToTop = anchor.topToTop;
            serializedAnchor.originalValue = anchor.originalValue;
            return serializedAnchor;
        },

        deserializeAnchors: function (anchors, fromComp) {
            var deSerializedAnchors = [];
            var that = this;
            anchors.each(function (anchor) {
                var deSerializedAnchor = that.deserializeAnchor(anchor, fromComp);
                if (deSerializedAnchor) {
                    deSerializedAnchors.push(deSerializedAnchor);
                }
            });

            return deSerializedAnchors;
        },

        deserializeAnchor: function (serializedAnchor, fromComp) {
            var anchor = new this._AnchorClass();
            anchor.distance = serializedAnchor.distance || 0;
            anchor.topToTop = serializedAnchor.topToTop || 0;
            anchor.originalValue = serializedAnchor.originalValue || 0;
            anchor.type = serializedAnchor.type;
            anchor.toComp = this.resources.W.Viewer.getCompLogicById(serializedAnchor.targetComponent);
            anchor.fromComp = fromComp;
            anchor.locked = serializedAnchor.locked || false;

            if(anchor.toComp && anchor.fromComp){
                return anchor;
            }else{
                return null;
            }
        },

        reportRotateStart: function(){
            this._getAndClearChangedByHGroup();
        },

        /**
         * update the anchors of rotated element, and pushes last state to undo-redo stack
         * @param changedElement
         */
        reportRotate: function(changedElement){
            if (!changedElement) {
                throw new Error('Invalid changed elements');
            }

            this._updateAnchors(changedElement, [changedElement], false);

            //for undoRedo
            this.notifyPositionChanged(changedElement, 'updateAngle');
        },

        /**
         * reportResize
         * @param changedElements
         */
        reportResize: function (changedElements) {
            var i;
            if (!changedElements || changedElements.length === 0) {
                throw new Error('Invalid changed elements');
            }

            this._updateAnchors(changedElements[0], changedElements, false);

            //if any of the elements resized have children, update their anchors as well
            for (i = 0; i < changedElements.length; i++) {
                this.updateChildAnchors(changedElements[i]);
            }

            var alsoChanged = this._getAndClearChangedByHGroup();
            for (i = 0; i < alsoChanged.length; i++) {
                this.updateChildAnchors(alsoChanged[i]);
                this._updateAnchors(alsoChanged[0], [alsoChanged[0]], false);
            }

            var event = {type: 'componentResize', data: {
                changedElements: changedElements
            }};

            this._reportElementsSize(event.data.changedElements);

            this.fireEvent(event.type, event);
        },

        _reportElementsSize: function (resizedElemenets) {
            var item = null;

            for (var j = 0; j < resizedElemenets.length; j++) {
                this.notifyPositionChanged(resizedElemenets[j], 'updateSize');
            }
        },

        /**
         *
         * @param changedElements
         */
        reportMove: function (changedElements) {
            if (!changedElements || changedElements.length === 0) {
                throw new Error('Invalid changed elements');
            }

            for (var i = 0; i < changedElements.length; i++) {
                this.notifyPositionChanged(changedElements[i], 'updatePosition');
            }

            this._updateAnchors(changedElements[0], changedElements, false);
            var alsoChanged = this._getAndClearChangedByHGroup();
            for (i = 0; i < alsoChanged.length; i++) {
                this._updateAnchors(alsoChanged[0], [alsoChanged[0]], false);
            }

            var event = {type: 'componentMove', data: {
                changedElements: changedElements
            }};

            this.fireEvent(event.type, event);
        },

        notifyPositionChanged: function (item, eventName) {
            var oldCoordinates = item.getLastCoordinates();
            var newCoordinates = item.getCurrentCoordinates();
            var oldDimensions = item.getLastDimensions();
            var newDimensions = item.getCurrentDimensions();

            var changedComponentId = item.getComponentId();
            var changedComponent = this.resources.W.Viewer.getCompLogicById(changedComponentId);
            if(!changedComponent){
                return;
            }

            var ySortedElements = this._getSiblingsYSortedArray(changedComponent);
            var ySortedElementIds = ySortedElements.map(function (comp) {
                return comp.getComponentId();
            }.bind(this));
            var changeData = {
                data: {
                    changedComponentIds: [changedComponentId],
                    ySortedElementIds: ySortedElementIds,
                    oldCoordinates: oldCoordinates,
                    newCoordinates: newCoordinates,
                    oldDimensions: oldDimensions,
                    newDimensions: newDimensions
                }
            };

            //fire the event only if position or size actually changed
            if (!_.isEqual(newCoordinates, oldCoordinates) || !_.isEqual(newDimensions, oldDimensions)) {
                this.fireEvent(eventName, changeData);
            }
        },

        reportReparent: function (changedComponents, oldParent, oldParentChildren, isSOAPChange) {
            if (!changedComponents || changedComponents.length === 0) {
                throw new Error('Invalid changed elements');
            }
            this.updateChildAnchors(oldParent);
            this._updateAnchors(changedComponents[0], changedComponents, false);

            var newParentComponent = changedComponents[0].getParentComponent();
            var newParentChildren = newParentComponent.getChildComponents().map(function (component) {
                return component.getLogic();
            });

            var changedComponentIds = changedComponents.map(function (changedComp) {
                return changedComp.getComponentId();
            });

            //            var urmPreliminaryActions = this.injects().UndoRedoManager._constants.PreliminaryActions;
            //            var preliminaryActions = isSOAPChange? [urmPreliminaryActions.SELECT_COMPONENT] : [urmPreliminaryActions.SELECT_COMPONENT, urmPreliminaryActions.OPEN_COMPONENT_PANEL];
            var subType = isSOAPChange ? 'showOnAllPagesChange' : 'scopeChangeWithinPage';

            var event = {type: 'reparentComponent', data: {
                subType: subType,
                changedComponentIds: changedComponentIds,
                oldState: {parentId: oldParent._compId,
                    children: oldParentChildren
                },
                newState: {parentId: newParentComponent._compId,
                    children: newParentChildren
                }
            }};
            this.fireEvent(event.type, event);
        },

        reportDeleteComponent: function (oldParent) {
            this.updateChildAnchors(oldParent);
        },

        reportResizeStart: function (data) {
            this._getAndClearChangedByHGroup();

            var event = {type: 'componentResizeStart', data: data};
            this.fireEvent(event.type, event);
        },

        deleteSavedAnchorsById: function (id) {
            if (this._savedAnchors && this._savedAnchors[id]) {
                delete this._savedAnchors[id];
            }
        },

        /**
         * getOptionalBottomLocks returns a list of components that don't touch the rellevant component
         * but have bottoms that are close on the vertical axis.
         * adds the list of currently connected component
         * @param target the component to check
         * @return the list of components it can be locked to
         */
        getOptionalBottomLocks: function (target) {
            var options = [];
            var tmpOpts = [];
            var groupClone;
            var siblings = target.getViewNode().getParent().getChildren('[comp]');
            var currentGroup = target.getHorizontalGroup();
            var i, len;
            if (currentGroup) {
                for (i = 0, len = currentGroup.length; i < len; ++i) {
                    var group = currentGroup[i];
                    if (group.toComp != target) {
                        options.push({locked: true, target: group.toComp});
                        tmpOpts.push(group.toComp);
                    }
                }
                groupClone = currentGroup.slice(0);
            }

            for (i = 0, len = siblings.length; i < len; ++i) {
                var view = siblings[i], logic = view.getLogic && view.getLogic();
                if (!logic) {
                    continue;
                }

                if (logic != target && tmpOpts.indexOf(logic) === -1 && !this._isHorizontalOverlap(target, logic) && this._isVerticalOverlap(target, logic) && logic.allowHeightLock()) {
                    if (groupClone) {
                        var optionalItem = new this._AnchorClass();
                        optionalItem.fromComp = groupClone[0].fromComp;
                        optionalItem.toComp = logic;
                        groupClone.push(optionalItem);
                        if (this._isValidHGroup(groupClone)) {
                            options.push({locked: false, target: logic});
                        }
                        groupClone.pop(optionalItem);
                    } else {
                        options.push({locked: false, target: logic});
                    }
                }
            }
            return options;
        },
        /**
         * toggles the grouping between to components
         * 1) if they're connected, the toComp is removed from the group
         * 2) if they're both not part of a group they're put in a new group
         * 3) if one of them is in a group the other one gets added
         * 4) if both are in a group the groups are combined
         * @param fromComp
         * @param toComp
         * @param currentlyConnected
         */
        toggleHGroup: function (fromComp, toComp, currentlyConnected) {
            var currentFromCompGroup = fromComp.getHorizontalGroup();
            var currentToCompGroup = toComp.getHorizontalGroup();
            var groupToUpdate;
            var newAnch;
            if (currentlyConnected) {
                //we want to remove the "toComp" from the hGroup
                for (var i = 0; i < currentFromCompGroup.length; i++) {
                    if (currentFromCompGroup[i].toComp === toComp) {
                        toComp.setHorizontalGroup(null);
                        currentFromCompGroup.splice(i, 1);
                    }
                }
                if (currentFromCompGroup.length === 1) {
                    fromComp.setHorizontalGroup(null);
                    return;
                }
                groupToUpdate = currentFromCompGroup;
            }
            else if (currentFromCompGroup && currentToCompGroup) {
                //both items are in a group, we merge the groups!
                currentFromCompGroup.combine(currentToCompGroup);
                groupToUpdate = currentFromCompGroup;
            } else if (currentToCompGroup) {
                newAnch = new this._AnchorClass();
                newAnch.type = newAnch.ANCHOR_LOCK_BOTTOM;
                newAnch.fromComp = currentToCompGroup[0].fromComp;
                newAnch.toComp = fromComp;
                currentToCompGroup.push(newAnch);
                groupToUpdate = currentToCompGroup;

            } else if (currentFromCompGroup) {
                newAnch = new this._AnchorClass();
                newAnch.type = newAnch.ANCHOR_LOCK_BOTTOM;
                newAnch.fromComp = currentFromCompGroup[0].fromComp;
                newAnch.toComp = toComp;
                currentFromCompGroup.push(newAnch);
                groupToUpdate = currentFromCompGroup;
            } else {
                //create a new group
                groupToUpdate = [];
                newAnch = new this._AnchorClass();
                newAnch.type = newAnch.ANCHOR_LOCK_BOTTOM;
                newAnch.fromComp = fromComp;
                newAnch.toComp = fromComp;
                groupToUpdate.push(newAnch);
                newAnch = new this._AnchorClass();
                newAnch.type = newAnch.ANCHOR_LOCK_BOTTOM;
                newAnch.fromComp = fromComp;
                newAnch.toComp = toComp;
                groupToUpdate.push(newAnch);
            }

            this._updateHGroup(groupToUpdate);
        },
        /**
         * updates an horizontal group making sure that:
         * 1) all anchors have the distance delta from the first element in the group to the fromComp
         * 2) all anchors have the same from comp (being the first element in the group)
         * 3) all components referenced in the group have their horizontal-group set to this group
         * @param groupArr
         */
        _updateHGroup: function (groupArr) {
            for (var i = 0; i < groupArr.length; i++) {
                var item = groupArr[i];
                item.toComp.setHorizontalGroup(groupArr);
                item.fromComp = groupArr[0].fromComp;
                item.distance = this._getBottomDiff(item.fromComp, item.toComp);
                item.topToTop = item.toComp.getY() - item.fromComp.getY();
            }
        },
        /**
         * goes over all the items in the group and sets their group to null
         * therefore clearing the group
         * @param groupArr
         */
        _clearHGroup: function (groupArr) {
            for (var i = 0; i < groupArr.length; i++) {
                groupArr[i].toComp.setHorizontalGroup(null);
            }
        },

        /**
         * checks wether a horizontal group is valid, if any item has no vertical overlap with any other item in the group
         * the group is not valid.
         * if one of the items is deleted the group is invalid
         * if the items dont all have the same parent, the group is invalid
         * @param groupArr
         * @return boolean, is the group valid
         */
        _isValidHGroup: function (groupArr) {
            var i;
            for (i = 0; i < groupArr.length; i++) {
                if (groupArr[i].toComp.getIsDisposed() || !groupArr[i].toComp.allowHeightLock()) {
                    return false;
                }
            }
            var clone = groupArr.slice();
            clone.sort(
                function (a, b) {
                    var xA = a.toComp.getX();
                    var xB = b.toComp.getX();
                    if (xA === xB) {
                        return 0;
                    } else {
                        return xA > xB ? 1 : -1;
                    }
                });

            for (i = 0; i < clone.length - 1; i++) {
                if (clone[i].toComp.getX() + clone[i].toComp.getWidth() >= clone[i + 1].toComp.getX()) {
                    return false;
                }
            }
            var parent = groupArr[0].toComp.getViewNode().getParent();
            var upMostBottom = Number.MAX_VALUE;
            var downMostTop = -Number.MAX_VALUE;
            for (i = 0; i < groupArr.length; i++) {
                if (groupArr[i].toComp.getIsDisposed()) {
                    return false;
                }
                if (groupArr[i].toComp.getViewNode().getParent() != parent) {
                    return false;
                }

                var currTop = groupArr[i].toComp.getY();
                var currBottom = groupArr[i].toComp.getPhysicalHeight() + currTop;
                upMostBottom = Math.min(currBottom, upMostBottom);
                downMostTop = Math.max(currTop, downMostTop);
            }
            return (downMostTop < upMostBottom);
        },

        /**
         *
         * @param {Element} fromComp
         * @param {Element} toComp
         * @return the delta from the bottom of fromComp to the bottom of toComp
         */
        _getBottomDiff: function (fromComp, toComp) {
            return toComp.getY() + toComp.getPhysicalHeight() - fromComp.getY() - fromComp.getPhysicalHeight();
        },
        /**
         * validates that all the elements in <i>elementsArray</i> are in the same scope (ie have a common DOM parent) as <i>elementInScope</i>
         * @param elementsArray{Array} elements to validate
         * @param elementInScope{Element} <i>Optional</i> the element whose parent is defined as the common parent
         */
        _validateCommonParent: function (elementsArray, elementInScope) {
            if (elementsArray.length === 0) {
                return;
            }
            var parent;
            if (elementInScope) {
                parent = elementInScope.getViewNode().getParent();

            } else {
                parent = elementsArray[0].getViewNode().getParent();
            }
            var hasDifferentParent = function (item) {
                // this item's parent is different then 'parent'
                return parent !== item.getViewNode().getParent();
            };

            // if some elements have a different parent then the first one, the scope is not valid
            if (elementsArray.some(hasDifferentParent)) {
                throw new Error("Invalid elements scope");
            }
        },

        /**
         * Get all the sibling components (logic) of <i>target</i>
         * Note: if some of the siblings are not wixified or don't have logic yet, an <b>empty array</b> is returned
         * @param target
         */
        _getSiblingsYSortedArray: function (target) {
            var parent = target.getViewNode().getParent();
            if(W.Config.env.$isPublicViewerFrame && parent._sortedChildren) {
                return parent._sortedChildren ;
            }
            var siblings = parent.getChildren('[comp]') ;
            siblings = siblings.reverse() ;
//            var siblings = target.getViewNode().getParent().querySelectorAll('[comp]') ;
            // if some components are not wixified, return an empty array
            if (_.some(siblings, function (targ) {
                // return false if the component has logic
                return !(targ.getLogic);
            })) {
                return [];
            }
            // return the siblings array, sorted by top position

            var res = siblings.map(function(comp) {
                var logic = comp.getLogic();
                return [logic, logic.getBoundingY()] ;
            }).sort(function (a, b) {
                    if (a[1] === b[1]) {
                        return 0;
                    } else {
                        return a[1] > b[1] ? 1 : -1;
                    }
                }).map(function(item) {return item[0];}) ;

            parent._sortedChildren = res ;

            return res;
        },

        /**
         * returns true if 2 elements are overlapping (on the X axis)
         * @param logic1
         * @param logic2
         */
        _isHorizontalOverlap: function (logic1, logic2) {
            var sx1 = logic1.getBoundingX();
            var ex1 = sx1 + logic1.getBoundingWidth();
            var sx2 = logic2.getBoundingX();
            var ex2 = sx2 + logic2.getBoundingWidth();
            return !(sx1 > ex2 || sx2 > ex1);
        },
        /**
         * returns true if 2 elements are overlapping (on the y axis)
         * @param logic1
         * @param logic2
         */
        _isVerticalOverlap: function (logic1, logic2) {
            var sy1 = logic1.getBoundingY();
            var ey1 = sy1 + logic1.getBoundingHeight();
            var sy2 = logic2.getBoundingY();
            var ey2 = sy2 + logic2.getBoundingHeight();
            return !(sy1 > ey2 || sy2 > ey1);
        },

        /**
         * clears the reverse anchors list
         * @param reverseAnchors{Array} a list of anchors to clear
         * @param clearAnchorsToParent{Boolean} if true, clears only ANCHOR_BOTTOM_PARENT type anchors, otherwise clears all the other types
         */
        _clearReverseAnchorsByScope: function (reverseAnchors, clearAnchorsToParent) {
            for (var i = reverseAnchors.length - 1; i > -1; i--) {
                var anchor = reverseAnchors[i];
                if (clearAnchorsToParent) {
                    if (anchor.type == anchor.ANCHOR_BOTTOM_PARENT) {
                        reverseAnchors.splice(i, 1);
                    }
                } else {
                    if (anchor.type != anchor.ANCHOR_BOTTOM_PARENT) {
                        reverseAnchors.splice(i, 1);
                    }
                }
            }
        },

        /**
         * Updated all the anchors of the elements in a given scope
         * @param elementInScope {Element} an html element in the desired scope
         * @param changedElements {Array} array of changed elements (logic). Note: <b>all the changed elements must have a common parent</b>
         * @param parentResized{Boolean}
         */
        _updateAnchors: function (elementInScope, changedElements, parentResized) {
//            this._validateCommonParent(changedElements, elementInScope);
            // get all the siblings of the changed elements
            var ySortedElements = this._getSiblingsYSortedArray(elementInScope);
            var indirectlyAnchored = [];
            var oldAnchors = [];
            var upper, lower, i, ln = ySortedElements.length, anchor = null;
            // create an array of indirectly anchored elements
            // (i.e. elements which are anchored to an element which is anchored to the element in index i)
            // example: (> stands for anchor) A>B>C and A is the element in index 0, then indirectlyAnchored should be [{1:true,2:true}{2:true},{}]
            for (i = 0; i < ySortedElements.length; i++) {
                indirectlyAnchored[i] = {};
                this._clearReverseAnchorsByScope(ySortedElements[i].getReverseAnchors(), false);
                // if the element has an horizontal group, mark it as dirty
                if (ySortedElements[i].getHorizontalGroup()) {
                    ySortedElements[i].getHorizontalGroup().$hGroupDirty = true;
                }
            }
            var parentComp = elementInScope.getParentComponent();
            if (parentComp) {
                this._clearReverseAnchorsByScope(parentComp.getReverseAnchors(), true);
            }

            for (upper = ln - 1; upper >= 0; upper--) {
                var upElement = ySortedElements[upper];
                var angle = upElement.getAngle ? upElement.getAngle() : 0;
                this._updateOrClearHGroup(upElement.getHorizontalGroup(), angle);
                oldAnchors[upper] = upElement.getAnchors();
                var newAnchors = [];
                var foundBottomTop = false;
                if (upElement.isAnchorable().from.allow) {
                    for (lower = upper + 1; lower < ln; lower++) {
                        var lowElement = ySortedElements[lower];
                        if (!lowElement.isAnchorable() || !lowElement.isAnchorable().to.allow) {
                            continue;
                        }
                        anchor = null;
                        // ignore all indirectly anchored elements
                        if (!indirectlyAnchored[upper][lower] && this._isHorizontalOverlap(upElement, lowElement)) {
                            // if the elements are not part of the user change that caused this update,
                            // we want to keep the anchor between them as is if it exists
                            if (changedElements.indexOf(upElement) === -1 && changedElements.indexOf(lowElement) === -1) {
                                anchor = this._findAnchorToComp(oldAnchors[upper], lowElement);
                            }
                            anchor = anchor || this._createToTopAnchor(upElement, lowElement);
                            // mark the anchor in the indirectlyAnchored matrix to avoid duplicate computation
                            indirectlyAnchored[upper][lower] = true;
                            if (anchor.type == anchor.ANCHOR_BOTTOM_TOP) {
                                // everything that's directly/indirectly anchored to the upper element
                                // is considered indirectly anchored to the upper element
                                foundBottomTop = true;
                                this._mergeSets(indirectlyAnchored[upper], indirectlyAnchored[lower]);
                            }
                            // if the anchor type is ANCHOR_TOP_TOP, check and handle containment (ie, add ANCHOR_BOTTOM_BOTTOM anchor)
                            if (anchor.type == anchor.ANCHOR_TOP_TOP && upElement.isAnchorable().to.allow && upElement.isAnchorable().to.allowBottomBottom !== false) {
                                this._checkAndAddBottomAnchor(lowElement, upElement);
                            }
                            newAnchors.push(anchor);
                        }
                    }
                    if (!foundBottomTop) {
                        if (parentComp && parentComp.isAnchorable().to.allow) {
                            anchor = null;
                            //Anchor to parent
                            if (changedElements.indexOf(upElement) === -1 && !parentResized) {
                                anchor = this._findAnchorToComp(oldAnchors[upper], parentComp);
                            }
                            if (!anchor) {
                                anchor = this._createToParentAnchor(upElement, parentComp);
                            }
                            newAnchors.push(anchor);
                        }
                    }
                }

                //Roni - do you remember why did we remove this line?
                //                upElement.setAnchors(newAnchors);

                this._setComponentAnchors(upElement, newAnchors);

            }

        },
        /**
         * checks wetehr a horizontal group is valid
         * if not clears it
         * if it is updates it
         * @param hGroup
         */
        _updateOrClearHGroup: function (hGroup, compRotationAngle) {
            // validate and delete or update the hGroup
            if (hGroup && hGroup.$hGroupDirty) {
                delete hGroup.$hGroupDirty;
                if (this._isValidHGroup(hGroup) && compRotationAngle === 0) {
                    this._updateHGroup(hGroup);
                } else {
                    this._clearHGroup(hGroup);
                }
            }
        },

        _setAnchorableIsLocked: function (anchor) {
            var from = anchor.fromComp;
            var to = anchor.toComp;
            if (from.isAnchorable().from.lock == Constants.BaseComponent.AnchorLock.NEVER || to.isAnchorable().to.lock == Constants.BaseComponent.AnchorLock.NEVER) {
                anchor.locked = false;
            }
            else {
                if (from.isAnchorable().from.lock == Constants.BaseComponent.AnchorLock.ALWAYS || to.isAnchorable().to.lock == Constants.BaseComponent.AnchorLock.ALWAYS) {
                    anchor.locked = true;
                } else {
                    anchor.locked = anchor.distance <= this.LOCK_THRESHOLD;
                }
            }
        },
        _setAnchorableDistance: function (anchor, wantedDistance) {
            var from = anchor.fromComp;
            var to = anchor.toComp;
            if (from.isAnchorable().from.distance !== undefined) {
                wantedDistance = from.isAnchorable().from.distance;
            } else if (to.isAnchorable().to.distance !== undefined) {
                wantedDistance = to.isAnchorable().to.distance;
            }
            anchor.distance = wantedDistance;
        },
        /**
         * creates an anchor between the childElement to the parent element that can change the parents height
         * @param childElement
         * @param parentElement
         * @return the anchor
         */
        _createToParentAnchor: function (childElement, parentElement) {
            var childElementY = childElement.getBoundingY();
            var childElementH = childElement.getBoundingHeight();
            var parentElementH = parentElement.getInlineContentContainer().getSize().y; //parentElement.getPhysicalHeight();
            var anchor = new this._AnchorClass();
            anchor.type = anchor.ANCHOR_BOTTOM_PARENT;
            anchor.fromComp = childElement;
            anchor.toComp = parentElement;
            this._setAnchorableDistance(anchor, parentElementH - childElementY - childElementH);
            this._setAnchorableIsLocked(anchor);
            anchor.topToTop = childElementY;
            anchor.originalValue = parentElementH;
            return anchor;
        },

        /**
         * creates an anchor between the top of the upElement to the top of the lowElement
         * @param upElement
         * @param lowElement
         * @return the anchor
         */
        _createToTopAnchor: function (upElement, lowElement) {
            var upElementY = upElement.getBoundingY();
            var lowElementY = lowElement.getBoundingY();
            var upElementH = upElement.getBoundingHeight();
            var lowElementH = lowElement.getBoundingHeight();
            var anchor = new this._AnchorClass();
            //if the top of the lower element is below the bottom of upper element we create a bottom to top anchor
            anchor.fromComp = upElement;
            anchor.toComp = lowElement;
            if (lowElementY + lowElementH > upElementY + upElementH && lowElementY > upElementY + upElementH / 2) {
                anchor.type = anchor.ANCHOR_BOTTOM_TOP;
                this._setAnchorableDistance(anchor, lowElementY - upElementY - upElementH);
            } else {
                anchor.type = anchor.ANCHOR_TOP_TOP;
                this._setAnchorableDistance(anchor, lowElementY - upElementY);
            }
            this._setAnchorableIsLocked(anchor);
            anchor.topToTop = lowElementY - upElementY;
            anchor.originalValue = lowElementY;
            return anchor;
        },

        /**
         * checks weather the fromComps bottom is indeed above the toComps bottom
         * if so, adds an anchor to keep it that way
         * @param fromComp
         * @param toComp
         */
        _checkAndAddBottomAnchor: function (fromComp, toComp) {
            var toElementY = toComp.getBoundingY();
            var fromElementY = fromComp.getBoundingY();
            var toElementH = toComp.getBoundingHeight();
            var fromElementH = fromComp.getBoundingHeight();
            //if the low-element is fully contained in the upper, we create a bottom bottom anchor
            if ((fromElementY + fromElementH < toElementY + toElementH) && toComp.getAngle() === 0) {
                var bottomBottomAnchor = new this._AnchorClass();
                bottomBottomAnchor.type = bottomBottomAnchor.ANCHOR_BOTTOM_BOTTOM;
                bottomBottomAnchor.fromComp = fromComp;
                bottomBottomAnchor.toComp = toComp;
                this._setAnchorableDistance(bottomBottomAnchor, toElementY + toElementH - fromElementY - fromElementH);
                bottomBottomAnchor.locked = bottomBottomAnchor.distance <= this.LOCK_THRESHOLD;
                bottomBottomAnchor.topToTop = fromElementY - toElementY;
                bottomBottomAnchor.originalValue = toElementH;
                var oldAnchors = [];
                oldAnchors = oldAnchors.concat(fromComp.getAnchors());
                fromComp.addAnchor(bottomBottomAnchor);
                this._notifyComponentAnchorsChanged(fromComp, fromComp.getAnchors(), oldAnchors);
            }
        },

        /**
         * finds the minimum pushed height for a given anchor
         * @param anchor
         * @return the height
         */
        _getAnchoredY: function (anchor) {
            switch (anchor.type) {
                case anchor.ANCHOR_BOTTOM_TOP:
                    var physicalHeight = anchor.fromComp.getBoundingHeight();
                    var expectedY = anchor.fromComp.getBoundingY() + physicalHeight;
                    if (anchor.locked) {
                        expectedY += anchor.distance;
                    } else {
                        expectedY += this.DEFAULT_MARGIN;
                    }
                    return Math.max(expectedY, anchor.fromComp.getBoundingY() + physicalHeight / 2);
                case anchor.ANCHOR_TOP_TOP:
                    return anchor.fromComp.getBoundingY() + anchor.distance;
            }
        },

        /**
         * finds the minimum pushed component height for a given anchor
         * @param anchor
         * @return the minimum height
         */
        _getAnchoredH: function (anchor) {
            var pusherBoundingH = anchor.fromComp.getBoundingHeight();
            var expectedH = anchor.fromComp.getBoundingY() + pusherBoundingH;
            if (anchor.locked) {
                expectedH += anchor.distance;
            } else if (!this.resources.W.Viewer.isPageComponent(anchor.toComp.getOriginalClassName())) {
                expectedH += this.DEFAULT_MARGIN;
            }
            if (anchor.type == anchor.ANCHOR_BOTTOM_BOTTOM) {
                expectedH -= anchor.toComp.getBoundingY();
            } else if (anchor.type == anchor.ANCHOR_BOTTOM_PARENT && anchor.toComp.getInlineContentContainer) {
                if (this._isInlineContentNonZeroSize(anchor.toComp)) {
                    expectedH = expectedH + this._getContainerMarginHeight(anchor.toComp);
                }
            }
            return expectedH;
        },

        _isInlineContentNonZeroSize: function (container) {
            return container.getInlineContentContainer().getSize().y > 0;
        },

        _getContainerMarginHeight: function(comp) {
            return comp.getPhysicalHeight() - comp.getInlineContentContainer().getSize().y;
        },

        /**
         * should be called when we know that enforceAnchors will be called at least once
         */
        notifyWhenNoMoreChanges: function(){
            var self = this;
            self._lastEnforceTime = null;
            var intervalInstance = setInterval(function(){
                var time = Date.now();
                if(self._lastEnforceTime && time - self._lastEnforceTime > 1000){
                    self.fireEvent('layoutDone');
                    console.log('done - ' + (time - self._lastEnforceTime));
                    window.clearInterval(intervalInstance);
                }
            }, 200);
        },

        /**
         * Changes components layout (Y axis only) to match the anchors.
         * This method is usually called be the render function of a changed component in editing mode,
         * @param changedArr {Array} an array of changed components logic. <b>All the components must have teh same DOM parent</b>
         */
        enforceAnchors: function (changedArr, topDirty, skipResize, ySortedElements, dontBubble, timesEnforced) {
            this._lastEnforceTime = Date.now();
            //console.log(this._lastEnforceTime); for future debugging

            if (changedArr.length === 0 || changedArr[0].getViewNode().getParent() === null) {
                return;
            }

            this._validateCommonParent(changedArr);
            var parentComp = changedArr[0].getParentComponent();
            ySortedElements = ySortedElements || this._getSiblingsYSortedArray(changedArr[0]);
            var i;
            // CHANGED || !this._validateComponentsRendered(ySortedElements)
            if (ySortedElements.length === 0) {
                for (i = 0; i < changedArr.length; i++) {
                    delete changedArr[i].$layoutDirtyFlag;
                }
                return;
            }
            //    return;
            for (i = 0; i < changedArr.length; i++) {
                if (!topDirty) {
                    changedArr[i].$layoutDirtyFlag = this.FLAG_DIRTY_BOTTOM;
                }
                else {
                    changedArr[i].$layoutDirtyFlag = this.FLAG_DIRTY_TOP;
                }
            }

            var _passedHereArray = [];

            // go over each of the elements in the scope, and update their Y according to teh anchors
            for (i = 0; i < ySortedElements.length; i++) {
                if (!_passedHereArray[i]) {
                    _passedHereArray[i] = 0;
                }
                _passedHereArray[i]++;
                if (_passedHereArray[i] > 20) {
                    this.resources.W.Utils.debugTrace('Layout Manager', 'enforceAnchors', 'infinite loop');
                    this._enforceParentIfNeeded(parentComp);
                    return;
                }
                ySortedElements[i].$tempIndex = i;
                // ignore elements that have not changed (not flagged as dirty)
                //CHANGED && ySortedElements[i].isRendered()
                if (ySortedElements[i].$layoutDirtyFlag  && ySortedElements[i].isRendered()) {
                    var lowestJumpToI = Number.MAX_VALUE;
                    var pusher = ySortedElements[i];
                    // go over elements that are anchored to pusher, and update their Y
                    for (var j = 0; j < pusher.getAnchors().length; j++) {
                        lowestJumpToI = Math.min(this._enforceSingleAnchor(pusher.getAnchors()[j], skipResize), lowestJumpToI);
                    }
                    if (pusher.getHorizontalGroup()) {
                        lowestJumpToI = Math.min(this._enforceHGroup(pusher), lowestJumpToI);
                    }
                    delete pusher.$layoutDirtyFlag;
                    if (lowestJumpToI < i) {
                        i = lowestJumpToI - 1;
                    }
                }
            }

            var dirtyLayoutComp = this._validateAllClean(ySortedElements);

            if(!dontBubble) {
                this._enforceParentIfNeeded(parentComp,skipResize);
            }

            var result = this._enforceAnchorsAgainIfNeeded(dirtyLayoutComp, timesEnforced);

            return result || (parentComp && parentComp.$layoutDirtyFlag) || false;
        },

        _validateAllClean: function(sortedComps){
            var dirtyLayoutComp = null;
            for (var i = 0; i < sortedComps.length; i++) {
                var comp = sortedComps[i];
                if(!dirtyLayoutComp && comp.$layoutDirtyFlag){
                    LOG.reportEvent(wixEvents.LAYOUT_DIRTY_AFTER_ENFORCE_ANCHORS);
                    dirtyLayoutComp = comp;
                }
                delete comp.$tempIndex;
                delete comp.$layoutDirtyFlag;
            }
            return dirtyLayoutComp;
        },

        _enforceParentIfNeeded: function (parentComp,skipResize) {
            // in case the parent's bottom was pushed down by its content, enforce the parent's anchors
            if (parentComp && parentComp.$layoutDirtyFlag === this.FLAG_DIRTY_BOTTOM) {
                this.enforceAnchors([parentComp],false,skipResize);
            }
        },

        _enforceAnchorsAgainIfNeeded: function(dirtyLayoutComp, timesEnforced){
            timesEnforced = timesEnforced || 0;
            var result = false;
            if(dirtyLayoutComp && timesEnforced < 3){
                timesEnforced = timesEnforced + 1;
                result = this.enforceAnchors([dirtyLayoutComp], dirtyLayoutComp.$layoutDirtyFlag === this.FLAG_DIRTY_TOP, undefined, undefined, undefined, timesEnforced);
            }
            return result;
        },

        _validateComponentsRendered: function (logicArray) {
            for (var i = 0; i < logicArray.length; i++) {
                // This was == .. it might cause problems
                if (logicArray[i].getPhysicalHeight() === 0) {
                    return false;
                }
            }
            return true;
        },
        _validateNodesRendered: function (nodeArray) {
            var testArr = [];
            for (var i = 0; i < nodeArray.length; i++) {
                if (!nodeArray[i].getLogic) {
                    return false;
                }
                testArr.push(nodeArray[i].getLogic());
            }
            return this._validateComponentsRendered(testArr);
        },

        validateAnchorTargetsRendered: function (anchorArr) {

            for (var i = 0; i < anchorArr.length; i++) {
                if (!anchorArr[i].toComp.isRendered()) {
                    return false;
                }
            }
            return true;
        },
        /**
         * calculates the content height of a container using its childrens anchors
         * @param component
         * @return the min content height
         */
        _getContainerContentHeight: function (component) {
            var minHeight = 0;
            var components = component.getChildComponents();
            var contentBottomPosition = 0;
            for (var i = 0; i < components.length; i++) {
                if (components[i] && components[i].getLogic) {
                    contentBottomPosition = this._getCompBottom(components[i].getLogic());
                }
                minHeight = Math.max(contentBottomPosition, minHeight);
            }
            return minHeight;
        },

        _getCompBottom: function (comp) {
            var y = comp.getBoundingY();
            var height = comp.getBoundingHeight();
            return Math.max(y + height, 0);
        },
        /**
         *  calculates the height of the content of the component, either using its children or by setting its min-height to zero and checking its physical height
         * @param component
         *  @return the content height
         */
        _getComponentContentHeight: function (component) {
            var minHeight = 0;
            //if the component is a container, compute the content size using the anchors inside
            if (component.getChildComponents && this._validateNodesRendered(component.getChildComponents())) {
                minHeight = this._getContainerContentHeight(component);
            }
            else {
                minHeight = component.getMinPhysicalHeight();
            }
            return minHeight;
        },
        /**
         * calculates the minimum height the component can be resized to either using its hGroups or its children
         * @param component
         * @return the minimum height
         */
        getComponentMinResizeHeight: function(comp){
            if (comp.getHorizontalGroup()) {
                var componentAnch = this._findAnchorToComp(comp.getHorizontalGroup(), comp);
                return this.getHGroupMinBottom(comp.getHorizontalGroup()) - comp.getY() + componentAnch.distance;
            } else if (comp.getChildComponents) {
                var contentHeight = this._getContainerContentHeight(comp);
                if (comp.getInlineContentContainer) {
                    contentHeight = contentHeight + this._getContainerMarginHeight(comp);
                }
                return contentHeight;
            }
            return 0;
        },
        /**
         * calculates the minimum y the component can be pulled to using its siblings
         * @param component
         * @return the minimum height
         */
        getComponentMinDragY: function (component, ignoreArr) {
            if (!ignoreArr) {
                ignoreArr = this._emptyArr;
            }
            var minY = 0;
            for (var i = 0; i < component.getReverseAnchors().length; i++) {
                var anchor = component.getReverseAnchors()[i];
                if (ignoreArr.contains(anchor.fromComp)) {
                    continue;
                }
                if (anchor.type == anchor.ANCHOR_BOTTOM_TOP) {
                    var compBottom = this._getCompBottom(anchor.fromComp);
                    minY = Math.max(compBottom, minY);
                } else if (anchor.type == anchor.ANCHOR_TOP_TOP) {
                    minY = Math.max(anchor.fromComp.getY(), minY);
                }
            }
            return minY;
        },
        /**
         * returns the minimum bottom of the first component in the group calculated from the various components in the group
         * @param groupArr
         * @return the minimum bottom of the first element in the group
         */
        getHGroupMinBottom: function (groupArr) {
            if (groupArr.length < 2) {
                return 0;
            }
            var groupMinBottom = -Number.MAX_VALUE;
            for (var i = 0; i < groupArr.length; i++) {
                var currentAnch = groupArr[i];
                groupMinBottom = Math.max(this._getComponentContentHeight(currentAnch.toComp) - currentAnch.distance + currentAnch.toComp.getY(), groupMinBottom);
            }
            return groupMinBottom;
        },
        /**
         * returns the minimum y of the first component in the group calculated from the various components in the group
         * @param groupArr
         * @return the minimum y of the first element in the group
         */
        getHGroupMinY: function (groupArr) {
            if (groupArr.length < 2) {
                return 0;
            }
            var groupMinY = -Number.MAX_VALUE;
            for (var i = 0; i < groupArr.length; i++) {
                var currentAnch = groupArr[i];
                groupMinY = Math.max(this.getComponentMinDragY(currentAnch.toComp) - currentAnch.topToTop, groupMinY);
            }
            return groupMinY;
        },
        /**
         * enforces all the anchors in a horizontal group
         * @param pusher
         */
        _enforceHGroup: function (pusher) {

            var returnIndex = Number.MAX_VALUE;
            var groupArr = pusher.getHorizontalGroup();
            var anchForCalcs = this._findAnchorToComp(groupArr, pusher);
            var anchForPush, i;
            if (!anchForCalcs) {
                return Number.MAX_VALUE;
            }
            if (pusher.$layoutDirtyFlag == this.FLAG_DIRTY_TOP) {
                //get the minimum y of the group
                var groupMinY = this.getHGroupMinY(pusher.getHorizontalGroup());
                var newGroupY = Math.max(groupMinY, anchForCalcs.toComp.getY() - anchForCalcs.topToTop);
                //set the y of the first element in the array
                returnIndex = Math.min(this._setHGroupPartY(anchForCalcs.fromComp, newGroupY), returnIndex);
                //set the height of the other elements accordingly
                for (i = 0; i < pusher.getHorizontalGroup().length; i++) {
                    anchForPush = pusher.getHorizontalGroup()[i];
                    var toY = anchForPush.fromComp.getY() + anchForPush.topToTop;
                    returnIndex = Math.min(this._setHGroupPartY(anchForPush.toComp, toY), returnIndex);

                }

            }
            //gets the minimum bottom of the group
            var groupMinBottom = this.getHGroupMinBottom(pusher.getHorizontalGroup());

            //the new group height is either the minimum from above or the height calculated from the current size of the pusher (max)
            var newGroupHeight = Math.max(groupMinBottom - anchForCalcs.fromComp.getY(), anchForCalcs.toComp.getY() + anchForCalcs.toComp.getPhysicalHeight() - anchForCalcs.distance - anchForCalcs.fromComp.getY());
            //set the height of the first element in the array
            returnIndex = Math.min(this._setHGroupPartHeight(anchForCalcs.fromComp, newGroupHeight), returnIndex);
            //set the height of the other elements accordingly
            for (i = 0; i < pusher.getHorizontalGroup().length; i++) {
                anchForPush = pusher.getHorizontalGroup()[i];
                var toHeight = anchForPush.fromComp.getY() + anchForPush.fromComp.getPhysicalHeight() + anchForPush.distance - anchForPush.toComp.getY();
                returnIndex = Math.min(this._setHGroupPartHeight(anchForPush.toComp, toHeight), returnIndex);

            }
            return returnIndex;
        },

        /*enforce hgroup bottom only
         _enforceHGroup: function(pusher) {

         //gets the minimum bottom of the group
         var groupMinBottom = this.getHGroupMinBottom(pusher.getHorizontalGroup());
         var groupArr = pusher.getHorizontalGroup();
         var anchForCalcs = this._findAnchorToComp(groupArr, pusher);
         if (!anchForCalcs)
         return Number.MAX_VALUE;

         //the new group height is either the minimum from above or the height calculated from the current size of the pusher (max)
         var newGroupHeight = Math.max(groupMinBottom - anchForCalcs.fromComp.getY(), anchForCalcs.toComp.getY() + anchForCalcs.toComp.getPhysicalHeight() - anchForCalcs.distance - anchForCalcs.fromComp.getY());
         //set the height of the first element in the array
         var returnIndex = this._setHGroupPartHeight(anchForCalcs.fromComp, newGroupHeight);
         //set the height of the other elements accordingly
         for (i = 0; i < pusher.getHorizontalGroup().length; i++) {
         var anchForPush = pusher.getHorizontalGroup()[i];
         var toHeight = anchForPush.fromComp.getY() + anchForPush.fromComp.getPhysicalHeight() + anchForPush.distance - anchForPush.toComp.getY();
         returnIndex = Math.min(this._setHGroupPartHeight(anchForPush.toComp, toHeight), returnIndex);

         }
         return returnIndex;
         },
         */
        /**
         * checks if the height is different than the current one
         * changes the height if necessary, adds the component to the changedByHGroup array, marks it as dirty and returns its $tempIndex
         * @param comp
         * @param toHeight
         */
        _setHGroupPartHeight: function (comp, toHeight) {
            var origHeight = comp.getPhysicalHeight();
            if (origHeight != toHeight) {
                toHeight = toHeight - comp.getExtraPixels().bottom - comp.getExtraPixels().top;
                comp.setHeight(toHeight);
                comp.$layoutDirtyFlag = this.FLAG_DIRTY_BOTTOM;
                this._changedByHGroup.include(comp);
                if (comp.$tempIndex !== undefined) {
                    return comp.$tempIndex;
                }
            }
            return Number.MAX_VALUE;
        },
        /**
         * checks if the y is different than the current one
         * changes the y if necessary, adds the component to the changedByHGroup array, marks it as dirty and returns its $tempIndex
         * @param comp
         * @param toY
         */
        _setHGroupPartY: function (comp, toY) {
            var origY = comp.getY();
            if (origY != toY) {
                comp.setY(toY);
                comp.$layoutDirtyFlag = this.FLAG_DIRTY_TOP;
                this._changedByHGroup.include(comp);
                if (comp.$tempIndex !== undefined) {
                    return comp.$tempIndex;
                }
            }
            return Number.MAX_VALUE;
        },
        /**
         * updates the anchors of the components child scope (if it includes any component)
         * @param comp
         */
        updateChildAnchors: function (comp) {
            if (comp && comp.getChildComponents) {
                var childList = comp.getChildComponents();
                if (!this._validateNodesRendered(childList)) {
                    return;
                }
                if (childList.length > 0) {
                    this._updateAnchors(childList[0].getLogic(), [], true);
                } else {
                    this._clearReverseAnchorsByScope(comp.getReverseAnchors(), true);
                }
            }
        },
        /**
         * returns and clears the _changedByHGroup array
         * this array is used by the editing frame to mark the changed components so that if they're containers the child scope anchors can be updated
         * @return the _changedByHGroup array
         */
        _getAndClearChangedByHGroup: function () {
            var rtrnArr = this._changedByHGroup;
            this._changedByHGroup = [];
            return rtrnArr;
        },

        /**
         * enforces a single anchor
         * @param anchor an anchor to enforce
         * @param {boolean} [skipResize]
         * @return the most upper element index that was effected by the enforcement
         */
        _enforceSingleAnchor: function (anchor, skipResize) {
            // ignore anchors of type top_top when the pusher's top has not moved (i.e. dirty_bottom  vrs dirty_top)
            if (anchor.type == anchor.ANCHOR_TOP_TOP && anchor.fromComp.$layoutDirtyFlag === this.FLAG_DIRTY_BOTTOM) {
                return Number.MAX_VALUE;
            }

            var ret;
            if (anchor.type == anchor.ANCHOR_BOTTOM_PARENT || anchor.type == anchor.ANCHOR_BOTTOM_BOTTOM) {
                ret =  this._enforceFromBottomTypeAnchor(anchor);
            }
            else {
                ret = this._enforceToTopTypeAnchor(anchor, skipResize);
            }
            this.fireEvent('singleAnchorEnforced', anchor);
            return ret;
        },

        /**
         * enforces the "pushing" anchors: TOP_TOP, BOTTOM_TOP
         * @param anchor an anchor to enforce
         */
        _enforceToTopTypeAnchor: function (anchor, skipResize) {
            //TYPES at this point are TOP_BOTTOM and TOP_TOP
            var pushed = anchor.toComp;
            var expectedY = this._getAnchoredY(anchor);
            var oldBoundingY = pushed.getBoundingY();
            var minY = -Number.MAX_VALUE;
            if (anchor.type == anchor.ANCHOR_BOTTOM_TOP && !anchor.locked) {
                minY = anchor.originalValue;
            }
            if (!skipResize) {
                var pushedOldY = pushed.getY();
                var expectedBoundingY = (oldBoundingY < expectedY ? expectedY : this._getMaxAnchoredY(pushed, minY));
                var deltaY = expectedBoundingY - oldBoundingY;
                if (deltaY !== 0) {
                    pushed.setY(pushedOldY + deltaY);
                    // if the pushed element's Y position shifted, flag it as dirty
                    pushed.$layoutDirtyFlag = this.FLAG_DIRTY_TOP;
                }
            }

            return Number.MAX_VALUE;
        },

        /**
         * enforces the height changing anchors: BOTTOM_BOTTOM and BOTTOM_PARENT
         * @param anchor an anchor to enforce
         */
        _enforceFromBottomTypeAnchor:function (anchor) {
            if (anchor.toComp.getAngle() !== 0) {
                return Number.MAX_VALUE;
            }
            var pushed = anchor.toComp;
            var oldBoundingHeight = pushed.getBoundingHeight();
            var expectedH = this._getAnchoredH(anchor);
            var minH = expectedH;
            if (anchor.toComp.layoutMinHeight) {
                minH = anchor.toComp.layoutMinHeight();
            } else if (!anchor.locked && !(pushed.className === 'wysiwyg.viewer.components.PagesContainer')) {
                minH = anchor.originalValue;
            }
            pushed.setHeight(oldBoundingHeight < expectedH ? expectedH : this._getMaxAnchoredH(pushed, minH));

            if (oldBoundingHeight !== pushed.getBoundingHeight()) {
                pushed.$layoutDirtyFlag = this.FLAG_DIRTY_BOTTOM;
                if (anchor.type == anchor.ANCHOR_BOTTOM_BOTTOM) {
                    return pushed.$tempIndex;
                }
            }
            return Number.MAX_VALUE;
        },

        /**
         * searches for all height changing anchors to a component, returns the maximum height requested by them
         * @param pushedElement the element to check
         * @param minimum  a minimum value to return
         */
        _getMaxAnchoredH:function (pushedElement, minimum) {
            if (!minimum) {
                minimum = -Number.MAX_VALUE;
            }
            var maxExpectedH = minimum;
            pushedElement.getReverseAnchors().forEach(function (rAnchor) {
                if (rAnchor.type != rAnchor.ANCHOR_BOTTOM_PARENT && rAnchor.type != rAnchor.ANCHOR_BOTTOM_BOTTOM) {
                    return;
                }
                var rAnchorExpectedH = this._getAnchoredH(rAnchor);
                if (!rAnchor.locked && !(pushedElement.className === 'wysiwyg.viewer.components.PagesContainer')) {
                    rAnchorExpectedH = Math.max(rAnchorExpectedH, rAnchor.originalValue);
                }
                maxExpectedH = Math.max(rAnchorExpectedH, maxExpectedH);
            }.bind(this));
            return maxExpectedH;
        },

        /**
         * searches for all y changing anchors to a component, returns the maximum y requested by them
         * @param pushedElement the element to check
         * @param minimum  a minimum value to return
         */
        _getMaxAnchoredY: function (pushedElement, minimum) {
            var _getAnchoredY = this._getAnchoredY;
            var maxExpectedY = minimum;
            pushedElement.getReverseAnchors().forEach(function (rAnchor) {
                if (rAnchor.type != rAnchor.ANCHOR_BOTTOM_TOP && rAnchor.type != rAnchor.ANCHOR_TOP_TOP) {
                    return;
                }
                var rAnchorExpectedY = _getAnchoredY(rAnchor);
                maxExpectedY = Math.max(rAnchorExpectedY, maxExpectedY);
            });
            return maxExpectedY;
        },

        /**
         * search for an anchor that has a specific toComp
         * @param anchorArr{Array} anchors to search
         * @param toComp target toComp value
         */
        _findAnchorToComp: function (anchorArr, toComp) {
            for (var i = 0; i < anchorArr.length; i++) {
                if (anchorArr[i].toComp === toComp) {
                    return anchorArr[i];
                }
            }
        },

        /**
         * merge to sets into 'target'
         * a set is an object who has <b>only true</b> as values, and what matters is the keys (unique entrees)
         * @param target the set that will be changed to the merged set
         * @param setToAdd extra entrees to add to target
         */
        _mergeSets: function (target, setToAdd) {
            for (var key in setToAdd) {
                target[key] = true;
            }
        },

        isReady: function () {
            return this._isReady;
        },

        clone: function (newDefine) {
            return this.parent(newDefine);
            //return new this.$class();
        },

        _getRenderModifiers: function () {
            var siteStructureData = this.resources.W.Viewer._siteStructureData;

            if (siteStructureData) {
                return siteStructureData.get('renderModifiers') || {};
            }

            return {};
        },

        appendSavedAnchor: function (anchors) {
            if (this._savedAnchors) {
                Object.append(this._savedAnchors, anchors);
            } else {
                this.setSavedAnchor(anchors);
            }
        },

        callForMeasure: function() {
            if(!this._nextRenderId) {
                this._layoutValidationCounter = this._getLayoutCounter();
                this._countToValidate();
            }

        },

        _countToValidate: function(){
            this._layoutValidationCounter--;
            if(this._layoutValidationCounter===0)
            {
                this._updateLayout();
            }else
            {
                this._nextRenderId = W.Utils.callOnNextRenderPriority(this._countToValidate, 30);
            }
        },

        _getLayoutCounter:function(){
            //TODO: ask sivan if were in mobile
            return 5;
        },


        _updateLayout: function() {
            this._nextRenderId = null;
            var rootComp = this._getLayoutRootComp();
            this._measureInvalidatedComps(rootComp);
            this._enforceAnchorsRecurse(rootComp);
        },

        _getLayoutRootComp: function(){
            return W.Viewer.getSiteNode().$logic;
        },

        _enforceAnchorsRecurse:function(comp) {
            var childComps;
            if(!comp.getChildComponents){
                return;
            }
            if(comp.getCurrentChildren) {
                childComps = comp.getCurrentChildren();
            } else {
                childComps = comp.getChildComponents();
            }
            var changed = [];
            var heightChangedByChildren = false;
            for(var i=0;i<childComps.length;i++) {
                if(childComps[i].getLogic) {
                    heightChangedByChildren = this._enforceAnchorsRecurse(childComps[i].$logic);
                    if(heightChangedByChildren || childComps[i].getLogic().wasHeightChanged()) {
                        childComps[i].$logic.validateHeight();
                        changed.push(childComps[i].$logic);
                    }
                }
            }
            if (changed.length == 0) {
                return false;
            }

            return this.enforceAnchors(changed, false, undefined, undefined, true);
        },

        _measureInvalidatedComps: function (comp) {
            if (!comp.NEW_BASE_COMP && comp.isMeasureNeeded()) {
                comp.measure();
            }
            if (!comp.getChildComponents) {
                return;
            }
            var childComps;
            if (comp.getCurrentChildren) {
                childComps = comp.getCurrentChildren();
            } else {
                childComps = comp.getChildComponents();
            }
            for (var i = 0; i < childComps.length; i++) {
                if (childComps[i].getLogic) {
                    this._measureInvalidatedComps(childComps[i].getLogic());
                }
            }
        }

    });

});