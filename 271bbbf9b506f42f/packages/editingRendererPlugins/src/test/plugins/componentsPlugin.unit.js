define(['Squire'], function (Squire) {
    'use strict';

    var injector, registeredPlugin, skinsMock, mockuire;



    describe('Editing Services Renderer Components Plugin', function () {
        // Mock skins package
        beforeEach(function() {
          injector = injector || new Squire();
          skinsMock = skinsMock || {
            registerRenderPlugin: jasmine.createSpy().and.callFake(function (func) {
              registeredPlugin = func;
            })
          };

          mockuire = mockuire || injector.mock('skins', skinsMock);
        });
        
        var componentsPlugins;

        beforeEach(function (done) {
            registeredPlugin = null;
            mockuire.require(['editingRendererPlugins/plugins/componentsPlugin'], function (_componentsPlugins) {
                componentsPlugins = _componentsPlugins;
                done();
            });
        });

        describe('extendViewerComponents', function () {

            beforeEach(function () {
                componentsPlugins.extendViewerComponents();
            });

            it('should register a renderer plugin on the skins package', function () {
                expect(skinsMock.registerRenderPlugin).toHaveBeenCalled();
            });

            it('the registered plugin function should add a data-wix-component property with an empty string value' +
                'to the refData on the top level element', function () {
                var refData = {'': {}};
                registeredPlugin(refData);
                expect(refData['']['data-wix-component']).toBe('');
            });
        });
    });
});
