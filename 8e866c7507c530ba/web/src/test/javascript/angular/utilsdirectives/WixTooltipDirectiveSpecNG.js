describe('Unit: wixToolTip', function () {
    'use strict';

    var rootScope, scope, elm, editorCommands;

    var TOOLTIP_ID = 'ttid_fakeTooltip';

    beforeEach(module('utilsDirectives', function ($provide) {
        $provide.factory('editorCommands', TestsUtils.mocks.editorCommands);
    }));

    beforeEach(inject(function ($rootScope) {
        rootScope = $rootScope;
        scope = $rootScope.$new();
        scope.ttid = TOOLTIP_ID;

    }));


    describe('tooltip directive ', function () {

        beforeEach(inject(function ($compile, _editorCommands_) {
            editorCommands = _editorCommands_;
            var html = '<div wix-tooltip="ttid"</div>';
            elm = $compile(html)(scope);
            scope.$digest();
        }));

        it('Calls the tooltip.Showtip Command when moused enter', function () {
            spyOn(editorCommands, 'executeCommand');
            elm.triggerHandler('mouseenter', {target: elm});
            expect(editorCommands.executeCommand).toHaveBeenCalledWith('Tooltip.ShowTip', {id: TOOLTIP_ID}, elm[0]);
        });

        it('Calls the tooltip.CloseTip Command when moused enter', function () {
            spyOn(editorCommands, 'executeCommand');
            elm.triggerHandler('mouseleave');
            expect(editorCommands.executeCommand).toHaveBeenCalledWith('Tooltip.CloseTip');
        });


    });
});