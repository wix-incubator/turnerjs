describe('Unit: WixImagePickerDirective', function () {
    'use strict';

    var rootScope, scope, elm;
    var imagePickerCallback;

    beforeEach(module('wixElements'));

    beforeEach(module(function ($provide) {
        $provide.factory('editorResources', TestsUtils.mocks.editorResources);
        $provide.factory('editorCommands', TestsUtils.mocks.editorCommands);
    }));

    beforeEach(inject(function ($rootScope) {
        rootScope = $rootScope;
        scope = $rootScope.$new();

        imagePickerCallback = function() {

        };

        scope.height = '40px';
        scope.width = '200px';
        scope.initialTab = 'my';
        scope.onImagePick = imagePickerCallback;
        scope.wixData = {};
    }));

    describe('WixImagePickerDirective -', function() {
        beforeEach(inject(function($compile) {
            var html = '<wix-image-picker label="Chooze foto" wix-data="wixData" remove-enabled="true" ' +
                       'gallery-type="photos" height="40px" width="1000px" initial-tab="my" on-image-pick="onImagePick">' +
                       '</wix-image-picker>';

            elm = $compile(html)(scope);

            scope.$digest();
        }));

        it("should make sure that the directive compiled successfully.", function() {
            expect(elm).toBeDefined();

            var directiveScope = elm.isolateScope();
            expect(directiveScope).toBeDefined();
        });

        it("should open the media gallery to pick an image on click", inject(function(editorCommands) {
            var directiveScope = elm.isolateScope();
            spyOn(editorCommands, 'executeCommand');

            directiveScope.handleClick();

            var params = {
                openCommand: 'panel',
                componentName: 'WPhoto',
                galleryConfigID: 'photos',
                selectionType: 'single',
                publicMediaFile: 'photos',
                i18nPrefix: 'single_image',
                mediaType: "picture",
                hasPrivateMedia: null,
                callback: directiveScope._callback,
                startingTab: scope.initialTab
            };
            expect(editorCommands.executeCommand).toHaveBeenCalledWith('WEditorCommands.OpenMediaFrame', params);
        }));

        it("should open the media gallery in the 'my'x'photos' section when no galleryType and no initial Tab is given",
            inject(function($compile, editorCommands) {
            var html = '<wix-image-picker label="Chooze foto" wix-data="wixData" remove-enabled="true" ' +
                'height="40px" width="1000px" on-image-pick="onImagePick">' +
                '</wix-image-picker>';

            elm = $compile(html)(scope);

            scope.$digest();


            var directiveScope = elm.isolateScope();
            spyOn(editorCommands, 'executeCommand');

            directiveScope.handleClick();

            var params = {
                openCommand: 'panel',
                componentName: 'WPhoto',
                galleryConfigID: 'photos',
                selectionType: 'single',
                publicMediaFile: 'photos',
                i18nPrefix: 'single_image',
                mediaType: "picture",
                hasPrivateMedia: null,
                callback: directiveScope._callback,
                startingTab: scope.initialTab
            };
            expect(editorCommands.executeCommand).toHaveBeenCalledWith('WEditorCommands.OpenMediaFrame', params);
        }));

        it("should trigger the onImagePick callback when picking an image", function() {
            var directiveScope = elm.isolateScope();
            spyOn(directiveScope, 'onImagePick');

            var rawData = {"propA": "A", "propB": 2};
            directiveScope._callback(rawData);

            _.forOwn(rawData, function(value, key) {
                expect(directiveScope.wixData[key]).toBe(value);
            });
            expect(directiveScope.onImagePick).toHaveBeenCalledWith({rawData: rawData});
        });
    });
});