describe('LayoutChange', function() {
    beforeEach(function() {

        this.module = W.UndoRedoManager._layoutData;
        var _compPredicate = ComponentsTestUtil.registerEmptyComponentAndSkin("test.comp.DummyComp", "test.skin.DummySkin", {});

        waitsFor(function() {
            return _compPredicate();
        }, 'DummyComp failed', 20);

        runs(function() {
            this.compNode0 = W.Components.createComponent("test.comp.DummyComp", "test.skin.DummySkin", null, null, null /* wixify */, function(logic) {
                this.compLogic0 = logic;
            }.bind(this));

            this.compNode1 = W.Components.createComponent("test.comp.DummyComp", "test.skin.DummySkin", null, null, null /* wixify */, function(logic) {
                this.compLogic1 = logic;
            }.bind(this));

            this.compNode2 = W.Components.createComponent("test.comp.DummyComp", "test.skin.DummySkin", null, null, null /* wixify */, function(logic) {
                this.compLogic2 = logic;
            }.bind(this));
        });

        waitsFor(function() {
            var comp0 = this.compLogic0 != undefined;
            var comp1 = this.compLogic1 != undefined;
            var comp2 = this.compLogic2 != undefined;

            return (comp0 && comp1 && comp2);
        }, "components to be ready", 100);

        runs(function() {
            var mockAnchor_0to1 = {
                toComp: this.compLogic1,
                fromComp: this.compLogic0
            };

            var mockAnchor_2to1 = {
                toComp: this.compLogic1,
                fromComp: this.compLogic2
            };

            this.compLogic0.setAnchors([mockAnchor_0to1]);
            this.compLogic2.setAnchors([mockAnchor_2to1]);
        });
    });

    it('should build component anchor structure as expected (inner specs verification)', function(){
        var comp0AnchorsToCompId = this.compLogic0.getAnchors()[0].toComp.getComponentId();
        var comp2AnchorsToCompId = this.compLogic2.getAnchors()[0].toComp.getComponentId();

        var comp0Id = this.compLogic0.getComponentId();
        var comp1Id = this.compLogic1.getComponentId();
        var comp2Id = this.compLogic2.getComponentId();

        // comp0 -> comp1
        expect(comp0AnchorsToCompId).toEqual(comp1Id);
        expect(this.compLogic0.getAnchors().length).toEqual(1);
        // comp2 -> comp1
        expect(comp2AnchorsToCompId).toEqual(comp1Id);
        expect(this.compLogic2.getAnchors().length).toEqual(1);
        // comp1 anchors back to comp0 and comp2
        expect(this.compLogic1.getReverseAnchors().length).toEqual(2);
    });

    it('should remove reverse anchors from components and referenced components', function() {
        this.module._removeSingleAnchorFromTargetComponent(this.compLogic0.getAnchors()[0]);

        var comp1ReversedAnchorId = this.compLogic1.getReverseAnchors()[0].fromComp.getComponentId();
        var comp2Id = this.compLogic2.getComponentId();

        expect(comp1ReversedAnchorId).toBe(comp2Id);
    });

    it('should replace component anchors', function() {
        var mockAnchor_0to2 = {
            toComp: this.compLogic2,
            fromComp: this.compLogic0
        };

        this.module._replaceComponentAnchors(this.compLogic0, [mockAnchor_0to2]);

        var comp0AnchorsToCompId = this.compLogic0.getAnchors()[0].toComp.getComponentId();
        var comp2AnchorsFromCompId = this.compLogic2.getReverseAnchors()[0].fromComp.getComponentId();

        var comp0AnchorsLength = this.compLogic0.getAnchors().length;

        var comp2Id = this.compLogic2.getComponentId();
        var comp0Id = this.compLogic0.getComponentId();

        // comp0 anchor to comp2
        expect(comp0AnchorsToCompId).toEqual(comp2Id);
        // comp2 anchor back from comp0
        expect(comp2AnchorsFromCompId).toEqual(comp0Id);
        // comp0 has only one anchor (to comp2)
        expect(comp0AnchorsLength).toEqual(1);
        // comp2 has only 1 reverse anchor (to comp0)
        expect(this.compLogic2.getReverseAnchors().length).toEqual(1);
        // comp1 has only 1 reverse anchor (to comp2)
        expect(this.compLogic1.getReverseAnchors().length).toEqual(1);
    });
});