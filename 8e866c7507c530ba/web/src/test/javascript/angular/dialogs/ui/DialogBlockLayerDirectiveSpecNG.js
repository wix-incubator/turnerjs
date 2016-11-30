describe('Unit: DialogBlockLayer Directive', function () {
    'use strict';
    var rootScope, scope, elm;
    var $ = jQuery;

    beforeEach(module('dialogs'));
    beforeEach(module('htmlTemplates'));

    beforeEach(inject(function ($rootScope) {
        rootScope = $rootScope;
        scope = $rootScope.$new();
    }));

    describe('DialogBlockLayer style', function() {

        it('Should set its child\'s class to wix-dialog-backdrop-dark if attribute backdrop isn\'t supplied', inject(function($compile) {
            var html = '<dialog-block-layer></dialog-block-layer>';

            elm = $compile(html)(scope);
            scope.$digest();

            var innerBlockLayer = elm.children();
            expect(innerBlockLayer.hasClass('wix-dialog-backdrop-dark')).toBeTruthy();
        }));

        it('Should set its child\'s class to wix-dialog-backdrop-dark if attribute backdrop isn\'t false', inject(function($compile) {
            var html = '<dialog-block-layer backdrop="someValue"></dialog-block-layer>';

            elm = $compile(html)(scope);
            scope.$digest();

            var innerBlockLayer = elm.children();
            expect(innerBlockLayer.hasClass('wix-dialog-backdrop-dark')).toBeTruthy();
        }));

        it('shouldn\'t set a class to its child if attr backdrop=false', inject(function($compile) {
            var html = '<dialog-block-layer backdrop="false"></dialog-block-layer>';

            elm = $compile(html)(scope);
            scope.$digest();

            var innerBlockLayer = elm.children();
            expect(innerBlockLayer.hasClass('wix-dialog-backdrop-dark')).toBeFalsy();
        }));
    });

    describe('Backdrop click', function() {
        it('Should call dialogWindows.onBackdropClicked with the click coords if attr.backdrop != static', inject(function($compile, dialogWindows) {
            var html = '<dialog-block-layer backdrop="someValue"></dialog-block-layer>';
            spyOn(dialogWindows, 'onBackdropClicked');

            elm = $compile(html)(scope);
            scope.$digest();

            scope.onBlockLayerClicked({pageX: 10, pageY: 20});

            expect(dialogWindows.onBackdropClicked).toHaveBeenCalledWith(10, 20);
        }));

        it('Should not call dialogWindows.onBackdropClicked if attr.backdrop = static', inject(function($compile, dialogWindows) {
            var html = '<dialog-block-layer backdrop="static"></dialog-block-layer>';
            spyOn(dialogWindows, 'onBackdropClicked');

            elm = $compile(html)(scope);
            scope.$digest();

            scope.onBlockLayerClicked({pageX: 10, pageY: 20});

            expect(dialogWindows.onBackdropClicked).not.toHaveBeenCalled();
        }));
    });
});