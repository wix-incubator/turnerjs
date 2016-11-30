describe('Anchor', function() {
    testRequire()
        .components('wysiwyg.common.components.anchor.viewer.Anchor')
        .classes('core.managers.components.ComponentBuilder')
        .resources('W.Data', 'W.ComponentLifecycle', 'W.Commands', 'W.Preview');

    function createComponent(){
        var that = this,
            builder = new this.ComponentBuilder(document.createElement('div'));

        this.componentLogic = null;
        this.mockDataId = 'dummyId';
        this.mockData = this.W.Data.createDataItem({
            name: 'Anchor-1',
            compId: '',
            type: 'Anchor',
            id: this.mockDataId
        });
        this.mockProps = this.W.Data.createDataItem({});

        builder
            .withType('wysiwyg.common.components.anchor.viewer.Anchor')
            .withSkin('wysiwyg.common.components.anchor.viewer.skins.AnchorSkin')
            .withData(this.mockData)
            .onWixified(function (component) {
                that.componentLogic = component;
                that.componentLogic.setComponentProperties(that.mockProps);
            })
            .create();
    }

    beforeEach(function (){
        createComponent.call(this);

        waitsFor(function () {
            return this.componentLogic !== null;
        }, 'Anchor component to be ready', 1000);
    });

    describe('Component structure', function () {

        it('Skin parts should be defined', function () {
            var skinParts = this.componentLogic._skinParts;

            expect(skinParts.line).toBeDefined();
            expect(skinParts.anchorFrame).toBeDefined();
            expect(skinParts.anchorName).toBeDefined();
        });

    });

    describe('Component functionality', function () {

        it('should change anchor text if data "name" is changed', function(){
            var expectedText = "this is a test",
                calculatedText;

            spyOn(this.componentLogic, '_isNewAnchor').andReturn(false);
            this.componentLogic._data.set('name', expectedText);
            this.ComponentLifecycle["@testRenderNow"](this.componentLogic);
            calculatedText = this.componentLogic._skinParts.anchorName.get('text');

            expect(calculatedText).toBe(expectedText);

        });

        it("should be visible when in editor", function(){
            var expectedVisibility = 'visible',
                calculatedVisibility;

            spyOn(this.componentLogic, 'isInViewer').andReturn(false);
            this.componentLogic._toggleVisibility();
            calculatedVisibility = this.componentLogic.getState('visibility');

            expect(calculatedVisibility).toBe(expectedVisibility);
        });

        it("should NOT be visible when in viewer", function(){
            var expectedVisibility = 'hidden',
                calculatedVisibility;

            spyOn(this.componentLogic, 'isInViewer').andReturn(true);
            this.componentLogic._toggleVisibility();
            calculatedVisibility = this.componentLogic.getState('visibility');

            expect(calculatedVisibility).toBe(expectedVisibility);
        });
    });
});

describe('AnchorManager', function() {
    testRequire()
        .classes('wysiwyg.common.utils.AnchorManager')
        .resources('W.Data', 'W.Commands');

    beforeEach(function (){
        this._anchorManager = new this.AnchorManager({addEvent: function(){}});

        waitsFor(function () {
            return this._anchorManager !== null;
        }, 'AnchorManager to be ready', 1000);
    });

    describe('AnchorManager anchor counter', function () {

        it('Should start with 0 anchors', function () {
            var expectedAnchorCount = 0,
                calculatedAnchorCount = this._anchorManager.getNumberOfAnchors();

            expect(expectedAnchorCount).toBe(calculatedAnchorCount);
        });

        it('Should increase count when told to do so', function () {
            var expectedAnchorCount = 3,
                calculatedAnchorCount;

            this._anchorManager.increaseNumberOfAnchors();
            this._anchorManager.increaseNumberOfAnchors();
            this._anchorManager.increaseNumberOfAnchors();
            calculatedAnchorCount = this._anchorManager.getNumberOfAnchors();

            expect(expectedAnchorCount).toBe(calculatedAnchorCount);
        });

    });

    describe('AnchorManager scroll mechanism', function () {

        it('Should scroll to location 0 when AnchroDataId is SCROLL_TO_TOP', function(){
            var expectedYOffset = 0,
                calculatedYOffset;

            sessionStorage.setItem('anchorDataId', 'SCROLL_TO_TOP');
            this._anchorManager._scrollToLocation(100).then(function(animationData){
                calculatedYOffset = animationData.offset;
                expect(expectedYOffset).toBe(calculatedYOffset);
            });
        });

        it('Should scroll to document.body.scrollHeight when AnchroDataId is SCROLL_TO_BOTTOM', function(){
            var expectedYOffset = document.body.scrollHeight,
                calculatedYOffset;

            sessionStorage.setItem('anchorDataId', 'SCROLL_TO_BOTTOM');
            this._anchorManager._scrollToLocation(100).then(function(animationData){
                calculatedYOffset = animationData.offset;
                expect(expectedYOffset).toBe(calculatedYOffset);
            });
        });

        it("Should scroll to anchor's location when AnchroDataId is not in (SCROLL_TO_BOTTOM, SCROLL_TO_TOP)", function(){
            var expectedYOffset = 50,
                calculatedYOffset;

            spyOn(this._anchorManager, '_calculateAnchorYOffset').andReturn(50);

            sessionStorage.setItem('anchorDataId', 'mockAnchorDataId');
            this._anchorManager._scrollToLocation(100).then(function(animationData){
                calculatedYOffset = animationData.offset;
                expect(expectedYOffset).toBe(calculatedYOffset);
            });

        });


    });
});