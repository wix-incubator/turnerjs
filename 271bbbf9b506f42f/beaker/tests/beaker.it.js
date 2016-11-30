describe("santa-harness", function() {
    "use strict";

    it("should load an empty site", function(done) {
        require(['santa-harness'], function(santa) {
            santa.start().then(function(harness) {
                expect(harness.documentServices).not.toBeNull();
                console.log('Testing beaker spec');
                done();
            });
        });
    });
});
