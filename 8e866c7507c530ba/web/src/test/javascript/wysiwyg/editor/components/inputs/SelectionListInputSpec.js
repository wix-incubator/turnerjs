describe('SelectionListInput', function() {

    testRequire().
        components('wysiwyg.editor.components.inputs.SelectionListInput');

    beforeEach(function()
    {

        var rawData = {
            type:'list',
            items:[
                {'a1':'111', 'a2':'222'},
                {'a1':'333', 'a2':'444'}
            ]
        };

        this.dataProvider1 = W.Data.createDataItem(rawData);
        this.comp1 = "wysiwyg.editor.components.panels.StaticPalettePanel";
        this.skin1 = "wysiwyg.editor.skins.panels.StaticPalettePanelSkin";

        this.MockDataItemClassDef = new MockBuilder('Data')
            .extendClass('core.managers.data.DataItemBase')
            .getClass();
        this.rawData = {items: []};
        this.mockDataItem = new this.MockDataItemClassDef(this.rawData, W.Data);


        this.easyCreateComponent = function(repeaterComp, repeaterSkin, dataProvider)
        {

            this.args = {
                repeaterArgs:{
                    type: repeaterComp,
                    skin: repeaterSkin
                },
                dataProvider: dataProvider,
                labelText: ""
            };

            W.Components.createComponent(
                'wysiwyg.editor.components.inputs.SelectionListInput',
                'wysiwyg.editor.skins.inputs.SelectionListInputSkin',
                undefined,
                this.args,
                null,
                function(logic)
                {
                    this.comp = logic;
                    this.isComplete = true;
                }.bind(this)

            );
        }
    });

    describe('component logic', function()
    {
        define.dataSchema("testList", {a1:'string', a2:'string'});
        beforeEach(function()
        {
            this.easyCreateComponent(this.comp1, this.skin1, this.dataProvider1);
            waitsFor(function()
            {
                return this.isComplete;
            }.bind(this), 'SelectionListInput component creation', 1500);
        });

        it('should call the setValue method when a click event is called', function()
        {
            spyOn(this.comp, 'setValue');
            spyOn(this.comp, '_updateSelection');
            this.comp._onRepeaterClick({target:{getLogic:function(){}},
                    'data':{getData: function() {return {'a1':'555', 'a2':'666'};}}});
            expect(this.comp.setValue).toHaveBeenCalled();
        });//

        it('should change the value, when repeaters are clicked', function()
        {
            spyOn(this.comp, '_updateSelection');
            this.comp._onRepeaterClick({target:{getLogic:function(){}},
                    'data':{getData: function() {return {'a1':'555', 'a2':'666'};}}});
            
            expect(this.comp.getValue()['a1']).toBe('555');
            expect(this.comp.getValue()['a2']).toBe('666');
        });

        it('should have the same number of repeaters as exist in the dataProvider', function()
        {
            //the structure should be: collection->inline-group->repeater1,repeater2
            expect(this.comp._skinParts.collection.getChildren().length).toBe(1);
            expect(this.comp._skinParts.collection.getChildren()[0].getChildren().length).toBe(2);
            expect(this.comp._getComps().length).toBe(2);
        });
        
        it('should change its value when the bounded data changes', function()
        {
            var rawDataToBeBounded = {
                type:'testList',
                'a1':'777',
                'a2':'888'
            };
            var boundedDataItem = W.Data.createDataItem(rawDataToBeBounded);

            //bind the component to a DataItem
            this.comp.bindToDataItemAndFilterFromDataProvider(boundedDataItem);
            expect(this.comp.getValue()['a1']).toBe('777');
            expect(this.comp.getValue()['a2']).toBe('888');

            //now change the dataItem, and check that the component changes as well:
            boundedDataItem.set('a1','999');
            expect(this.comp.getValue()['a1']).toBe('999');
            expect(this.comp.getValue()['a2']).toBe('888');
        });

        it('should change the bounded data when its value changes', function()
        {
            var rawDataToBeBounded = {
                type:'testList',
                'a1':'777',
                'a2':'888'
            };
            var boundedDataItem = W.Data.createDataItem(rawDataToBeBounded);

            //bind the component to a DataItem
            this.comp.bindToDataItemAndFilterFromDataProvider(boundedDataItem);

            //now change the component's value, and check that the bounded data changes as well:
            this.comp.setValue({'a1':'aaa', 'a2':'bbb'});
            expect(boundedDataItem.get('a1')).toBe('aaa');
            expect(boundedDataItem.get('a2')).toBe('bbb');
        });



    });

//        describe('',function(){
//
//        it('',function(){
//
//        });
//
//        it('',function(){
//
//        });
//
//        it('',function(){
//
//        });
//
//    });

    /**
     * run the generic test on both possible dataProvider inputs: dataRef and DataItem:
     */
    describe('Generic component tests', function()
    {
        //a. run when dataProvider is DataRef:
        ComponentsTestUtil.runBasicComponentTestSuite('wysiwyg.editor.components.inputs.SelectionListInput',
            'wysiwyg.editor.skins.inputs.SelectionListInputSkin',
            '',
            {
                'componentReadyTimeout':1000,
                'additionalArgs':{
                    repeaterArgs:{
                        'type': 'wysiwyg.editor.components.panels.StaticPalettePanel',
                        'skin': 'wysiwyg.editor.skins.panels.StaticPalettePanelSkin'
                    },

                    'dataProvider': '#COLOR_PALETTES'
                }
            });


        //b. run when dataProvider is DataItem:
        var rawData = {
            type:'list',
            items:[
                {'a1':'111', 'a2':'222'},
                {'a1':'333', 'a2':'444'}
            ]
        };

        ComponentsTestUtil.runBasicComponentTestSuite('wysiwyg.editor.components.inputs.SelectionListInput',
            'wysiwyg.editor.skins.inputs.SelectionListInputSkin',
            '',
            {
                'componentReadyTimeout':1000,
                'additionalArgs':{
                    'repeaterArgs':{
                        'type': 'wysiwyg.editor.components.panels.StaticPalettePanel',
                        'skin': 'wysiwyg.editor.skins.panels.StaticPalettePanelSkin'
                    },
                    'dataProvider': W.Data.createDataItem(rawData)
                }
            });

    });
});