define(['lodash', 'zepto', 'tpaIntegration/driver/driver'], function (_, $, driver) {
    'use strict';
    function TPAModalDriver(modalComp) {
        this.comp = modalComp;
    }

    TPAModalDriver.prototype.getModalWidth = function getModalWidth() {
        var modalNode = $('#' + this.comp.props.id + 'dialog');

        return modalNode.width();
    };

    TPAModalDriver.prototype.getModalHeight = function getModalHeight() {
        var modalNode = $('#' + this.comp.props.id + 'dialog');

        return modalNode.height();
    };

    TPAModalDriver.prototype.getModalIframeSrc = function getModalHeight() {
        var modalNode = $('#' + this.comp.props.id + 'dialog');

        return modalNode.find('iframe')[0].src;
    };

    TPAModalDriver.prototype.closeModal = function closeModal() {
        /* eslint-disable */
        var closeFn = function closeModalExec(send) {
            Wix.closeWindow('Close modal message');
            send();
        };
        /* eslint-enable */

        return driver.execute(closeFn, this.comp.props.id);
    };

    TPAModalDriver.prototype.resizeWindow = function (width, height) {
        var modalId = this.comp.props.id;
        return driver.appIsAlive(modalId, 15000).then(function () {
            return driver.resizeWindow(modalId, width, height);
        });
    };

    return TPAModalDriver;
});
