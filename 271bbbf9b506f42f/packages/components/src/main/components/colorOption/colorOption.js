define(['core', 'lodash'], function (core, _) {
    'use strict';

    var mixins = core.compMixins;

    /**
     * @class components.ColorOption
     * @extends {core.optionInput}
     * @property {comp.properties} props
     */
    return {
        displayName: 'ColorOption',
        mixins: [mixins.optionInput],

        getSkinProperties: function () {
            var refData = {
                '': {
                    style: {backgroundColor: this.props.compData.text}
                },
                'tooltip': this.createInfoTipChildComponent()
            };

            // set a click callback only when the component is enabled.
            if (!this.props.compData.disabled) {
                refData[''] = _.merge(refData[''], {
                    onClick: this.props.onClick,
                    onMouseEnter: this.onMouseEnter,
                    onMouseLeave: this.onMouseLeave
                });
            }
            return refData;
        }
    };
});
