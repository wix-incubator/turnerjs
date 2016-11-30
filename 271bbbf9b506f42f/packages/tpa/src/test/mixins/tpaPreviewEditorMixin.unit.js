define([
    'lodash',
    'tpa/mixins/tpaPreviewEditorMixin'
], function(_, tpaPreviewEditorMixin) {

    'use strict';

    describe('tpaPreviewEditorMixin', function(){

        var target;
        beforeEach(function() {
            if (window.parent.postMessage) {
                target = window.parent;
            } else if (window.parent.document.postMessage) {
                target = window.parent.document;
            }
        });

        it('openHelp', function(){
            spyOn(target, 'postMessage');
            var appDefinitionId = '111',
                expectedJson = {
                    intent: 'TPA_PREVIEW',
                    callId: jasmine.any(Number),
                    type: 'openHelp',
                    data: appDefinitionId
                };
            tpaPreviewEditorMixin.openHelp(appDefinitionId);
            expect(JSON.parse(target.postMessage.calls.mostRecent().args[0])).toEqual((expectedJson));
            expect(target.postMessage.calls.mostRecent().args[1]).toEqual(('*'));
        });

    });
});
