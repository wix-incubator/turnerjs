define(['lodash',
    'documentServices/component/componentModes',
    'documentServices/hooks/hooks',
    'documentServices/componentsMetaData/componentsMetaData'], function
    (_,
     componentModes,
     hooks,
     componentsMetaData) {
    'use strict';

    var CONTROLLER_TYPE = 'platform.components.AppController';

    function switchChildren(ps, childrenPointer, i, j) {
        var dal = ps.dal.full;
        var pointers = ps.pointers;

        var firstCompPointer = pointers.getInnerPointer(childrenPointer, i);
        var secondCompPointer = pointers.getInnerPointer(childrenPointer, j);
        var firstComp = dal.get(firstCompPointer);
        var secondComp = dal.get(secondCompPointer);

        dal.set(firstCompPointer, secondComp);
        dal.set(secondCompPointer, firstComp);
    }


    /**
     *
     * @param {ps} ps
     * @param {Pointer} compPointer
     * @param {number} index
     */
    function moveToIndex(ps, compPointer, index) {
        var componentPointers = ps.pointers.components;
        if (!canMoveCompToIndex(ps, compPointer, index)) {
            throw new Error("index is out of children's bounds, cannot move to index");
        }

        var parentPointer = componentPointers.getParent(compPointer);
        var childrenContainerPointer = componentPointers.getChildrenContainer(parentPointer);
        var childrenPointers = componentPointers.getChildren(parentPointer);
        var compIndex = _.findIndex(childrenPointers, {id: compPointer.id});
        if (compIndex === index) {
            return;
        }
        var compToMove = ps.dal.full.get(compPointer);
        ps.dal.full.remove(compPointer);
        ps.dal.full.push(childrenContainerPointer, compToMove, compPointer, index);

        var compType = componentsMetaData.getComponentType(ps, compPointer);
        hooks.executeHook(hooks.HOOKS.ARRANGEMENT.MOVE_AFTER, compType, [ps, compPointer, compIndex, index]);
    }

    function moveBackward(ps, compPointer) {
        var componentPointers = ps.pointers.components;
        if (!canCompMoveBackward(ps, compPointer)) {
            throw new Error("component is the bottom one, cannot move backward");
        }

        var parentPointer = componentPointers.getParent(compPointer);
        var childrenPointers = componentPointers.getChildren(parentPointer);
        var compIndex = _.findIndex(childrenPointers, {id: compPointer.id});
        var prevCompIndex = getPrevCompIndex(ps, compPointer, compIndex, childrenPointers);

        var childrenPointer = componentPointers.getChildrenContainer(parentPointer);
        switchChildren(ps, childrenPointer, compIndex, prevCompIndex);

        var compType = componentsMetaData.getComponentType(ps, compPointer);
        hooks.executeHook(hooks.HOOKS.ARRANGEMENT.MOVE_AFTER, compType, [ps, compPointer, compIndex, prevCompIndex]);
    }


    function isFixedPosition(ps, compPointer) {
        var isFixedPointer = ps.pointers.getInnerPointer(compPointer, 'layout.fixedPosition');
        return !!ps.dal.get(isFixedPointer);
    }

    function isController(ps, compPointer) {
        return componentsMetaData.getComponentType(ps, compPointer) === CONTROLLER_TYPE;
    }

    function getNextCompIndex(ps, compPointer, compIndex, childrenPointers) {
        var isCompFixed = isFixedPosition(ps, compPointer);
        return _.findIndex(childrenPointers, function (pointer, index) {
            return (index > compIndex && isFixedPosition(ps, pointer) === isCompFixed && isCompArrangeable(ps, pointer));
        });
    }

    function getPrevCompIndex(ps, compPointer, compIndex, childrenPointers) {
        var isCompFixed = isFixedPosition(ps, compPointer);
        return _.findLastIndex(childrenPointers, function (pointer, index) {
            return (index < compIndex && isFixedPosition(ps, pointer) === isCompFixed && isCompArrangeable(ps, pointer));
        });
    }

    function moveForward(ps, compPointer) {
        var componentPointers = ps.pointers.components;
        if (!canCompMoveForward(ps, compPointer)) {
            throw new Error("component is the top one, cannot move forward");
        }

        var parentPointer = componentPointers.getParent(compPointer);
        var childrenPointers = componentPointers.getChildren(parentPointer);
        var compIndex = _.findIndex(childrenPointers, {id: compPointer.id});
        var nextCompIndex = getNextCompIndex(ps, compPointer, compIndex, childrenPointers);

        var childrenPointer = componentPointers.getChildrenContainer(parentPointer);
        switchChildren(ps, childrenPointer, compIndex, nextCompIndex);

        var compType = componentsMetaData.getComponentType(ps, compPointer);
        hooks.executeHook(hooks.HOOKS.ARRANGEMENT.MOVE_AFTER, compType, [ps, compPointer, compIndex, nextCompIndex]);
    }

    function moveToFront(ps, compPointer) {
        var dal = ps.dal.full;
        var componentPointers = ps.pointers.components;
        if (!canCompMoveForward(ps, compPointer)) {
            throw new Error("component is the top one, cannot move to front");
        }

        var parentPointer = componentPointers.getParent(compPointer);
        var childrenPointers = componentPointers.getChildren(parentPointer);
        var compIndex = _.findIndex(childrenPointers, {id: compPointer.id});

        var comp = dal.get(compPointer);
        dal.remove(compPointer);

        var childrenPointer = componentPointers.getChildrenContainer(parentPointer);
        dal.push(childrenPointer, comp, compPointer);
        //var newCompPointer = componentPointers.getNewLastChild(parentPointer, compPointer.id);
        //dal.set(newCompPointer, comp);

        var compType = componentsMetaData.getComponentType(ps, compPointer);
        hooks.executeHook(hooks.HOOKS.ARRANGEMENT.MOVE_AFTER, compType, [ps, compPointer, compIndex, _.size(childrenPointers) - 1]);
    }

    function moveToBack(ps, compPointer) {
        var dal = ps.dal.full;
        var componentPointers = ps.pointers.components;
        if (!canCompMoveBackward(ps, compPointer)) {
            throw new Error("component is the bottom one, cannot move to back");
        }

        var parentPointer = componentPointers.getParent(compPointer);
        var childrenContainerPointer = componentPointers.getChildrenContainer(parentPointer);
        var childrenComps = dal.get(childrenContainerPointer);
        var compIndex = _.findIndex(childrenComps, {id: compPointer.id});
        var comp = childrenComps.splice(compIndex, 1)[0];

        childrenComps.unshift(comp);
        dal.set(childrenContainerPointer, childrenComps);

        var compType = componentsMetaData.getComponentType(ps, compPointer);
        hooks.executeHook(hooks.HOOKS.ARRANGEMENT.MOVE_AFTER, compType, [ps, compPointer, compIndex, 0]);
    }

    function canCompMoveForward(ps, compPointer) {
        if (!isCompArrangeable(ps, compPointer)) {
            return false;
        }
        var parentPointer = ps.pointers.components.getParent(compPointer);
        var childrenPointers = ps.pointers.components.getChildren(parentPointer);
        var compIndex = _.findIndex(childrenPointers, {id: compPointer.id});
        return getNextCompIndex(ps, compPointer, compIndex, childrenPointers) > -1;
    }

    function canMoveCompToIndex(ps, compPointer, index) {
        if (!isCompArrangeable(ps, compPointer)) {
            return false;
        }
        var parentPointer = ps.pointers.components.getParent(compPointer);
        var childrenPointers = ps.pointers.components.getChildren(parentPointer);
        return _.isFinite(index) && index >= 0 && index < childrenPointers.length;
    }

    function canCompMoveBackward(ps, compPointer) {
        if (!isCompArrangeable(ps, compPointer)) {
            return false;
        }
        var parentPointer = ps.pointers.components.getParent(compPointer);
        var childrenPointers = ps.pointers.components.getChildren(parentPointer);
        var compIndex = _.findIndex(childrenPointers, {id: compPointer.id});
        return getPrevCompIndex(ps, compPointer, compIndex, childrenPointers) > -1;
    }

    function isCompArrangeable(ps, compPointer) {
        return !ps.pointers.components.isPage(compPointer) && !isController(ps, compPointer);
    }

    return {
        /**
         * Moves a component to a specific index in the children array under it's container.
         *
         * @member documentServices.components.arrangement
         * @param {AbstractComponent} compPointer pointer to the component to move.
         *      @example
         *      documentServices.components.moveToIndex(componentPointer, 3);
         */
        moveToIndex: moveToIndex,

        /**
         * Moves a component one position backward under it's container.
         *
         * @member documentServices.components.arrangement
         * @param {AbstractComponent} compPointer pointer to the component to move.
         *      @example
         *      documentServices.components.moveBackward(componentPointer);
         */
        moveBackward: moveBackward,

        /**
         * Moves a component one position forward under it's container.
         *
         * @member documentServices.components.arrangement
         * @param {AbstractComponent} compReference Reference of the component to move.
         *      @example
         *      documentServices.components.moveForward(componentReference);
         */
        moveForward: moveForward,

        /**
         * Checks if a component can move forward under it's container.
         * Will return true if there is another component in front of it, under the same container.
         * @member documentServices.components.arrangement
         * @param {AbstractComponent} compReference
         * @returns {boolean}
         */
        canMoveForward: canCompMoveForward,

        /**
         * Checks if a component can move backward under it's container.
         * Will return true if there is another component behind of it, under the same container.
         * @member documentServices.components.arrangement
         * @param {AbstractComponent} compPointer
         * @returns {boolean}
         */
        canMoveBackward: canCompMoveBackward,

        /**
         * Moves a component to the front position under it's container.
         * All other components under the same container will be behind it.
         *
         * @member documentServices.components.arrangement
         * @param {AbstractComponent} compPointer pointer to the component to move.
         *      @example
         *      documentServices.components.arrangement.moveToFront(componentPointer);
         */
        moveToFront: moveToFront,

        /**
         * Moves a component to the back most position under it's container.
         * All other components under the same container will be in front of it.
         *
         * @member documentServices.components.arrangement
         * @param {AbstractComponent} compReference Reference of the component to move.
         *      @example
         *      documentServices.components.arrangement.moveToBack(componentReference);
         */
        moveToBack: moveToBack
    };
});
