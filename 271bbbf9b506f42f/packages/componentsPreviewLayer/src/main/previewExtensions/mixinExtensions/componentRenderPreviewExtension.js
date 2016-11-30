define(['lodash', 'experiment', 'core', 'santaProps',
    'componentsPreviewLayer/visibilityPlugins/hiddenCompPlugin',
    'componentsPreviewLayer/visibilityPlugins/fixedPositionPlugin'], function(_, experiment, core, santaProps, hiddenCompPlugin, fixedPositionPlugin){
    'use strict';

    function shouldShowHiddenComponents(isHidden, isFixedPosition, showHiddenComponents, showFixedComponents) {
        return isHidden && showHiddenComponents && (!isFixedPosition || showFixedComponents);
    }

    function addClassIfNeeded(classListStr, className) {
        var classListArr = classListStr.split(' ');
        if (_.includes(classListArr, className)) {
            return classListStr;
        }
        classListArr.push(className);
        return classListArr.join(' ');
    }

    var extension = {

        propTypes: {
            renderFlags: santaProps.Types.renderFlags
        },

        transformRefStyle: function(refStyle) {
            var renderFlags = this.props.renderFlags || {};
            var isHidden = _.get(this.props, 'compProp.isHidden');

            var shouldShowFixedPosition = fixedPositionPlugin({
                compId: this.props.id,
                compLayout: this.props.structure.layout,
                renderFlags: renderFlags
            });

            var shouldShowHiddenComp = hiddenCompPlugin({
                compProperties: this.props.compProp,
                compId: this.props.id,
                renderFlags: renderFlags
            });

            if (!shouldShowFixedPosition) {
                return _.defaults({visibility: 'hidden'}, refStyle);
            }

            if (isHidden && shouldShowHiddenComp && shouldShowFixedPosition) {
                return _.omit(refStyle, ['visibility']);
            }

	        return refStyle;
        },

        transformRefClasses: function(refClasses) {
            var isFixedPosition = _.get(this.props, 'structure.layout.fixedPosition');
            var isHidden = _.get(this.props, 'compProp.isHidden');
            var renderFlags = this.props.renderFlags || {};
            var showFixedComponents = renderFlags.allowShowingFixedComponents;
            var showHiddenComponents = renderFlags.showHiddenComponents;
            var ignoreHiddenProperty = _.includes(renderFlags.ignoreComponentsHiddenProperty, this.props.id);

            var isCollapsed = experiment.isOpen('collapseComponent') && _.get(this.props, 'compProp.isCollapsed');
            var ignoreCollapsedProperty = renderFlags.componentViewMode === 'editor';

            var isGhostHidden = !ignoreHiddenProperty && shouldShowHiddenComponents(isHidden, isFixedPosition, showHiddenComponents, showFixedComponents);
            var isGhostCollapsed = isCollapsed && ignoreCollapsedProperty;

            if (isGhostHidden || isGhostCollapsed) {
                return addClassIfNeeded(refClasses, 'hidden-comp-ghost-mode');
            }
            return refClasses;
        }
    };

    return {
        extension: extension,
        mixin: core.compMixins.baseCompMixin
    };
});
