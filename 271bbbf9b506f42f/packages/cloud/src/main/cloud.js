//don't remove dependencies so that they will register
define([
    'cloud/components/cloudWidget',
    'cloud/components/cloudGluedWidget',
    'cloud/layout/cloudLayout'
], function(cloudWidget) {

    'use strict';

    return {
        widget: cloudWidget
    };
});
