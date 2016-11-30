define(['containerCommon/mixins/containerMixin', 'containerCommon/mixins/fixedPositionContainerMixin'], function (containerMixin, fixedPositionContainerMixin) {
    'use strict';

    return {
        mixins: {
            containerMixin: containerMixin,
            fixedPositionContainerMixin: fixedPositionContainerMixin
        }
    };
});
