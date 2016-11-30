define(['loggingUtils/bi/services/wixBI', 'loggingUtils/bi/services/googleAnalytics', 'loggingUtils/bi/services/facebookRemarketing', 'loggingUtils/bi/services/googleRemarketing', 'loggingUtils/bi/services/yandexMetrika'],
    function(wixBI, googleAnalytics, facebookRemarketing, googleRemarketing, yandexMetrika) {
    'use strict';

    return {
        wixBI: wixBI,
        googleAnalytics: googleAnalytics,
        facebookRemarketing: facebookRemarketing,
        googleRemarketing: googleRemarketing,
        yandexMetrika: yandexMetrika
    };
});
