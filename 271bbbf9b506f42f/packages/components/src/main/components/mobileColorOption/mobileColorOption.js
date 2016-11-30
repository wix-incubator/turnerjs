define(['core'], function (/** core */core) {
    'use strict';

    var mixins = core.compMixins;

    /**
     * @class components.MobileColorOption
     * @extends {core.optionInput}
     * @property {comp.properties} props
     */
    return {
        displayName: 'MobileColorOption',
        mixins: [mixins.optionInput],

        getSkinProperties: function () {
            var refData = {
                '': {
                    style: {
                        backgroundColor: this.props.compData.text
                    }
                }
            };

            // set a click callback only when the component is enabled.
            if (!this.props.compData.disabled) {
                refData[''].onClick = this.props.onClick;
                refData[''].style.cursor = 'pointer';
            }
            return refData;
        }
    };
});
