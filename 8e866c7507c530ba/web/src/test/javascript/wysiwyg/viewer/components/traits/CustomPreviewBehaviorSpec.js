describe('CustomPreviewBehavior', function () {
    testRequire().
        classes('wysiwyg.viewer.components.traits.CustomPreviewBehavior');

    describe("overlay element tests", function () {
        beforeEach(function () {
            this.customPreviewBehaviorClass = new this.CustomPreviewBehavior();
            this.createMockOverlayElement = function(){
                this.customPreviewBehaviorClass._overlayElement = new Element('A');
            };
        });

        it('should create a new overlay element', function(){
            expect(this.customPreviewBehaviorClass._overlayElement).toBeUndefined();
            this.customPreviewBehaviorClass._createOverlayElement();
            expect(this.customPreviewBehaviorClass._overlayElement).toBeDefined();
        });

        it('overlay element should be of type "A"', function(){
            this.customPreviewBehaviorClass._createOverlayElement();

            expect(this.customPreviewBehaviorClass._overlayElement.outerHTML).toBe('<a></a>');
        });

        it('overlay element should be bound to a click event handler', function(){
            this.createMockOverlayElement();
            spyOn(this.customPreviewBehaviorClass._overlayElement,'addEvent');

            this.customPreviewBehaviorClass._bindOverlayElementEvents();

            expect(this.customPreviewBehaviorClass._overlayElement.addEvent).toHaveBeenCalledWith('click', jasmine.any(Function));
        });

        it('should execute "CustomPreviewBehavior.interact" command when clicking on the overlay element', function(){
            var expectedCommandName='CustomPreviewBehavior.interact',
                actualCommandName='';
            this.createMockOverlayElement();
            spyOn(this.customPreviewBehaviorClass.resources.W.Commands,'executeCommand').andCallFake(function(commandName){
                actualCommandName=commandName;
            });

            this.customPreviewBehaviorClass._bindOverlayElementEvents();
            this.customPreviewBehaviorClass._overlayElement.click();

            expect(expectedCommandName).toEqual(actualCommandName);
        });

        it('should get the urls used in styles from topology', function(){
            this.createMockOverlayElement();
            spyOn(this.customPreviewBehaviorClass.resources.W.Config,'getServiceTopologyProperty');

            this.customPreviewBehaviorClass._createOverlayElementStyles();

            expect(this.customPreviewBehaviorClass.resources.W.Config.getServiceTopologyProperty).toHaveBeenCalled();
        });

        it('should be able to detect that overlay element already exists', function(){
            expect(this.customPreviewBehaviorClass._overlayElementExists()).toBe(false);
            this.createMockOverlayElement();
            expect(this.customPreviewBehaviorClass._overlayElementExists()).toBe(true);
        });

        it('overlay element should be created only when in preview mode', function(){
            spyOn(this.customPreviewBehaviorClass,'_isPreviewMode').andCallFake(function(){
                return false;
            });
            spyOn(this.customPreviewBehaviorClass,'_createOverlayElement');

            this.customPreviewBehaviorClass._createClickOverlayForPreviewMode();

            expect(this.customPreviewBehaviorClass._createOverlayElement).not.toHaveBeenCalled();
        });

        it('overlay element should be created only if it doesn\'t exists already', function(){
            spyOn(this.customPreviewBehaviorClass,'_overlayElementExists').andCallFake(function(){
                return true;
            });
            spyOn(this.customPreviewBehaviorClass,'_createOverlayElement');

            this.customPreviewBehaviorClass._createClickOverlayForPreviewMode();

            expect(this.customPreviewBehaviorClass._createOverlayElement).not.toHaveBeenCalled();
        });

    });
});