describe('VerticalMenu', function() {
	testRequire()
        .components('wysiwyg.common.components.verticalmenu.viewer.VerticalMenu');

    function createComponent(){
        this.componentLogic = new this.VerticalMenu('testCompId', new Element('div'));
    }

    beforeEach(function (){
        createComponent.call(this);

        waitsFor(function () {
            return this.componentLogic !== null;
        }, 'Vertical Menu component to be ready', 1000);
    });


    describe('Sub-menu open side (left/right)', function () {
        beforeEach(function (){
            this.spies = [
                spyOn(this.componentLogic, 'setState')
            ];
        });

        afterEach(function (){
            _.forEach(this.spies, function (spy) {
                spy.reset();
            });
        });

        it('should open sub-menu to the LEFT when the subMenuOpenSide property is set to left', function() {
            spyOn(this.componentLogic,'getComponentProperties').andReturn({
                "get": function() { return 'left'; }
            });

            this.componentLogic._setSideToOpenSubMenu();

            expect(this.componentLogic.setState).toHaveBeenCalledWith('subMenuOpenSide-left', 'subMenuOpenSide');
        });

        it('should open sub-menu to the RIGHT when the subMenuOpenSide property is set to right', function() {
            spyOn(this.componentLogic,'getComponentProperties').andReturn({
                "get": function() { return 'right'; }
            });

            this.componentLogic._setSideToOpenSubMenu();

            expect(this.componentLogic.setState).toHaveBeenCalledWith('subMenuOpenSide-right', 'subMenuOpenSide');
        });
    });

    describe('Sub-menu open direction (up/down)', function () {
        beforeEach(function (){
            this.spies = [
                spyOn(this.componentLogic, '_getScreenHeight').andReturn(768),
                spyOn(this.componentLogic, 'getHeight').andReturn(200),
                spyOn(this.componentLogic, 'setState')
            ];
        });

        afterEach(function (){
            _.forEach(this.spies, function (spy) {
                spy.reset();
            });
        });

        it('should open sub-menu DOWNWARDS when the component is on the TOP half of the screen', function () {
            this.spies.push(
                spyOn(this.componentLogic, 'getGlobalPosition').andReturn({ y: 100 })  //Component is on the TOP half of the screen
            );

            this.componentLogic._setDirectionToOpenSubMenu();

            expect(this.componentLogic.setState).toHaveBeenCalledWith('subMenuOpenDir-down', 'subMenuOpenDirection');
        });

        it('should open sub-menu UPWARDS when the component is on the BOTTOM half of the screen', function () {
            this.spies.push(
                spyOn(this.componentLogic, 'getGlobalPosition').andReturn({ y: 500 })  //Component is on the BOTTOM half of the screen
            );

            this.componentLogic._setDirectionToOpenSubMenu();

            expect(this.componentLogic.setState).toHaveBeenCalledWith('subMenuOpenDir-up', 'subMenuOpenDirection');
        });
    });

});