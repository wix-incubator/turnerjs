define(['zepto', 'lodash', 'tpaIntegration/driver/driver', 'reactDOM', 'jasmine-boot'], function ($, _, driver, ReactDOM) {
    'use strict';

    describe('sitePopup', function () {
        var compId = 'comp-is8msnbg';
        var sitePopupzIndex;

        beforeAll(function (done) {
            driver.waitForDomElement('#POPUPS_ROOT', 10, 2000, 'popup was not opened in 10*1000 milsec').then(function (popup) {
                sitePopupzIndex = parseInt(window.getComputedStyle(popup.dom[0]).zIndex);
                done();
            });
        });

        it('should display modal on top of popup', function (done) {
            driver.callOpenModalHandler(compId, "http://static.wixstatic.com/media/3cd1de924697419088c1e033bb3384ef.jpg", 400, 400, function () {}).then(function (modal) {
                var node = ReactDOM.findDOMNode(modal);
                expect(parseInt(window.getComputedStyle(node).zIndex)).toBeGreaterThan(sitePopupzIndex);
                var closeBtn = node.querySelector('.s11xButton');
                closeBtn.click();
                done();
            });
        });

        it('should display tpa popup on top of site popup', function (done) {
            var position = {origin: 'FIXED', placement: 'TOP_CENTER'};
            driver.openPopupHandler(compId, "http://static.wixstatic.com/media/3cd1de924697419088c1e033bb3384ef.jpg", 600, 600, position, function () {}).then(function (popup) {
                var node = ReactDOM.findDOMNode(popup);
                expect(parseInt(window.getComputedStyle(node).zIndex)).toBeGreaterThan(sitePopupzIndex);
                done();
            });
        });

    });

});
