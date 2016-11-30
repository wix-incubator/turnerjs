describe('Unit: SafeApply', function () {

    var rootScope;

    beforeEach(module('angularEditor'));

    beforeEach(inject(function($rootScope) {
        rootScope = $rootScope;
    }));

    describe('general functionality - ', function() {
        it('should call the function if in an $apply phase', function() {
            rootScope.$root.$$phase = '$apply';
            spyOn(rootScope, '$apply');

            rootScope.safeApply(function(){});

            expect(rootScope.$apply).not.toHaveBeenCalled();
        });

        it('should call the function if in $digest phase', function() {
            rootScope.$root.$$phase = '$digest';
            spyOn(rootScope, '$apply');

            rootScope.safeApply(function(){});

            expect(rootScope.$apply).not.toHaveBeenCalled();
        });

        it('should do nothing if the supplied param is not a function', function() {
            spyOn(rootScope, '$apply');

            var wrapperFn = function() {
                rootScope.safeApply('someParam');
            };

            expect(wrapperFn).not.toThrow();
        });

        it('should call the function within an apply scope', function() {
            rootScope.$root.$$phase = 'someOtherPhase';
            spyOn(rootScope, '$apply');

            var fn = function(){};

            rootScope.safeApply(fn);

            expect(rootScope.$apply).toHaveBeenCalledWith(fn);
        });
    });
});