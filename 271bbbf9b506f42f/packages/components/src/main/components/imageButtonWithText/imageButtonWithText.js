define([
    'core',
    'experiment'
], function (
    core,
    experiment
) {
    'use strict';

    /**
     * @class components.ImageButtonWithText
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: 'ImageButtonWithText',

        mixins: [core.compMixins.skinBasedComp],

        getSkinProperties: function getSkinProperties() {
            return {
                button: {className: getClassSet.call(this)},
                buttonIcon: {src: this.props.compData.iconSource},
                buttonLabel: {children: this.props.compData.label},
                buttonExtraInfo: {children: this.props.compData.extraInfo}
            };
        }
    };

    function getClassSet() {
        var classesMap = {};
        classesMap['direction-' + this.props.compProp.direction] = true;
        classesMap['label-empty'] = !this.props.compData.label;
        classesMap['extraInfo-empty'] = !experiment.isOpen('sv_blogSocialCounters') || !this.props.compData.extraInfo;
        classesMap['size-' + this.props.compProp.size] = true;
        classesMap['type-' + this.props.compData.type] = true;
        return this.classSet(classesMap);
    }
});
