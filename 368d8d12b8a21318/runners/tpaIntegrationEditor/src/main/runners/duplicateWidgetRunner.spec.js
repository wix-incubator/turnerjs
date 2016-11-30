define([
    'tpaIntegrationEditor/driver/driver', 'jasmine-boot'
], function (driver) {
    'use strict';

    // http://editor.wix.com/html/editor/web/renderer/edit/fd7b6056-ba3f-4ecc-b463-9ccc848d474a?metaSiteId=ea84d387-4905-4d56-a547-d1e7dd7e82bc&editorSessionId=1C644228-409A-4BD6-BE8B-FF5AB993EC93&leavePagePopUp=false&debug=tpa,documentServices&petri_ovr=specs.DisableNewRelicScriptsSantaEditor:true&forceEditorVersion=new
    describe('Duplicate widget runner', function () {
        var compId = 'comp-is8ukmen';
        describe('duplicate widget', function() {
            it('should set orig comp id in url', function (done) {
                driver.copyAndPasteComp(compId).then(function (result) {
                    debugger;
                    var appUrl = driver.findCompNodeInPreviewByCompId(result.compRef.id).find('iframe').attr('src');
                    expect(appUrl).toContain('originCompId=' + compId);
                    done();
                });

            });
        });

        describe('copy and paste', function() {
            it('should set orig comp id in url', function (done) {
                driver.duplicateComp(compId).then(function(result) {
                    var appUrl = driver.findCompNodeInPreviewByCompId(result.compRef.id).find('iframe').attr('src');
                    expect(appUrl).toContain('originCompId=' + compId);
                    done();
                });
            });
        });
    });
});
