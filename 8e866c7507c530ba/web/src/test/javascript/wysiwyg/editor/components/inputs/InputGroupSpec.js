describe('wysiwyg.editor.components.inputs.InputGroup', function()
{

    beforeEach(function()
    {
        this.easyCreateComponent = function(useCollapseButton, collapseAtStart)
        {
            this.compArgs1 = {
                useCollapseButton: useCollapseButton,
                collapseAtStart: collapseAtStart,
                createFieldsFunc: function(){
                    this.addInputField("Input #1");
                }
            };

            W.Components.createComponent(
                'wysiwyg.editor.components.inputs.InputGroup',
                'mock.skins.InputGroupMockSkin',
                undefined,
                this.compArgs1,
                null,
                function(logic)
                {
                    this.comp = logic;
                    this.isComplete = true;
                }.bind(this)
            ).insertInto(getPlayGround());


        }
    });

    describe('Checking useCollapseButton property', function()
    {
        it('should be a collapsible group', function()
        {
            this.easyCreateComponent(true, false);
            waitsFor(function()
            {
              return this.isComplete;
            }.bind(this), 'InputGroup component creation', 1500);
            runs(function()
            {
                expect(this.comp._useCollapseButton).toBeEquivalentTo(true);
                //expect(this.comp._skinParts.button.getViewNode().isCollapsed()).toBeEquivalentTo(false);

            });
        });

        it('should not be a collapsible group', function()
        {
            this.easyCreateComponent(false, false);
            waitsFor(function()
            {
              return this.isComplete;
            }.bind(this), 'InputGroup component creation', 1500);
            runs(function()
            {
                expect(this.comp._useCollapseButton).toBeEquivalentTo(false);
//                expect(this.comp._skinParts.button.getViewNode().isCollapsed()).toBeEquivalentTo(true);

            });
        });
    });


    describe('Checking collapseAtStart property', function()
    {
        it('should be collapsed at start', function()
        {
            this.easyCreateComponent(true, true);
            waitsFor(function()
            {
              return this.isComplete;
            }.bind(this), 'InputGroup component creation', 1000);
            runs(function()
            {
                expect(this.comp._collapseAtStart).toBeEquivalentTo(true);
                expect(this.comp._skinParts.content.isCollapsed()).toBeEquivalentTo(true);
            });
        });

    });

    describe('Checking toggleCollapseState method', function()
    {
        it('should collpse the content, when collapsing and uncolapsing', function()
        {
            this.easyCreateComponent(true, false);
            waitsFor(function()
            {
              return this.isComplete;
            }.bind(this), 'InputGroup component creation', 1000);
            runs(function()
            {
                expect(this.comp._skinParts.content.isCollapsed()).toBeEquivalentTo(false);
                expect(this.comp._skinParts.content.getChildren()[0].   isCollapsed()).toBeEquivalentTo(false);

                this.comp.toggleCollapseState();
                expect(this.comp._skinParts.content.isCollapsed()).toBeEquivalentTo(true);
                expect(this.comp._skinParts.content.getChildren()[0].isCollapsed()).toBeEquivalentTo(true);

                this.comp.toggleCollapseState();
                expect(this.comp._skinParts.content.isCollapsed()).toBeEquivalentTo(false);
                expect(this.comp._skinParts.content.getChildren()[0].isCollapsed()).toBeEquivalentTo(false);

            });
        });

    // General component tests
    ComponentsTestUtil.runBasicComponentTestSuite('wysiwyg.editor.components.inputs.InputGroup', 'mock.skins.InputGroupMockSkin',  '', {'componentReadyTimeout':1000});

    });


});
