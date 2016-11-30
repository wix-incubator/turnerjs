//don't remove aspects so that they will register
/*eslint no-unused-vars:0*/
define([
    'wixCode/utils/wixCodeWidgetService',
    'wixCode/aspects/wixCodeAspectCollector',
    'wixCode/utils/messageBuilder',
    'wixCode/utils/kibanaReporter',
    'wixCode/aspects/wixCodePostMessageService'
], function (
        wixCodeWidgetService,
        wixCodeAspectCollector,
        messageBuilder,
        kibanaReporter,
        wixCodePostMessageService) {
    'use strict';

    return {
        wixCodeWidgetService: wixCodeWidgetService,
        log: kibanaReporter,
        messageBuilder: messageBuilder,
        wixCodePostMessageService: wixCodePostMessageService
    };
});
