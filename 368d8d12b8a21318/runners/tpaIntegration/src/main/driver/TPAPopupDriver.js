define(['lodash', 'bluebird', 'zepto', 'tpaIntegration/driver/driver', 'reactDOM'], function(_, Promise, $, driver, ReactDOM) {
    'use strict';
    function TPAPopupDriver(popupComp) {
        this.comp = popupComp;
    }

    TPAPopupDriver.prototype.getPopupWidth = function () {
        var popupNode = ReactDOM.findDOMNode(this.comp);

        return popupNode.clientWidth;
    };

    TPAPopupDriver.prototype.getPopupDOMNode = function () {
        return ReactDOM.findDOMNode(this.comp);
    };

    TPAPopupDriver.prototype.getPopupHeight = function () {
        var popupNode = ReactDOM.findDOMNode(this.comp);

        return popupNode.clientHeight;
    };

    TPAPopupDriver.prototype.getPopupTop = function () {
        var popupNode = ReactDOM.findDOMNode(this.comp);
        var top = $(popupNode).position().top;
        var topMargin = $(popupNode).css('margin-top').replace('px', '');

        topMargin = parseInt(topMargin, 10);
        top = Math.floor(top);

        return top + topMargin;
    };

    TPAPopupDriver.prototype.getPopupLeft = function () {
        var popupNode = ReactDOM.findDOMNode(this.comp);
        var left = $(popupNode).position().left;
        var leftMargin = $(popupNode).css('margin-left').replace('px', '');

        leftMargin = parseInt(leftMargin, 10);
        left = Math.floor(left);

        return left + leftMargin;
    };

    TPAPopupDriver.prototype.closePopup = function (data) {
        var popupId = this.comp.props.id;
        /* eslint-disable */
        var closeFn = function closePopupExec(send) {
            Wix.closeWindow('$data');
            send();
        };
        /* eslint-enable */
        closeFn = closeFn.toString().replace('$data', JSON.stringify(data, null, 2) || 'Close popup message');

        return new Promise(function(resolve, reject){
            driver.execute(closeFn, popupId).then(function () {
                var inter = setInterval(function(){
                    if (document.getElementById(popupId).style.display === 'none') {
                        clearInterval(inter);
                        clearTimeout(timeout);
                        resolve();
                    }
                }, 50);

                var timeout = setTimeout(function(){
                    clearInterval(inter);
                    reject();
                }, 1000 * 2);
            });
        });
    };

    TPAPopupDriver.prototype.resizeWindow = function (width, height) {
        var popupId = this.comp.props.id;
        return driver.appIsAlive(popupId).then(function () {
            return driver.resizeWindow(popupId, width, height);
        });
    };

    TPAPopupDriver.prototype.getPopupPosition = function () {
        var popupNode = ReactDOM.findDOMNode(this.comp);

        return popupNode.style.position;
    };

    return TPAPopupDriver;
});
