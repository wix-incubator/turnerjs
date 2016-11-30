define(['core'], function (core) {
    'use strict';

    var mixins = core.compMixins;

    /**
     * @class components.TextOption
     * @extends {core.optionInput}
     * @property {comp.properties} props
     */
    return {
        displayName: 'TextOption',
        mixins: [mixins.optionInput],

        getSkinProperties: function () {
            var refData = {
                'size': {
                    children: this.props.compData.text
                },
                'tooltip': this.createInfoTipChildComponent()
            };

            // set a click callback only when the component is enabled.
            if (!this.props.compData.disabled) {
                refData[''] = {
                    onClick: this.props.onClick,
                    onMouseEnter: this.onMouseEnter,
                    onMouseLeave: this.onMouseLeave
                };
            }
            return refData;
        }
    };
});
