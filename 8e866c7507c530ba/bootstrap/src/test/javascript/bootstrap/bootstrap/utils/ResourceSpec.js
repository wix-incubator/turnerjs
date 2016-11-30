describe('bootstrap.bootstrap.resource.Resource', function () {
    var theAssignedValue = {TEST:'TEST'};

    describe("fetching a resource", function () {
        it("should fetch a defined resource value", function () {

            var resourceValue;
            this.define.resource('test.resource', theAssignedValue);

            this.resource.getResourceValue('test.resource', function (value) {
                resourceValue = value;
            });

            waitsFor(function () {
                return resourceValue;
            }, "'test.resource' value to be assigned", 10);
            runs(function () {
                expect(resourceValue).toBe(theAssignedValue);
            });
        });
    });
    describe("fetching a pending resource", function () {
        it("should not call the callback for an undefined resource", function () {
            var callback = jasmine.createSpy('_singleResourceCallback');

            this.resource.getResourceValue('test.resource2', callback);

            expect(callback).not.toHaveBeenCalled();
        });

        it("should fetch a pending resource value as soon as it is set", function () {
            var callback = jasmine.createSpy('_singleResourceCallback');
            this.resource.getResourceValue('test.resource3', callback);
            this.define.resource('test.resource3', theAssignedValue);

            expect(callback).toHaveBeenCalledWith(theAssignedValue, 'test.resource3');
        });
    });

});