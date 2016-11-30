/**
 * @author andreys (Andrew Shustariov)
 */
define(['Squire'], function (Squire) {
//define(['Squire', 'fake!core', 'lodash', 'skins'], function (Squire, fakeCore, _, skinsPackage) {
    'use strict';



    xdescribe('DocumentMediaLayout', function () {
        var layoutMock;

        beforeEach(function (done) {
            var injector;

            injector = new Squire();

            injector.mock('layout/util/layout', {
                registerPatcher: jasmine.createSpy('registerPatcher'),
                registerCustomMeasure: jasmine.createSpy('registerCustomMeasure'),
                registerRequestToMeasureChildren: jasmine.createSpy('registerRequestToMeasureChildren')
            });

            injector.require(['layout/specificComponents/documentMediaLayout'], function () {
                layoutMock = injector.mocks['layout/util/layout'];
                done();
            });
        });

        it('registers a patcher for the component', function () {
            expect(layoutMock.registerPatcher).toHaveBeenCalledWith(
                'wysiwyg.viewer.components.documentmedia.DocumentMedia', jasmine.any(Function));
        });

        it('registers a patcher for the component', function () {
            expect(layoutMock.registerCustomMeasure).toHaveBeenCalledWith(
                'wysiwyg.viewer.components.documentmedia.DocumentMedia', jasmine.any(Function));
        });

        it('registers a request to measure the children of the component', function () {
            expect(layoutMock.registerRequestToMeasureChildren).toHaveBeenCalledWith(
                'wysiwyg.viewer.components.documentmedia.DocumentMedia', [
                    ['label'],
                    {pathArray: ['img'], type: 'core.components.Image'},
                    ['link']
                ]);
        });

    });
});
