define(['jquery', 'tpaIntegrationEditor/driver/driver', 'jasmine-boot'], function ($, driver) {
    'use strict';

    describe('deleteComponent', function () {

        var commentsAppDefId = '13016589-a9eb-424a-8a69-46cb05ce0b2c';
        var commentsCompId = 'i99ymh5v';

        it('should delete widget', function (done) {
            driver.deleteComponent(commentsAppDefId);
            setTimeout(function() {
                expect($('#' + commentsCompId + 'iframe').length).toBe(0);
                done();
            }, 2000);
        });
    });
});