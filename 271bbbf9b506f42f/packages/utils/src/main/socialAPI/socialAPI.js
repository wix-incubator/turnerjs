define(['utils/socialAPI/providers/facebook', 'utils/socialAPI/providers/vk', 'utils/socialAPI/providers/pinterest'], function (facebook, vk, pinterest) {
    'use strict';

    return {
        facebook: facebook,
        pinterest: pinterest,
        vk: vk
    };
});
