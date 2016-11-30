define([
    'tpaIntegrationEditor/driver/driver', 'jasmine-boot'
], function (driver) {
    'use strict';

    // http://editor.wix.com/html/editor/web/renderer/edit/3fc4f523-030f-417f-98ae-68a257dfa8e4?metaSiteId=27d337b2-5838-4c4d-a3d6-64b020aa20bd&editorSessionId=3F78FFD7-494A-414F-B49A-A53258511965
    describe('View mode', function () {
        describe('widget url', function() {

            it('should set viewMode to editor in url', function () {
                var appUrl = driver.findCompNodeInPreviewByCompId('comp-icx2z49x').find('iframe').attr('src');
                expect(appUrl).toContain('viewMode=editor');
            });

            it('should keep viewMode when going to preview', function (done) {
                driver.switchToPreviewPromise().then(function() {
                    var appUrl = driver.findCompNodeInPreviewByCompId('comp-icx2z49x').find('iframe').attr('src');
                    expect(appUrl).toContain('viewMode=editor');
                    done();
                }, function(){
                    fail('switch to preview failed');
                    done();
                });
            });
        });

        describe('wix store - product page url', function() {
            it('should keep viewMode when switching from preview to editor', function (done) {
                driver.switchToPreviewPromise().then(function() {
                    driver.navigateToPage('nyixa').then(function() {
                        var appUrl = driver.findCompNodeInPreviewByCompId('TPAMultiSection_icx3voo5').find('iframe').attr('src');
                        expect(appUrl).toContain('viewMode=preview');
                        driver.switchToEditor();
                        appUrl = driver.findCompNodeInPreviewByCompId('TPAMultiSection_icx3voo5').find('iframe').attr('src');
                        expect(appUrl).toContain('viewMode=preview');

                        done();
                    });
                }, function(){
                    fail('switch to preview failed');
                    done();
                });
            });
        });
    });
});
