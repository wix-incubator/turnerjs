define([
    'textCommon/mixins/textCompMixin',
    'textCommon/mixins/textScaleMixin',
    'textCommon/mixins/baseTextInput',
    'textCommon/utils/textComponentsUtils'
], function(textCompMixin, textScaleMixin, baseTextInput, textComponentsUtils) {
    'use strict';

    return {
        textCompMixin: textCompMixin,
        textScaleMixin: textScaleMixin,
        textComponentsUtils: textComponentsUtils,
        baseTextInput: baseTextInput
    };
});
