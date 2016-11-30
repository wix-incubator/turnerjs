describe('Unit: WixTranslateDirective', function () {
    'use strict';

    var rootScope, scope, elm;

    beforeEach(module('utilsDirectives'));

    beforeEach(module(function ($provide) {
        $provide.factory('editorResources', TestsUtils.mocks.editorResources);
    }));

    beforeEach(inject(function ($rootScope, editorResources) {
        rootScope = $rootScope;
        scope = $rootScope.$new();
        spyOn(editorResources, 'translate');
    }));


    describe('Directive behavior when translateTarget is not defined', function () {
        it('Should create a text node with translation result and insert as element child, if element has no child nodes', inject(function ($compile, editorResources) {
            editorResources.translate.and.returnValue('translationResult');
            scope.translateKey = 'TRANSLATE_KEY';

            elm = $compile('<div wix-translate="translateKey"><p></p></div>')(scope);

            expect(editorResources.translate).toHaveBeenCalledWith(scope.translateKey, 'EDITOR_LANGUAGE', scope.translateKey);
            expect(elm[0].innerText).toEqual('translationResult');
        }));

        it('Shouldn\'t change the element text if no key is defined', inject(function ($compile) {
            scope.translateKey = 'TRANSLATE_KEY';

            elm = $compile('<div wix-translate=""><p></p></div>')(scope);

            expect(elm[0].innerText).toBeFalsy();
        }));

        it('Should take explicit value and not translate it if attribute value is in single quotes', inject(function ($compile, editorResources) {
            scope.translateKey = 'TRANSLATE_KEY';
            var translationStr = "'translateKey'",
                html = '<div wix-translate="' + translationStr + '"><p></p></div>';

            elm = $compile(html)(scope);

            expect(editorResources.translate).not.toHaveBeenCalled();
            expect(elm[0].innerText).toEqual('translateKey');
        }));
    });

    describe('Directive behavior when translateTarget attribute is defined', function () {
        it('Should insert the translation to the placeHolder if translateTarget is placeholder', inject(function ($compile, editorResources) {
            editorResources.translate.and.returnValue('translationResult');
            scope.translateKey = 'TRANSLATE_KEY';

            elm = $compile('<input wix-translate="translateKey" translateTarget="placeholder">')(scope);

            expect(elm[0].placeholder).toEqual('translationResult');
        }));
    });

    describe('Behavior when dynamic translation is defined', function () {
        it('Should watch the object in containing scope and update the translation when it changes', inject(function ($compile, editorResources) {
            scope.translateKey = 'TRANSLATE_KEY';
            editorResources.translate.and.returnValue('translationResult');

            elm = $compile('<div wix-translate="translateKey" translate-dynamic="true"><p></p></div>')(scope);
            scope.$digest();
            scope.translateKey = 'NEW_TRANSLATE_KEY';
            editorResources.translate.and.returnValue('newTranslationResult');
            scope.$digest();

            expect(editorResources.translate).toHaveBeenCalledWith(scope.translateKey, 'EDITOR_LANGUAGE', scope.translateKey)
            expect(elm[0].innerText).toEqual('newTranslationResult');
        }));
    });
});