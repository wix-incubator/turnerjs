describe('Unit: WixImageDirective', function () {
    'use strict';
    var rootScope, scope, elm;

    beforeEach(module('wixElements'));

    beforeEach(module(function ($provide) {
        $provide.factory('editorResources', TestsUtils.mocks.editorResources);
        $provide.factory('imageUtils', TestsUtils.mocks.imageUtils);
    }));

    beforeEach(inject(function ($rootScope) {
        rootScope = $rootScope;
        scope = $rootScope.$new();

    }));

    describe('default behavior -', function () {
        var imgBackgroundStyle;

        beforeEach(inject(function ($compile, imageUtils) {
            spyOn(imageUtils, 'getUrlForPyramid').and.callFake(function (imageRequestedSize, background) {
                    return {
                        url: background + 'url'
                    };
                }
            );
            scope.imageBackground = 'someBackground';
            imgBackgroundStyle = {
                'background-size': 'cover',
                'background-position': '50% 50%',
                'cursor': 'pointer'
            };
            var html = '<wix-image wix-data="imageBackground" img-height="50" img-width="100" img-style=\'' + JSON.stringify(imgBackgroundStyle) + '\'></wix-image>';
            var tempElm = angular.element(html);
            elm = $compile(tempElm)(scope);
            scope.$digest();
        }));

        it('Should call imageUtils getUrlForPyramid with the sizes from the html and wix-data', inject(function (imageUtils) {
            var sizeObj = {
                x: 100,
                y: 50
            };
            expect(imageUtils.getUrlForPyramid).toHaveBeenCalledWith(sizeObj, 'someBackground');
        }));

        it('Should create imageExtendedStyle on the scope', function () {
            var expectedImageExtendedStyle = _.merge(imgBackgroundStyle, {
                height: '50',
                width: '100',
                'background-image': 'url(' + scope.imageBackground + 'url)'
            });
            var directiveScope = elm.isolateScope();

            expect(directiveScope.imageExtendedStyle).toEqual(expectedImageExtendedStyle);
        });

        it('Should update imageExtendedStyle when wixData is changed', function () {
            scope.imageBackground = 'newBackground';
            scope.$digest();
            var directiveScope = elm.isolateScope();

            expect(directiveScope.imageExtendedStyle['background-image']).toEqual('url(' + scope.imageBackground + 'url)');
        });

    });
});