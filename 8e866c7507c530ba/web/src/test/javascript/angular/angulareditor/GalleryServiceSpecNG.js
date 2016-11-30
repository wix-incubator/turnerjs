describe('Unit: Gallery Service', function() {
    'use strict';

    var galleryService;
    var editorComponent, editorCommands;

    beforeEach(module('editorInterop'));
    beforeEach(module('angularEditor'));

    beforeEach(inject(function(_galleryService_) {
        galleryService = _galleryService_;
    }));

    beforeEach(inject(function(_editorComponent_, _editorCommands_) {
        editorComponent = _editorComponent_;
        editorCommands  = _editorCommands_;
    }));

    describe('Gallery Service tests -', function() {
        it("should ensure that the service is defined.", function() {
            expect(galleryService).toBeDefined();
            expect(editorComponent).toBeDefined();
        });

        it("should be able to open the dialog for changing galleries.", function() {
            spyOn(W.Editor, 'getEditedComponent').and.returnValue("MyComponent!");
            spyOn(editorCommands, 'executeCommand');
            var editedComponent = editorComponent.getEditedComponent();
            var params = {selectedComp: editedComponent};

            galleryService.openChangeGalleryDialog();

            expect(editorCommands.executeCommand).toHaveBeenCalledWith('WEditorCommands.OpenChangeGalleryDialog', params);
        });

        it("should be able to open organize images dialog(media gallery) in a certain tab for a certain type.", function() {
            var imagesList = ['1.png', 'wix.jpg'];
            spyOn(editorComponent,'getEditedComponent').and.returnValue({getDataItem: function() {
                return imagesList;
            }});
            spyOn(editorCommands, 'executeCommand');

            var params = {
                data: imagesList,
                galleryConfigID: 'clipArt',
                startingTab: 'tab123',
                source: 'mySource'
            };

            galleryService.openOrganizeImages('clipArt', 'tab123', "mySource");

            expect(editorCommands.executeCommand).toHaveBeenCalledWith('WEditorCommands.OpenListEditDialog', params);
        });

        it("should be able to open organize images dialog(media gallery) with the my images tab by default", function() {
            var imagesList = ['1.png', 'wix.jpg'];
            spyOn(editorComponent,'getEditedComponent').and.returnValue({getDataItem: function() {
                return imagesList;
            }});
            spyOn(editorCommands, 'executeCommand');

            var params = {
                data: imagesList,
                galleryConfigID: 'clipArt',
                startingTab: 'my',
                source: 'NO_SOURCE_SPECIFIED'
            };

            galleryService.openOrganizeImages('clipArt');

            expect(editorCommands.executeCommand).toHaveBeenCalledWith('WEditorCommands.OpenListEditDialog', params);
        });
    });
});