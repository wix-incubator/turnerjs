define([
    'lodash',
    'documentServices/hooks/hooks',
    'documentServices/component/component',
    'documentServices/structure/structure',
    'documentServices/smartBoxes/multiComponentsUtils',
    'documentServices/smartBoxes/groupingUtils',
    'documentServices/mobileConversion/mobileActions',
    'documentServices/structure/utils/arrangement'], function
    (_, hooks, component, structure, multiComponentsUtils, groupingUtils, mobileActions, arrangement) {
    'use strict';


    var INVALID_GROUP_PARENTS_TYPES = ['wysiwyg.viewer.components.HoverBox'];

    function initialize() {
        hooks.registerHook(hooks.HOOKS.REMOVE.AFTER, removeGroupIfLessThanTwoChildren);
    }

    function removeGroupIfLessThanTwoChildren(ps, deletedCompPointer, deletingParent, removeArgs, deletedParentFromFull, dataItem, deletedCompParentPointer) {
        if (deletingParent) {
            return;
        }

        if (removeArgs && removeArgs.isReplacingComp) {
            return;
        }

        if (!deletedCompParentPointer) {
            return;
        }

        if (!ps.dal.isExist(deletedCompParentPointer)) {
            return;
        }

        if (!groupingUtils.isGroup(ps, deletedCompParentPointer)) {
            return;
        }

        if (component.getChildren(ps, deletedCompParentPointer).length >= 2) {
            return;
        }

        var siblings = component.getChildren(ps, deletedCompParentPointer);
        ungroup(ps, siblings, deletedCompParentPointer);
    }

    function ungroup(ps, groupedCompPointers, groupPointer) {
        var groupParentPointer = component.getContainer(ps, groupPointer);
        var groupIndex = _.findIndex(component.getChildren(ps, groupParentPointer), {id: groupPointer.id});

        _.forEach(groupedCompPointers, function (compPointer) {
            structure.setContainer(ps, undefined, compPointer, groupParentPointer);
        });

        _.forEach(groupedCompPointers.reverse(), function (compPointer) {
            arrangement.moveToIndex(ps, compPointer, groupIndex);
        });


        if (ps.pointers.components.isMobile(groupPointer)) {
            mobileActions.hiddenComponents.hide(ps, groupPointer);
        } else { //desktop
            component.deleteComponent(ps, groupPointer, false);
        }
    }

    function getUngroupedComponents(ps, group) {
        return component.getChildren(ps, group);
    }

    function addToGroup(ps, compPointers, group) {
        _.forEach(compPointers, function (compPointer) {
            structure.setContainer(ps, undefined, compPointer, group);
        });
    }

    function groupComponents(ps, groupPointer, compPointers) {
        if (!compPointers || compPointers.length < 2) {
            return;
        }

        if (_.some(compPointers, groupingUtils.isGroupedComponent.bind(this, ps))) {
            return;
        }

        var compPointersClone = _.clone(compPointers);

        _.forEach(compPointersClone, function (compPointer) {
            if (groupingUtils.isGroup(ps, compPointer)) {
                var curGroupChildren = component.getChildren(ps, compPointer);
                compPointers = compPointers.concat(curGroupChildren);
                ungroup(ps, component.getChildren(ps, compPointer), compPointer);
                compPointers = _.reject(compPointers, {id: compPointer.id});
            }
        });

        var groupLayout = multiComponentsUtils.getSnugLayout(ps, compPointers);
        var groupParentPointer = getGroupParentPointer(ps, compPointers);
        addEmptyGroup(ps, groupLayout, groupParentPointer, groupPointer);
        compPointers = multiComponentsUtils.sortComponentsByZOrder(ps, compPointers);
        _.forEach(compPointers, function (compPointer) {
            structure.setContainer(ps, undefined, compPointer, groupPointer);
        });
    }

    function getGroupParentPointer(ps, compPointers) {
        var groupParentPointer = component.getContainer(ps, _.first(compPointers));
        while (groupParentPointer && _.includes(INVALID_GROUP_PARENTS_TYPES, component.getType(ps, groupParentPointer))) {
            groupParentPointer = component.getContainer(ps, groupParentPointer);
        }
        return groupParentPointer;
    }

    function genGroupPointer(ps, compPointers) {
        var id = component.generateNewComponentId();
        var pointers = ps.pointers.components;
        return pointers.getUnattached(id, pointers.getViewMode(compPointers[0]));
    }

    function addEmptyGroup(ps, groupLayout, groupParentPointer, groupPointer) {
        var groupDefinition = getGroupDefinition();
        _.assign(groupDefinition.layout, groupLayout);
        component.add(ps, groupPointer, groupParentPointer, groupDefinition);
    }


    function getGroupDefinition() {
        var groupDefinition = {
            'type': 'Container',
            'components': [],
            'skin': 'wysiwyg.viewer.components.GroupSkin',
            'layout': {
                'width': undefined,
                'height': undefined,
                'x': undefined,
                'y': undefined,
                'scale': 1,
                'rotationInDegrees': 0,
                'fixedPosition': false
            },
            'componentType': groupingUtils.getGroupComponentType(),
            'id': 'i5zga2e4'
        };

        return groupDefinition;
    }

    return {
        initialize: initialize,
        groupComponents: groupComponents,
        addToGroup: addToGroup,
        ungroup: ungroup,
        genGroupPointer: genGroupPointer,
        getUngroupedComponents: getUngroupedComponents
    };
});
