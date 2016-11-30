describe('PropertyChangeSpec', function() {
    testRequire().
        components('core.components.Container').
        resources('W.Editor', 'W.Utils', 'W.UndoRedoManager', 'W.Preview');



    beforeEach(function() {
        this.module = this.W.UndoRedoManager._compPropData;
        this.module.resources.W.Editor = this.W.Editor;
        this.containerComponent = new this.Container('mockId', new Element('div'), {});
        this.EditedComponentMock = new MockBuilder('EditedComponentMock').mockClass(this.Container).getClass();
        spyOn(this.W.Editor, 'getEditedComponent').andReturn(this.containerComponent);
        spyOn(this.containerComponent, 'getComponentId').andReturn('anotherSomeId');
        spyOn(this.W.Preview, 'getPreviewManagers').andReturn(W);

        this.changeDataReport = {
            type: "wysiwyg.editor.managers.undoredomanager.PropertyChange",
            changedComponentIds: ["anotherSomeId"],
            sender: null,
            dataItemId: "someId",
            newValue: {key:"value2"},
            oldValue: {key:"value1"}
        };

        define.dataSchema("testList", {key:'string'});

    });

    it('should create a changeData object _onDataChange with old values and new values', function(){
        spyOn(this.module, '_reportChange').andReturn();

        var dataObj = W.Data.createDataItem({id: 'someId', type: 'list'});
        var newValue = {key:"value2"};
        var oldValue = {key:"value1"};


        var changeData = this.module._onDataChange(dataObj, newValue, oldValue);

        expect(changeData).toEqual(this.changeDataReport);
    });

    it('should report change', function(){
        var dataObj = W.Data.createDataItem({id:'someId', type:'list'});
        var newValue = {key:"value2"};
        var oldValue = {key:"value1"};

        spyOn(this.module, '_reportChange');

        var changeData = this.module._onDataChange(dataObj, newValue, oldValue);

        expect(this.module._reportChange).toHaveBeenCalledWith(this.changeDataReport);
    });

//    it('should change new value to old value on a DataItem upon UNDO', function() {
//        var dataItemId = "someId";
//        var oldValue = {key: "oldValue"};
//        var newValue = {key: "newValue"};
//        var dataObj = W.Data.createDataItem({id:dataItemId, type:'testList'});
//        spyOn(this.module, '_getDataItemById').andReturn(dataObj);
//        spyOn(this.W.Utils, 'getComponentLogicFromDomByAttribute').andReturn("id");
//
//        dataObj.set('key', newValue.key);
//        var changeData = this.module._onDataChange(dataObj, newValue, oldValue);
//        this.module.undo(changeData);
//
//        expect(dataObj.getData().key).toEqual(oldValue.key);
//    });
//
//    it('should change old value to new value on a DataItem upon REDO', function() {
//        var dataItemId = "someId";
//        var oldValue = {key: "oldValue"};
//        var newValue = {key: "newValue"};
//        var dataObj = W.Data.createDataItem({id:dataItemId, type:'testList'});
//        spyOn(this.module, '_getDataItemById').andReturn(dataObj);
//        spyOn(this.W.Utils, 'getComponentLogicFromDomByAttribute').andReturn("id");
//
//        dataObj.set('key', oldValue.key);
//        var changeData = this.module._onDataChange(dataObj, newValue, oldValue);
//        this.module.redo(changeData);
//
//        expect(dataObj.getData().key).toEqual(newValue.key);
//    });

    it('should change new value to old value on a DataItem upon UNDO', function() {
        var dataItemId = "someId";
        var oldValue = {key: "oldValue"};
        var newValue = {key: "newValue"};
        var dataObj = W.Data.createDataItem({id:dataItemId, type:'testList'});
        spyOn(this.module, '_getDataItemById').andReturn(dataObj);
        spyOn(this.W.Preview, 'getCompLogicBySelector').andReturn("id");
        spyOn(this.W.Preview, 'getCompLogicById').andReturn(null);

        dataObj.set('key', newValue.key);
        var changeData = this.module._onDataChange(dataObj, newValue, oldValue);
        this.module.undo(changeData);

        expect(dataObj.getData().key).toEqual(oldValue.key);
    });

    it('should change old value to new value on a DataItem upon REDO', function() {
        var dataItemId = "someId";
        var oldValue = {key: "oldValue"};
        var newValue = {key: "newValue"};
        var dataObj = W.Data.createDataItem({id:dataItemId, type:'testList'});
        spyOn(this.module, '_getDataItemById').andReturn(dataObj);
        spyOn(this.W.Preview, 'getCompLogicBySelector').andReturn("id");
        spyOn(this.W.Preview, 'getCompLogicById').andReturn(null);

        dataObj.set('key', oldValue.key);
        var changeData = this.module._onDataChange(dataObj, newValue, oldValue);
        this.module.redo(changeData);

        expect(dataObj.getData().key).toEqual(newValue.key);
    });
});