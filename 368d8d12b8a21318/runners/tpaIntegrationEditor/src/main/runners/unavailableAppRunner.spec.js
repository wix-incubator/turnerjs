define([
    'tpaIntegrationEditor/driver/driver', 'jasmine-boot'
], function (driver) {
    'use strict';

    // http://editor.wix.com/html/editor/web/renderer/edit/029e2820-5159-4e5e-86f4-36d11edc5a15?metaSiteId=98c3655b-39dc-46be-94e4-bdb5490181c9&openpanel=market&editorSessionId=dfad8365-7698-4775-8b41-b251c7eb0952&petri_ovr=specs.RenderSantaModelsInPreview:true;specs.RenderSantaInEditor:true;specs.DisableNewRelicScripts:true;&SantaVersions=http://localhost/target&SantaEditorVersions=http://localhost/editor-base/target&forceEditorVersion=new&debug=all
    describe('Unavailable app runner', function () {

        var originalTimeout;

        beforeEach(function() {
            originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 24000;
        });

        it('should display unavailable app text', function (done) {
            setTimeout(function() {
                var oopsText = driver.findCompNodeInPreviewByCompId('comp-ida2713punavailableMessageOverlaytextTitle').html();
                expect(oopsText).toEqual('Oops! Something Went Wrong');
                var unavailableText = driver.findCompNodeInPreviewByCompId('comp-ida2713punavailableMessageOverlaytext').find('span').html();
                expect(unavailableText).toContain('<b>getViewModeApp</b> is experiencing problems. Please give it a try later, or contact');
                done();
            }, 23000);
        });

        afterEach(function() {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        });
    });
});
