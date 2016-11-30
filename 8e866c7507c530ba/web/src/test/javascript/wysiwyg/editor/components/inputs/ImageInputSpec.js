describe('wysiwyg.editor.components.inputs.ImageInput', function() {
    testRequire().
        resources('W.UndoRedoManager', 'W.Data').
        components('wysiwyg.editor.components.inputs.ImageInput');


    beforeEach(function() {

        define.skin('test.ButtonBaseSkin', function(def){
            def.inherits('mobile.core.skins.BaseSkin');
            def.html(
                '<div skinpart="icon"></div>' +
                    '<div skinpart="label"></div>'
            );
        });

        define.skin('test.ImageNewSkin', function(def){
            def.inherits('mobile.core.skins.BaseSkin');
            def.html(
                '<label skinpart="label">' +
                    '</label>' +
                    '<div class="imageButtonsPosition">' +
                    '<div skinpart="imageContainer">' +
                    '<div skinPart="image">' +
                    '</div>' +
                    '</div>' +
                    '<div class="buttonsContainer">' +
                    '<div skinpart="changeButton">' +
                    '</div>' +
                    '<div skinpart="deleteButton">' +
                    '</div>' +
                    '</div>' +
                    '</div>');
        });

        define.skin('test.ImageInputSkin', function(def){
            def.inherits('mobile.core.skins.BaseSkin');
            def.html(
                '<label skinpart="label"></label>' +
                    '<div class="imageButtonsPosition">' +
                    '<div skinpart="imageContainer">' +
                    '<div skinPart="image" skin="test.ImageNewSkin"></div>' +
                    '</div>' +
                    '<div class="buttonsContainer">' +
                    '<div skinpart="changeButton" skin="test.ButtonBaseSkin"></div>' +
                    '<div skinpart="deleteButton" skin="test.ButtonBaseSkin"></div>' +
                    '</div>' +

                    '</div>'
            );
        });

        this.testImageSkin = '';
        W.Components.createComponent(
            'wysiwyg.editor.components.inputs.ImageInput',
            'test.ImageInputSkin',
            undefined,
            {labelText: ''},
            null,
            function(logic){
                this.testInput = logic;
                this.isComplete = true;
                this.testInput.setDataItem(W.Data.createDataItem({
                    type: 'Image',
                    uri: '',
                    width: 123,
                    height: 456,
                    title: '',
                    borderSize: '',
                    description: ''
                }));
            }.bind(this)
        );

        waitsFor( function(){
            return this.isComplete;
        }.bind(this),
            'ImageInput component creation',
            1000);



    });

    describe('ImageInput Public Functions', function(){
        describe('setValue', function(){
            it('should set the ImageInput field value', function(){
                var imageData = {
                    type: 'Image',
                    uri: 'uri',
                    width: 456,
                    height: 789,
                    title: 'title',
                    borderSize: '',
                    description: ''
                };

                this.testInput.setValue(imageData);

                var rawData = this.testInput._data.getData();
                expect(rawData.type, 'Data Type').toBeEquivalentTo(imageData.type);
                expect(rawData.uri, 'Image Uri').toBeEquivalentTo(imageData.uri);
                expect(rawData.width, 'Image Width').toBeEquivalentTo(imageData.width);
                expect(rawData.height, 'Image Height').toBeEquivalentTo(imageData.height);
                expect(rawData.title, 'Image Title').toBeEquivalentTo(imageData.title);
                expect(rawData.borderSize, 'Image Border').toBeEquivalentTo(imageData.borderSize);
                expect(rawData.description, 'Image Description').toBeEquivalentTo(imageData.description);
                //~expect(this.testInput._skinParts.image.getDataItem().getData()).toBeEquivalentTo(imageData);
            });
        });
        describe('getValue', function(){
            it('should get the ImageInput field value', function(){
                var imageData = {
                    type: 'Image',
                    uri: 'uri',
                    width: 456,
                    height: 789,
                    title: 'title',
                    borderSize: '',
                    description: ''
                };
                this.testInput.setValue(imageData);
                expect(this.testInput.getValue(), 'Image Object').toBeEquivalentTo(imageData);
            });
        });
        describe('setButton', function(){
            it('should set the ImageInput button text', function(){
                var value = 'Changed Value';
                this.testInput.setButton(value);
                expect(this.testInput._skinParts.changeButton._label, 'Button Text').toBe(value);
            });
        });

    });
    describe('ImageInput Private Functions', function(){
        it('should change the current image according to the new data', function(){
            var data = {
                type: 'Image',
                uri: 'http://test.com',
                width: 123,
                height: 456,
                title: 'image title',
                //borderSize: '',
                description: ''
            };
            spyOn(this.W.UndoRedoManager, 'startTransaction');
            spyOn(this.W.UndoRedoManager, 'endTransaction');
            spyOn(this.W.Data, 'createDataItem').andCallThrough();
            this.testInput._onImgSelect(data);
            expect(this.W.Data.createDataItem).toHaveBeenCalledWith(data);
        });
        describe('_changeEventHandler', function(){
            it('should fire a custom "inputChanged" event with the value set to an image data item', function(){
                spyOn(this.testInput, 'fireEvent');
                var imageData = {
                    type: 'Image',
                    uri: 'uri',
                    width: 345,
                    height: 678,
                    title: 'title',
                    borderSize: '',
                    description: ''
                };
                this.testInput.setValue(imageData);
                var e = {};
                var event = {value: imageData, origEvent: e, compLogic: this.testInput};
                this.testInput._changeEventHandler(e);
                expect(this.testInput.fireEvent).toHaveBeenCalledWith('inputChanged', event);
            });
        });
    });
});