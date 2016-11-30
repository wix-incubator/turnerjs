describe('PositionChange', function() {

    beforeEach(function() {
        this.module = W.UndoRedoManager._positionData;
        var _compPredicate = ComponentsTestUtil.registerEmptyComponentAndSkin("test.comp.DummyComp", "test.skin.DummySkin", {});

        waitsFor(function() {
            return _compPredicate();
        }, 'DummyComp failed', 20);

        runs(function() {
            this.compNode = W.Components.createComponent("test.comp.DummyComp", "test.skin.DummySkin", null, null, null /* wixify */, function(logic) {
                this.compLogic = logic;
            }.bind(this));
        });

        waitsFor(function() {
            return this.compLogic != undefined;
        }.bind(this), "components to be ready", 100);
    });

    it('should undo component coordinates', function() {
        spyOn(this.module, '_getComp').andReturn(this.compLogic);

        var changeData = {
            oldCoordinates: {x:1, y:2},
            newCoordinates: {x:101, y:102},
            changedComponentIds: ['id']
        };
        this.compLogic.setX(changeData.newCoordinates.x);
        this.compLogic.setY(changeData.newCoordinates.y);

        this.module.undo(changeData);

        expect(this.compLogic.getX()).toEqual(changeData.oldCoordinates.x);
        expect(this.compLogic.getY()).toEqual(changeData.oldCoordinates.y);
    });

    it('should undo component dimensions', function() {
        spyOn(this.module, '_getComp').andReturn(this.compLogic);

        var changeData = {
            oldDimensions: {w:5, h:5}, // 5 is default minimum in base component
            newDimensions: {w:103, h:104},
            changedComponentIds: ['id']
        };

        this.compLogic.setWidth(changeData.newDimensions.w);
        this.compLogic.setHeight(changeData.newDimensions.h);

        this.module.undo(changeData);

        expect(this.compLogic.getWidth()).toEqual(changeData.oldDimensions.w);
        expect(this.compLogic.getHeight()).toEqual(changeData.oldDimensions.h);
    });

    it('should redo component coordinates', function() {
        spyOn(this.module, '_getComp').andReturn(this.compLogic);

        var changeData = {
            oldCoordinates: {x:1, y:2},
            newCoordinates: {x:101, y:102},
            changedComponentIds: ['id']
        };

        this.compLogic.setX(changeData.oldCoordinates.x);
        this.compLogic.setY(changeData.oldCoordinates.y);

        this.module.redo(changeData);

        expect(this.compLogic.getX()).toEqual(changeData.newCoordinates.x);
        expect(this.compLogic.getY()).toEqual(changeData.newCoordinates.y);
    });

    it('should redo component dimensions', function() {
        spyOn(this.module, '_getComp').andReturn(this.compLogic);

        var changeData = {
            oldDimensions: {w:5, h:5}, // 5 is default minimum in base component
            newDimensions: {w:103, h:104},
            changedComponentIds: ['id']
        };

        this.compLogic.setWidth(changeData.oldDimensions.w);
        this.compLogic.setHeight(changeData.oldDimensions.h);

        this.module.redo(changeData);

        expect(this.compLogic.getWidth()).toEqual(changeData.newDimensions.w);
        expect(this.compLogic.getHeight()).toEqual(changeData.newDimensions.h);
    });
});