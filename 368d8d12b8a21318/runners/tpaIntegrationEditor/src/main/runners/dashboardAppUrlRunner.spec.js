define(['jquery', 'tpaIntegrationEditor/driver/driver', 'jasmine-boot'], function ($, driver) {
    'use strict';

    describe('tpa dashboard App', function () {

        var commentsAppDefId = '13016589-a9eb-424a-8a69-46cb05ce0b2c';
        var commentsCompId = 'comp-i9xyw1f5';

        it('should retrieve dashboard app url', function (done) {
            driver.getDashboardAppURL(commentsAppDefId, commentsCompId)
                .then(function(dashboardURL) {
                    expect(dashboardURL).toContain('//www.wix.com/my-account/sites/');
                    expect(dashboardURL).toContain('app/' + commentsAppDefId + '?referralInfo=editor');
                    done();
                });
        });
    });
});