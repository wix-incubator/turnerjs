describe("AngularResource tests", function() {

    testRequire().resources('angularResource', 'W.Config');

    beforeEach(function() {
        this.angularBasePath    = "//ajax.googleapis.com/ajax/libs/angularjs/";
        this.angularMinified    = "/angular.min.js";
        this.angularNonMinified = "/angular.js";
        this.resource = this.angularResource;
    });

    it("should ensure that the angular resource is defined", function() {
        expect(this.resource).toBeDefined();
    });

    xdescribeExperiment({NGCore: 'new'}, "Tests for NGCore experiment", function() {

        beforeEach(function(){
            this.angularVersion = "1.2.21";
        });

        it("should get Angular 1.2.21 minified for production", function() {
            spyOn(W.Config, 'getDebugMode').andReturn("nodebug");

            var angularUrl = this.angularResource._angularConfigToLoad();

            expect(angularUrl).toBeDefined();
            expect(angularUrl).toBe(this.angularBasePath + this.angularVersion + this.angularMinified);
        });

        it("should get Angular 1.2.21 non-minified for production in debug mode", function() {
            spyOn(W.Config, 'getDebugMode').andReturn("debug");

            var angularUrl = this.angularResource._angularConfigToLoad();

            expect(angularUrl).toBeDefined();
            expect(angularUrl).toBe(this.angularBasePath + this.angularVersion + this.angularNonMinified);
        });
    });

    describeExperiment({NGCore: 'new'}, "Tests for NGCore experiment", function() {

        beforeEach(function() {
            this.angularVersion = "1.3.0-rc.0";
        });

        it("should get the correct Angular  minified version for production", function() {
            spyOn(W.Config, 'getDebugMode').andReturn("nodebug");

            var angularUrl = this.angularResource._angularConfigToLoad();

            expect(angularUrl).toBeDefined();
            expect(angularUrl).toBe(this.angularBasePath + this.angularVersion + this.angularMinified);
        });

        it("should get correct Angular non-minified version  for production in debug mode", function() {
            spyOn(W.Config, 'getDebugMode').andReturn("debug");

            var angularUrl = this.angularResource._angularConfigToLoad();

            expect(angularUrl).toBeDefined();
            expect(angularUrl).toBe(this.angularBasePath + this.angularVersion + this.angularNonMinified);
        });
    });
});