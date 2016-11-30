describe( 'ToolBarDropDown', function(){
    testRequire().
        components('wysiwyg.editor.components.richtext.ToolBarDropDown');

    it("should not have describes with no tests!", function(){ expect('test').not.toBe('empty'); });

    xdescribe('ToolBar', function(){

    beforeEach(function(){
        this.args = {
            numberOfColumns: 1,
            singleOptionInfo: {compType: 'wysiwyg.editor.components.WButton', compSkin: 'wysiwyg.editor.skins.buttons.ButtonFPPActionSkin'},
            command: 'fontSize',
            selectCompName: '',
            width: '110px'
        };
        var viewNode = new Element('dropDownMenu_node');
        this.dropDownMenu = new this.ToolBarDropDown('toolBarId', viewNode, this.args);
        this.dropDownMenu._skinParts = {options: {addEvent: function(){}, getViewNode: function() {return new Element('optionsViewNode')}, setDataItem: function(){}, getDataItem: function(){}},
                                        select: {addEvent: function(){}, setParameters: function(){}},
                                        label: new Element('labelId')};

    });

    it("should start listening to events on select and options skinpart nodes and set dropdown's label", function() {
        spyOn(this.dropDownMenu, '_addListenersToSelectEvents');
        spyOn(this.dropDownMenu, '_addListenersToOptionsEvents');
        spyOn(this.dropDownMenu, '_setDropDownLabel');

        this.dropDownMenu._onAllSkinPartsReady();

        expect(this.dropDownMenu._addListenersToSelectEvents).toHaveBeenCalled();
        expect(this.dropDownMenu._addListenersToOptionsEvents).toHaveBeenCalled();
        expect(this.dropDownMenu._setDropDownLabel).toHaveBeenCalled();
    });

    it("should call parent and setDataItem on options if data field is not 'selected ", function() {
        spyOn(this.dropDownMenu, 'parent');
        spyOn(this.dropDownMenu._skinParts.options, 'setDataItem');
        var dataItem = {}

        this.dropDownMenu._onDataChange(dataItem);

        expect(this.dropDownMenu.parent).toHaveBeenCalledWith(dataItem, undefined, undefined);
        expect(this.dropDownMenu._skinParts.options.setDataItem).toHaveBeenCalledWith(dataItem);
    });

    it("should not call parent and setDataItem on options if data field is 'selected ", function() {
        spyOn(this.dropDownMenu, 'parent');
        spyOn(this.dropDownMenu._skinParts.options, 'setDataItem');
        var dataItem = {}
        var field = 'selected';

        this.dropDownMenu._onDataChange(dataItem, 'selected');

        expect(this.dropDownMenu.parent).not.toHaveBeenCalled();
        expect(this.dropDownMenu._skinParts.options.setDataItem).not.toHaveBeenCalled();
    });

    it("should call '_onSelectionChanged' when option is clicked", function() {
        spyOn(this.dropDownMenu, '_onSelectionChanged');
//        spyOn(this.dropDownMenu, 'getSelectedOption').andReturn({isDefault: false});
        var event = {target: ''};

        this.dropDownMenu._onOptionClick(event);

        expect(this.dropDownMenu._onSelectionChanged).toHaveBeenCalledWith(event.target);
    });

    it("should call '_onSelectionChanged' with event target", function() {
        var selectedOption = {a: ''};
        spyOn(this.dropDownMenu, 'getSelectedOption').andReturn(selectedOption);
        spyOn(this.dropDownMenu, 'setSelected');
        spyOn(this.dropDownMenu, 'fireEvent');
        spyOn(this.dropDownMenu, '_onBlur');
        var data = {};

        this.dropDownMenu._onSelectionChanged(data);

        expect(this.dropDownMenu.getSelectedOption).toHaveBeenCalled();
        expect(this.dropDownMenu.setSelected).toHaveBeenCalledWith(selectedOption);
        expect(this.dropDownMenu.fireEvent).toHaveBeenCalledWith('change', data);
        expect(this.dropDownMenu._onBlur).toHaveBeenCalled();
    });


    it ("should set selected option parameters, set the focus to the element and update the 'selected' data field", function() {
        var currOptionViewNode = {focus: function(){}};
        var selectedOptionData = {get: function(){}};
        var b = {set: function(){}};
        spyOn(this.dropDownMenu, '_setSelectedOptionParameters');
        spyOn(this.dropDownMenu, 'getCurrentOptionViewNode').andReturn(currOptionViewNode);
        spyOn(currOptionViewNode, 'focus');
        spyOn(this.dropDownMenu._skinParts.options, 'getDataItem').andReturn(b);
        spyOn(b, 'set');

        this.dropDownMenu.setSelected(selectedOptionData);

        expect(this.dropDownMenu._setSelectedOptionParameters).toHaveBeenCalledWith(selectedOptionData);
        expect(this.dropDownMenu.getCurrentOptionViewNode).toHaveBeenCalledWith(selectedOptionData);
        expect(currOptionViewNode.focus).toHaveBeenCalled();
        expect(this.dropDownMenu._skinParts.options.getDataItem).toHaveBeenCalled();
        expect(b.set).toHaveBeenCalledWith('selected', selectedOptionData);
    });

    it ("should set the label parameter to the 'select' skinpart", function() {
        this.dropDownMenu._selectionOption = 0;
        var selectedOptionData = {get: function(){}};
        var a = {};
        spyOn(this.dropDownMenu._skinParts.select, 'setParameters');
        spyOn(selectedOptionData, 'get').andReturn(a);

        this.dropDownMenu._setSelectedOptionParameters(selectedOptionData);

        expect(this.dropDownMenu._skinParts.select.setParameters).toHaveBeenCalledWith({label: a});
        expect(this.dropDownMenu._skinParts.select.setParameters).toHaveBeenCalledXTimes(1);
        expect(selectedOptionData.get).toHaveBeenCalledWith('label');
    });

    it("should set inline-block display to the field", function() {
        var field = new Element('elem_node');
        this.dropDownMenu._numberOfColumns = 2;
        var buttonWidth = Math.floor(this.dropDownMenu._width/this.dropDownMenu._numberOfColumns);
        spyOn(field, 'setStyle');

        this.dropDownMenu._setButtonFieldStyle(field);

        expect(field.setStyle).toHaveBeenCalledWith('display', 'inline-block');
    });
    });

    describeExperiment('Fonts & Character Sets', function() {

        testRequire().components('wysiwyg.editor.components.richtext.ToolBarDropDown');

        beforeEach(function(){
            this.args = {
                numberOfColumns: 1,
                singleOptionInfo: {compType: 'wysiwyg.editor.components.WButton', compSkin: 'wysiwyg.editor.skins.buttons.ButtonFPPActionSkin'},
                command: 'fontSize',
                selectCompName: '',
                width: '110px'
            };

            var viewNode = new Element('dropDownMenu_node');
            this.dropDownMenu = new this.ToolBarDropDown('toolBarId', viewNode, this.args);
            this.dropDownMenu._skinParts = {options: {addEvent: function(){}, getViewNode: function() {return new Element('optionsViewNode')}, setDataItem: function(){}, getDataItem: function(){}},
                select: {addEvent: function(){}, setParameters: function(){}},
                label: new Element('labelId')};

        });

        describe('_onDropDownItemsReady', function(){
            it('should fire the dropDownReady event only after it has set _optionNodes to the newly supplied value', function(){
                var payload = {'elements': ['e1', 'e2', 'e3']};
                var _optionNodesHasBeenSetBeforeEventFiring = false;
                this.dropDownMenu._optionNodes = [];

                spyOn(this.dropDownMenu, 'fireEvent').andCallFake(function(){
                    _optionNodesHasBeenSetBeforeEventFiring = this.dropDownMenu._optionNodes === payload.elements;
                }.bind(this));
                spyOn(this.dropDownMenu, '_setOptionStyle');

                this.dropDownMenu._onDropDownItemsReady(payload);

                expect(this.dropDownMenu.fireEvent).toHaveBeenCalledWith('dropDownReady');
                expect(_optionNodesHasBeenSetBeforeEventFiring).toBeTruthy();
            });
        });

    });
});