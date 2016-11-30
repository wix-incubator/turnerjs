describe('Unit: ngIncludeUtils service', function () {
    'use strict';

    var scope, _$timeout;

    /** @type ngIncludeUtils */
    var ngIncludeUtils;

    beforeEach(module('utils'));

    beforeEach(inject(function ($rootScope, $timeout, _ngIncludeUtils_) {
        ngIncludeUtils = _ngIncludeUtils_;
        _$timeout = $timeout;

        scope = $rootScope.$new();
    }));

    describe('listenForAllIncludeLoaded - ', function() {
        var html = "<div>ngInclude1, ngInclude2, ngInclude3</div>",
            ngIncludeCallbackStub,
            elm;

        beforeEach(function() {
            elm = angular.element(html);
            ngIncludeCallbackStub = jasmine.createSpy('ngIncludeCallbackStub');

            ngIncludeUtils.listenForAllIncludeLoaded(elm, scope, ngIncludeCallbackStub);
        });

        it('Should do nothing until ngIncludes loaded event are triggered', function() {
            _$timeout.verifyNoPendingTasks();
            expect(ngIncludeCallbackStub).not.toHaveBeenCalled();
        });

        it('Should do nothing if only 2 of the 3 ngIncludes loaded event are triggered', function() {
            scope.$broadcast('$includeContentLoaded');
            scope.$broadcast('$includeContentLoaded');

            _$timeout.verifyNoPendingTasks();
            expect(ngIncludeCallbackStub).not.toHaveBeenCalled();
        });

        it('Should call the callback when all includes are loaded', function(){
            scope.$broadcast('$includeContentLoaded');
            scope.$broadcast('$includeContentLoaded');
            scope.$broadcast('$includeContentLoaded');
            _$timeout.flush();

            expect(ngIncludeCallbackStub).toHaveBeenCalled();
        });

        describe('when the ngIncludes content causes additional ngInclude to be dynamically added', function() {
            beforeEach(function() {
                scope.$broadcast('$includeContentLoaded');
                scope.$broadcast('$includeContentLoaded');

                elm.html(elm.html() + ' ngInclude4');

                scope.$broadcast('$includeContentLoaded');
            });

            it('Shouldn\'t call the callback if all additional ngIncludes are not yet loaded', function() {
                _$timeout.verifyNoPendingTasks();
                expect(ngIncludeCallbackStub).not.toHaveBeenCalled();
            });

            it('Should call the callback after all includes are loaded', inject(function(){
                scope.$broadcast('$includeContentLoaded');
                _$timeout.flush();

                expect(ngIncludeCallbackStub).toHaveBeenCalled();
            }));
        });
    });
});