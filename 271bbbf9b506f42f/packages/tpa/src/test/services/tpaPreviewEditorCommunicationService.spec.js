define([
    'lodash',
    'tpa/services/tpaPreviewEditorCommunicationService'
], function(_, tpaPreviewEditorCommunicationService) {
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

        it('doPostMessage', function(){
            spyOn(target, 'postMessage');
            var expectedJson = {
                intent: 'TPA_PREVIEW',
                callId: 1,
                type: 'msgType',
                compId: 'compId',
                data: 'params'
            };
            tpaPreviewEditorCommunicationService.doPostMessage('msgType', 'params', 'compId', jasmine.any(Function));
            expect(target.postMessage).toHaveBeenCalledWith(JSON.stringify(expectedJson), '*');
        });
    });
});
