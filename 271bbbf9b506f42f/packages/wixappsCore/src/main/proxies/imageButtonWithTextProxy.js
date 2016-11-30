define([
    'siteUtils',
    'lodash',
    'wixappsCore/proxies/mixins/baseProxy'
], function (
    siteUtils,
    _,
    baseProxy
) {
    'use strict';

    return {
        mixins: [baseProxy],

        renderProxy: function () {
            var COMP_TYPE = 'wysiwyg.viewer.components.ImageButtonWithText';
            var compProps = _.merge({}, this.getChildCompProps(COMP_TYPE), {
                compData: {
                    iconSource: this.getCompProp('iconSource'),
                    label: this.getCompProp('label'),
                    extraInfo: this.getCompProp('extraInfo'),
                    type: this.getCompProp('type')
                },
                compProp: {
                    direction: this.props.viewProps.compProp.direction,
                    size: this.getCompProp('size')
                }
            });
            return siteUtils.compFactory.getCompClass(COMP_TYPE)(compProps);
        }
    };
});
