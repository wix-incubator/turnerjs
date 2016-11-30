define(['core'], function (/** core */core) {
    'use strict';

    var mixins = core.compMixins;

    /**
     * @class components.MobileTextOption
     * @extends {core.optionInput}
     * @property {comp.properties} props
     */
    return {
        displayName: 'MobileTextOption',
        mixins: [mixins.optionInput],

        getSkinProperties: function () {
            var refData = {
                'size': {
                    children: this.props.compData.text
                },
                'tooltip': {
                    children: [this.props.compData.description]
                }
            };

            // set a click callback only when the component is enabled.
            if (!this.props.compData.disabled) {
                refData[''] = {
                    onClick: this.props.onClick,
                    style: {
                        cursor: 'pointer'
                    }
                };
            }
            return refData;
        }
    };
});
