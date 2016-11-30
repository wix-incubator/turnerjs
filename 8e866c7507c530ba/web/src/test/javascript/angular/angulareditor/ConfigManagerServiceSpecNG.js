describe('Unit: ConfigManager Service', function () {

    var configManager;

    beforeEach(module('angularEditor'));

    beforeEach(inject(function(_configManager_) {
        configManager = _configManager_;
    }));

    describe('Service exposed configurations - ', function() {
        it('should expose a webThemeDir property', function() {
            expect(configManager.webThemeDir).toEqual('/editor_web/');
        });

        it('should add a topology object to the rootScope with the webThemeDir', inject(function($rootScope) {
            expect($rootScope.topology).toBeDefined();
            expect($rootScope.topology.webThemeDir).toEqual(configManager.webThemeDir);
        }));
    });
});