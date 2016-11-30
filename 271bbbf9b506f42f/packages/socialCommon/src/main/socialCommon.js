define([
    'socialCommon/mixins/socialCompMixin',
    'socialCommon/mixins/facebookComponentMixin',
    'socialCommon/mixins/twitterComponentMixin'
], function(
    socialCompMixin,
    facebookComponentMixin,
    twitterComponentMixin) {
    'use strict';
    return {
        socialCompMixin: socialCompMixin,
        facebookComponentMixin: facebookComponentMixin,
        twitterComponentMixin: twitterComponentMixin
    };
});
