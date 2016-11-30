define(['core/activities/tpaActivity', 'core/activities/contactFormActivity', 'core/activities/subscribeFormActivity'],
    function (TPAActivity, ContactFormActivity, SubscribeFormActivity) {
        "use strict";

        return {
            TPAActivity: TPAActivity,
            ContactFormActivity: ContactFormActivity,
            SubscribeFormActivity: SubscribeFormActivity
        };
    });