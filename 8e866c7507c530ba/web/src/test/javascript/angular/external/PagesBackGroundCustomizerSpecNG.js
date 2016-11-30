describe("Unit: PagesBackgroundCustomizer (BGPP)", function() {
    'use strict';

    beforeEach(module('PagesBackgroundCustomizer'));

    var controller, scope;
    var pagesModel;

    describe("PagesBackgroundCustomizer - ", function() {
        beforeEach(inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            pagesModel = [{id: 'page1'}, {id: 'page2'}, {id: 'page3'}];
            scope.component = {
                _pagesModel: pagesModel,
                _getSelectAllTitle: function(){return "all";},
                _numberOfSelectedPages: 0,
                _totalNumOfPages: pagesModel.length,
                _selectAll: jasmine.createSpy(),
                reportBISelectAll: jasmine.createSpy(),
                resources: {W: {Preview: {getPreviewManagers: function(){return {Viewer: {getCurrentPageId: function(){return "currentPageId";}}};}}}}
            };

            controller = $controller('PagesBackgroundCustomizerCtrlr', {$scope: scope});
        }));

        it("should ensure that the controller is initialized", function() {
            expect(controller).toBeDefined();

            expect(scope.pages).toBe(pagesModel);
            expect(scope.areAllSelected).toBeFalsy();
            expect(scope.selectAllTitle).toBe('all');
        });

        it("should toggle the selection of all pages on the component when invoking 'chooseAll'", function() {
            scope.chooseAll();

            expect(scope.areAllSelected).toBeTruthy();
            expect(scope.component._numberOfSelectedPages).toBe(pagesModel.length - 1);
            expect(scope.component._selectAll).toHaveBeenCalledWith(pagesModel, true, "currentPageId");
        });

        it("should clear the selection of all pages on the component when invoking 'chooseAll' twice", function() {
            scope.chooseAll();
            scope.chooseAll();

            expect(scope.areAllSelected).toBeFalsy();
            expect(scope.component._numberOfSelectedPages).toBe(0);
            expect(scope.component._selectAll).toHaveBeenCalledWith(pagesModel, false, "currentPageId");
        });
    });
});